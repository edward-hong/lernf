// ---------------------------------------------------------------------------
// Color Utilities — Shuffle & Assignment for Scenario Sessions
// ---------------------------------------------------------------------------
// Provides functions to shuffle the NPC color palette and assign colors to
// personas at scenario init. Call `buildScenarioColorConfig()` once when
// starting or replaying a scenario to get a fresh `ScenarioColorConfig`.
// ---------------------------------------------------------------------------

import type {
  NpcColorSlot,
  ScenarioColorConfig,
  PersonaDefinition,
} from '../types/scenario'
import {
  NPC_COLORS,
  NPC_COLOR_SLOTS,
  AI_COLOR,
  USER_COLOR,
  SYSTEM_COLOR,
} from '../constants/colors'

/**
 * Fisher-Yates shuffle. Returns a new array with elements in random order.
 * Does not mutate the input.
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Assigns a shuffled NPC color slot to each persona. The first N slots from
 * the shuffled palette are used (where N = number of personas, max 6).
 *
 * @param personaIds - Ordered array of persona IDs to assign colors to.
 * @returns A mapping of persona ID → NpcColorSlot.
 */
export function assignNpcColors(
  personaIds: readonly string[],
): Record<string, NpcColorSlot> {
  const shuffled = shuffleArray(NPC_COLOR_SLOTS)
  const assignments: Record<string, NpcColorSlot> = {}

  for (let i = 0; i < personaIds.length && i < shuffled.length; i++) {
    assignments[personaIds[i]] = shuffled[i]
  }

  return assignments
}

/**
 * Builds the complete `ScenarioColorConfig` for a scenario session.
 * Should be called at scenario init and again on replay to get a fresh
 * color shuffle.
 *
 * @param personas - The persona definitions assigned to this session.
 * @returns A full color config ready to store in `ScenarioState.colors`.
 */
export function buildScenarioColorConfig(
  personas: readonly PersonaDefinition[],
): ScenarioColorConfig {
  const personaIds = personas.map((p) => p.id)
  const npcAssignments = assignNpcColors(personaIds)

  return {
    npcAssignments,
    npcColors: NPC_COLORS,
    ai: AI_COLOR,
    user: USER_COLOR,
    system: SYSTEM_COLOR,
  }
}

/**
 * Convenience: looks up the `ColorClasses` for a given persona ID using
 * the scenario's color config. Returns `undefined` if the persona has no
 * assignment (should not happen in a well-initialised session).
 */
export function getPersonaColors(
  personaId: string,
  config: ScenarioColorConfig,
) {
  const slot = config.npcAssignments[personaId]
  return slot ? config.npcColors[slot] : undefined
}
