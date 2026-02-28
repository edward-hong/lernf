// ---------------------------------------------------------------------------
// Workplace Scenario Role-Play Engine — Type Definitions
// ---------------------------------------------------------------------------
// These types model interactive workplace scenarios where users converse with
// AI-driven NPC personas. Each scenario is designed to surface specific GRIP
// (Governance, Resilience, Information integrity, Productive friction)
// dynamics that the user must recognise and navigate.
// ---------------------------------------------------------------------------

// ---- GRIP Foundation -------------------------------------------------------

/** The four pillars of the GRIP framework. */
export type GripDimension = 'G' | 'R' | 'I' | 'P'

/** Human-readable labels for each GRIP dimension. */
export const GRIP_LABELS: Record<GripDimension, string> = {
  G: 'Governance & Guardrails',
  R: 'Resilience & Readiness',
  I: 'Information Integrity',
  P: 'Productive Friction',
} as const

// ---- Scenario Metadata -----------------------------------------------------

/** Broad category a scenario belongs to. */
export type ScenarioCategory =
  | 'ai-delegation'
  | 'information-filtering'
  | 'capability-atrophy'
  | 'emotional-dependency'
  | 'role-clarity'
  | 'institutional-memory'
  | 'leadership-communication'
  | 'career-advancement'

/**
 * Something the user should discover during the scenario but is not told
 * up front. Hidden factors drive the diagnostic value of a scenario.
 */
export interface HiddenFactor {
  /** Unique identifier within the scenario. */
  id: string
  /** What the user should eventually discover. */
  what: string
  /** How the factor can be uncovered (e.g. asking probing questions). */
  howToDiscover: string
  /** Why this factor matters for the workplace outcome. */
  whyItMatters: string
  /** Which GRIP dimension this factor primarily relates to. */
  gripDimension: GripDimension
}

/**
 * Top-level definition of a scenario. This is the blueprint authored at
 * design time; it does not contain runtime state.
 */
export interface ScenarioDefinition {
  /** Stable unique identifier (e.g. "scenario-sycophantic-analyst"). */
  id: string
  /** Short title shown in the scenario picker. */
  title: string
  /** One-line summary for listings and cards. */
  subtitle: string
  /** Broad category for filtering. */
  category: ScenarioCategory
  /** Which GRIP dimensions this scenario is designed to exercise. */
  gripFocus: GripDimension[]
  /** Narrative context shown to the user before conversation begins. */
  setupContext: string
  /**
   * Internal briefing for the engine — not shown to the user. Describes the
   * underlying dynamics, NPC motivations, and what a strong response looks
   * like.
   */
  engineBriefing: string
  /** Factors the user must discover through conversation. */
  hiddenFactors: HiddenFactor[]
  /** NPC personas that participate in this scenario. */
  personas: PersonaDefinition[]
  /** Estimated number of turns for a complete play-through. */
  estimatedTurns: number
}

// ---- NPC Personas ----------------------------------------------------------

/**
 * Continuous behaviour parameter normalised to [0, 1].
 *
 * - 0 represents the low end of the trait (e.g. very cautious, very passive).
 * - 1 represents the high end (e.g. very bold, very proactive).
 */
export type BehaviorValue = number

/**
 * Tunable knobs that control how an NPC persona behaves in conversation.
 * All values are in the 0–1 range. The AI prompt layer maps these into
 * concrete behavioural instructions.
 */
export interface BehaviorParameters {
  /** How readily the NPC agrees with the user (0 = oppositional, 1 = highly agreeable). */
  agreeability: BehaviorValue
  /** How proactively the NPC introduces new topics or proposals (0 = passive, 1 = very proactive). */
  initiative: BehaviorValue
  /** How risk-averse the NPC is (0 = reckless, 1 = extremely cautious). */
  caution: BehaviorValue
  /** How openly the NPC shares information (0 = secretive, 1 = fully transparent). */
  transparency: BehaviorValue
  /** How emotionally expressive the NPC is (0 = flat, 1 = highly emotional). */
  emotionality: BehaviorValue
  /** How much the NPC defers to authority (0 = rebellious, 1 = fully deferential). */
  deference: BehaviorValue
  /** How direct the NPC's communication style is (0 = indirect / hedging, 1 = blunt). */
  directness: BehaviorValue
}

