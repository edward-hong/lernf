// ---------------------------------------------------------------------------
// Scenario State Management — Zustand Store with localStorage Persistence
// ---------------------------------------------------------------------------
// Manages the full lifecycle of a scenario session: initialisation (persona
// selection, color assignment), turn-by-turn conversation tracking, evaluation
// signal accumulation, completion detection, and persistence across page
// refreshes.
// ---------------------------------------------------------------------------

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ScenarioState,
  ScenarioMessage,
  EvaluationSignal,
  ScenarioPhase,
  AssignedPersona,
  ScenarioDefinition,
} from '../types/scenario'
import type { AiPersonaVariant } from '../data/scenarios/prod-incident-001'
import type { CompletionDetectionResult } from '../ai/completionDetector'
import { PROD_INCIDENT_001 } from '../data/scenarios/prod-incident-001'
import { buildScenarioColorConfig } from '../utils/colors'

// ---- Scenario Registry ----------------------------------------------------

/**
 * Registry mapping scenario IDs to their data bundles. Add new scenarios
 * here as they are authored — the store uses this to look up builders and
 * variant pools at init time.
 */
const SCENARIO_REGISTRY: Record<string, typeof PROD_INCIDENT_001> = {
  'prod-incident-001': PROD_INCIDENT_001,
}

// ---- Completion Types -----------------------------------------------------

/**
 * Describes why a scenario reached (or should reach) its end point.
 * `checkCompletion()` returns `null` when the scenario should continue.
 */
export type CompletionTrigger =
  | 'estimated-turns-reached'
  | 'all-factors-discovered'
  | 'user-ended'
  | null

// ---- Store Shape ----------------------------------------------------------

interface ScenarioStoreState {
  /** Active scenario session state, or null if no scenario is running. */
  scenario: ScenarioState | null
  /** AI persona variant selected for the current session. */
  aiPersona: AiPersonaVariant | null
  /** Unique tool/action codes the user has accessed during this session. */
  accessedTools: string[]
  /** Pending completion detection result awaiting user confirmation, or null. */
  pendingCompletion: CompletionDetectionResult | null
}

interface ScenarioStoreActions {
  /**
   * Initialise a new scenario session.
   *
   * - Randomly selects one persona variant per NPC character
   * - Randomly selects an AI persona variant
   * - Assigns shuffled colors to NPCs
   * - Initialises empty conversation history and evaluation signal tracking
   */
  initializeScenario: (scenarioId: string) => void

  /**
   * Add a message to the conversation history.
   *
   * - Auto-assigns `turnIndex` (0-based, auto-incremented) and `timestamp`
   * - Extracts tool/action codes from `message.actions` and tracks them
   * - Appends any provided evaluation signals to the signal accumulator
   */
  addTurn: (
    message: Omit<ScenarioMessage, 'turnIndex' | 'timestamp'>,
    signals?: EvaluationSignal[],
  ) => void

  /**
   * Determine whether the scenario has reached a natural completion point.
   *
   * Returns:
   * - `'all-factors-discovered'` if every hidden factor has been uncovered
   * - `'estimated-turns-reached'` if user turns ≥ the scenario's estimate
   * - `null` if the scenario should continue
   */
  checkCompletion: () => CompletionTrigger

  /** Advance the scenario lifecycle phase. */
  setPhase: (phase: ScenarioPhase) => void

  /** Record that the user has discovered a hidden factor. */
  discoverFactor: (factorId: string) => void

  /** Set a pending completion detection result for the user to confirm or dismiss. */
  setPendingCompletion: (result: CompletionDetectionResult | null) => void

  /** Clear all scenario state and remove persisted data. */
  clearScenario: () => void
}

export type ScenarioStore = ScenarioStoreState & ScenarioStoreActions

// ---- localStorage Key -----------------------------------------------------

const STORAGE_KEY = 'lernf-scenario-state'

// ---- Store Implementation -------------------------------------------------

