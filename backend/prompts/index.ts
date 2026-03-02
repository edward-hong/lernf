/**
 * Central registry of all AI prompts used in the application.
 * All prompt engineering should happen in the backend, not frontend.
 *
 * Frontend sends structured data; backend constructs all prompts.
 */

export { buildNpcSystemPrompt, encodeBehaviorTraits } from './npcPrompt'
export type { PersonaDefinition, BehaviorParameters } from './npcPrompt'
export { buildIntentAnalysisPrompt } from './intentPrompt'
export { buildGripEvaluationPrompt } from './gripEvaluationPrompt'
export { buildEvaluateCompletionPrompt } from './evaluateCompletionPrompt'
export { buildConsequenceGenerationPrompt } from './consequencePrompt'
export { buildGeneratePrPrompt, GENERATE_PR_SYSTEM_PROMPT } from './generatePrPrompt'

/**
 * Prompt versioning for tracking changes
 */
export const PROMPT_VERSIONS = {
  npc: '2.0',        // Anti-solving instructions, backend-built
  intent: '1.0',     // 6-dimension behavioral scoring
  grip: '1.0',       // Full GRIP rubric with historical spectrum
  completion: '1.0', // Scenario completion detection
  consequence: '1.0', // GRIP-connected consequence generation
  generatePr: '1.0', // Code review exercise generation
}