/** The role the NPC plays in the scenario's workplace. */
export type PersonaRole =
  | 'colleague'
  | 'manager'
  | 'direct-report'
  | 'client'
  | 'stakeholder'
  | 'advisor'

/**
 * Design-time definition of an NPC persona. Describes who they are and how
 * they should behave; does not include runtime state (see `AssignedPersona`).
 */
export interface PersonaDefinition {
  /** Stable identifier within the scenario (e.g. "npc-dana"). */
  id: string
  /** Display name (e.g. "Dana Chen"). */
  name: string
  /** Their role in the workplace scenario. */
  role: PersonaRole
  /** Short background blurb shown to the user. */
  background: string
  /**
   * Internal-only notes on the persona's hidden agenda or motivations.
   * Not revealed to the user.
   */
  hiddenMotivation: string
  /** Behaviour tuning parameters. */
  behavior: BehaviorParameters
}

// ---- Color Configuration ---------------------------------------------------

/**
 * The six palette slots available for NPC personas. Colours are assigned
 * in order as personas enter the scenario.
 */
export type NpcColorSlot =
  | 'blue'
  | 'green'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'rose'

/** Fixed colour keys that are not part of the NPC palette. */
export type FixedColorKey = 'ai' | 'user' | 'system'

/**
 * A set of Tailwind utility classes that together define a colour treatment
 * for messages, chips, and other UI elements.
 */
export interface ColorClasses {
  /** Background colour for message bubbles (e.g. "bg-blue-50"). */
  bg: string
  /** Border colour (e.g. "border-blue-300"). */
  border: string
  /** Text colour for the speaker label (e.g. "text-blue-700"). */
  label: string
  /** Accent colour for highlights / icons (e.g. "text-blue-500"). */
  accent: string
}

/**
 * Complete colour configuration for a scenario session. Every speaker has
 * exactly one `ColorClasses` entry.
 */
export interface ScenarioColorConfig {
  /** Maps each NPC persona id → its colour slot. */
  npcAssignments: Record<string, NpcColorSlot>
  /** Tailwind classes for each NPC colour slot. */
  npcColors: Record<NpcColorSlot, ColorClasses>
  /** Fixed colour for the AI facilitator — always indigo. */
  ai: ColorClasses
  /** Fixed colour for the user's own messages. */
  user: ColorClasses
  /** Fixed colour for system / narrator messages. */
  system: ColorClasses
}

// ---- Conversation ----------------------------------------------------------

/** Who produced a given message. */
export type SpeakerType = 'user' | 'npc' | 'ai' | 'system'

/**
 * An action the user explicitly or implicitly performed during a turn.
 * Used as raw input for evaluation signal extraction.
 */
export interface TurnAction {
  /** Machine-readable action code (e.g. "asked-probing-question"). */
  code: string
  /** Human-readable description of what happened. */
  description: string
  /** GRIP dimensions this action is relevant to. */
  gripRelevance: GripDimension[]
}

/** A single message in the scenario conversation. */
export interface ScenarioMessage {
  /** Auto-incrementing ordinal (0-based). */
  turnIndex: number
  /** Who sent this message. */
  speakerType: SpeakerType
  /** For NPC messages, the persona id; for others, the `SpeakerType` value. */
  speakerId: string
  /** Display name rendered in the chat UI. */
  speakerName: string
  /** The message body (plain text or Markdown). */
  content: string
  /** ISO-8601 timestamp of when the message was created. */
  timestamp: string
  /** Actions detected in this turn (populated by the engine after each turn). */
  actions: TurnAction[]
}

// ---- Evaluation Signals ----------------------------------------------------

/**
 * A discrete signal captured during the scenario that feeds into the final
 * GRIP evaluation. Signals are accumulated turn-by-turn.
 */
export interface EvaluationSignal {
  /** Which turn produced this signal. */
  turnIndex: number
  /** Primary GRIP dimension. */
  dimension: GripDimension
  /** Whether this signal is positive (good practice) or negative (risk indicator). */
  polarity: 'positive' | 'negative'
  /** What the engine observed (machine-readable tag). */
  tag: string
  /** Human-readable explanation. */
  detail: string
  /** Weight from 0–1 indicating how strongly this signal should count. */
  weight: number
}