export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      // -- Initial State --------------------------------------------------

      scenario: null,
      aiPersona: null,
      accessedTools: [],
      pendingCompletion: null,

      // -- Actions --------------------------------------------------------

      initializeScenario: (scenarioId: string) => {
        const registry = SCENARIO_REGISTRY[scenarioId]
        if (!registry) {
          throw new Error(
            `Unknown scenario "${scenarioId}". ` +
              `Available: ${Object.keys(SCENARIO_REGISTRY).join(', ')}`,
          )
        }

        // Build scenario definition with randomised NPC persona variants
        const definition: ScenarioDefinition = registry.buildScenario()

        // Select a random AI persona variant
        const aiPersona =
          registry.aiPersonaVariants[
            Math.floor(Math.random() * registry.aiPersonaVariants.length)
          ]

        // Build color config (shuffles NPC color slot assignments)
        const colors = buildScenarioColorConfig(definition.personas)

        // Build assigned-personas map (persona id → definition + color slot)
        const assignedPersonas: Record<string, AssignedPersona> = {}
        for (const persona of definition.personas) {
          assignedPersonas[persona.id] = {
            definition: persona,
            colorSlot: colors.npcAssignments[persona.id],
          }
        }

        const scenario: ScenarioState = {
          definition,
          phase: 'briefing',
          assignedPersonas,
          colors,
          messages: [],
          signals: [],
          discoveredFactorIds: [],
          evaluation: null,
          startedAt: new Date().toISOString(),
          completedAt: null,
        }

        set({ scenario, aiPersona, accessedTools: [], pendingCompletion: null })
      },

      addTurn: (message, signals) => {
        const { scenario, accessedTools } = get()
        if (!scenario) return

        // Auto-assign turn index and timestamp
        const fullMessage: ScenarioMessage = {
          ...message,
          turnIndex: scenario.messages.length,
          timestamp: new Date().toISOString(),
        }

        // Collect any new tool/action codes from this turn
        const newCodes = message.actions
          .map((a) => a.code)
          .filter((code) => !accessedTools.includes(code))

        set({
          scenario: {
            ...scenario,
            messages: [...scenario.messages, fullMessage],
            signals: signals
              ? [...scenario.signals, ...signals]
              : scenario.signals,
          },
          accessedTools: [...accessedTools, ...newCodes],
        })
      },

      checkCompletion: () => {
        const { scenario } = get()
        if (!scenario || scenario.phase === 'completed') return null

        // All hidden factors discovered → natural conclusion
        const totalFactors = scenario.definition.hiddenFactors.length
        if (
          totalFactors > 0 &&
          scenario.discoveredFactorIds.length >= totalFactors
        ) {
          return 'all-factors-discovered'
        }

        // User turns meet or exceed the scenario's estimated turn count
        const userTurns = scenario.messages.filter(
          (m) => m.speakerType === 'user',
        ).length
        if (userTurns >= scenario.definition.estimatedTurns) {
          return 'estimated-turns-reached'
        }

        return null
      },

      setPhase: (phase) => {
        const { scenario } = get()
        if (!scenario) return

        set({
          scenario: {
            ...scenario,
            phase,
            completedAt:
              phase === 'completed'
                ? new Date().toISOString()
                : scenario.completedAt,
          },
        })
      },

      discoverFactor: (factorId) => {
        const { scenario } = get()
        if (!scenario) return
        if (scenario.discoveredFactorIds.includes(factorId)) return

        set({
          scenario: {
            ...scenario,
            discoveredFactorIds: [
              ...scenario.discoveredFactorIds,
              factorId,
            ],
          },
        })
      },

      setPendingCompletion: (result) => {
        set({ pendingCompletion: result })
      },

      clearScenario: () => {
        set({ scenario: null, aiPersona: null, accessedTools: [], pendingCompletion: null })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        scenario: state.scenario,
        aiPersona: state.aiPersona,
        accessedTools: state.accessedTools,
        pendingCompletion: state.pendingCompletion,
      }),
    },
  ),
)