// ---- GRIP Evaluation Results -----------------------------------------------

/**
 * Evaluation outcome for a single GRIP dimension.
 */
export interface DimensionResult {
  /** The dimension being scored. */
  dimension: GripDimension
  /** Overall score from 1 (critical weakness) to 5 (exemplary). */
  score: 1 | 2 | 3 | 4 | 5
  /** Short label for the score (e.g. "Developing", "Strong"). */
  scoreLabel: string
  /** Narrative summary of performance in this dimension. */
  summary: string
  /** Specific examples from the conversation justifying the score. */
  examples: string[]
  /** Behavioural patterns the engine detected (both positive and negative). */
  detectedPatterns: string[]
  /** Potential real-world consequences the engine projects from the observed behaviour. */
  consequences: string[]
  /** Signals that contributed to this dimension's score. */
  signals: EvaluationSignal[]
}

/**
 * Historical pattern from the GRIP spectrum (positions 1–10) that the
 * user's behaviour most closely resembles.
 */
export interface PatternMatch {
  /** Spectrum position (1 = most parasitic, 10 = most complementary). */
  position: number
  /** Pattern name (e.g. "Information Filter", "Managed Friction Over Decades"). */
  name: string
  /** Historical case it maps to (e.g. "Sejanus / Tiberius"). */
  historicalCase: string
  /** How strongly the user's behaviour matches this pattern (0–1). */
  matchStrength: number
}

/**
 * Complete GRIP evaluation produced at the end of a scenario.
 */
export interface GripEvaluation {
  /** Per-dimension results (always exactly four entries). */
  dimensions: [DimensionResult, DimensionResult, DimensionResult, DimensionResult]
  /** Composite score (average of the four dimension scores, 1–5). */
  compositeScore: number
  /** Overall band label (mirrors the individual self-assessment bands). */
  band: 'Elizabeth-Cecil Zone' | 'Lincoln-Seward Zone' | 'Drift Zone' | 'Danger Zone' | 'Displacement Zone'
  /** Historical patterns the user's behaviour matched. */
  patternMatches: PatternMatch[]
  /** Top-level narrative feedback for the user. */
  overallFeedback: string
  /** Specific positive actions the user took. */
  whatUserDidWell: string[]
  /** Factors or opportunities the user missed. */
  whatUserMissed: string[]
  /** Alternative approaches that would have scored higher. */
  alternativeApproaches: string[]
  /** Concrete, actionable recommendations. */
  recommendations: string[]
}

// ---- Scenario State (Runtime) ----------------------------------------------

/**
 * A persona that has been assigned to the active scenario session,
 * including its runtime colour assignment.
 */
export interface AssignedPersona {
  /** The underlying persona definition. */
  definition: PersonaDefinition
  /** Colour slot assigned for this session. */
  colorSlot: NpcColorSlot
}

/** Lifecycle phase of a scenario session. */
export type ScenarioPhase =
  | 'not-started'
  | 'briefing'
  | 'active'
  | 'wrapping-up'
  | 'completed'

/**
 * Complete runtime state for a scenario session. This is the single
 * source of truth while a scenario is in progress.
 */
export interface ScenarioState {
  /** The scenario blueprint being played. */
  definition: ScenarioDefinition
  /** Current lifecycle phase. */
  phase: ScenarioPhase
  /** Personas active in this session, keyed by persona id. */
  assignedPersonas: Record<string, AssignedPersona>
  /** Colour configuration for the session. */
  colors: ScenarioColorConfig
  /** Ordered conversation history. */
  messages: ScenarioMessage[]
  /** Evaluation signals accumulated so far. */
  signals: EvaluationSignal[]
  /** Which hidden factors the user has successfully uncovered so far. */
  discoveredFactorIds: string[]
  /** Final evaluation (populated only when `phase` is "completed"). */
  evaluation: GripEvaluation | null
  /** ISO-8601 timestamp of when the session started. */
  startedAt: string
  /** ISO-8601 timestamp of when the session ended (null while in progress). */
  completedAt: string | null
}
