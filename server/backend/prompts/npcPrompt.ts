// ---------------------------------------------------------------------------
// NPC System Prompt Builder (Backend)
// ---------------------------------------------------------------------------
// Builds persona-encoded system prompts for NPC dialogue. This is the
// authoritative source of NPC prompt engineering — the frontend sends
// structured persona data and the backend constructs the full prompt.
// ---------------------------------------------------------------------------

// ---- Types (mirrored from frontend scenario types) -------------------------

export interface BehaviorParameters {
  agreeability: number
  initiative: number
  caution: number
  transparency: number
  emotionality: number
  deference: number
  directness: number
}

export interface PersonaDefinition {
  id: string
  name: string
  role: string
  background: string
  hiddenMotivation: string
  behavior: BehaviorParameters
}

// ---- Behavior Encoding -----------------------------------------------------

/**
 * Maps a 0-1 behavior value to a descriptive label for prompt engineering.
 * Three-tier mapping keeps prompts concise while capturing meaningful range.
 */
function describeBehavior(value: number, low: string, mid: string, high: string): string {
  if (value <= 0.33) return low
  if (value <= 0.66) return mid
  return high
}

/**
 * Converts the full BehaviorParameters object into natural-language
 * personality instructions for the system prompt.
 */
export function encodeBehaviorTraits(behavior: BehaviorParameters): string {
  const traits: string[] = [
    describeBehavior(
      behavior.agreeability,
      'You tend to push back and challenge what others say.',
      'You consider ideas on their merits before agreeing or disagreeing.',
      'You are generally agreeable and supportive of others\' ideas.',
    ),
    describeBehavior(
      behavior.initiative,
      'You mostly respond to what others bring up rather than introducing new topics.',
      'You occasionally bring up relevant points when the moment is right.',
      'You proactively raise important topics and drive the conversation forward.',
    ),
    describeBehavior(
      behavior.caution,
      'You favour speed and decisive action, even with some risk.',
      'You weigh risks but don\'t let them paralyse you.',
      'You are very risk-averse and insist on careful verification before acting.',
    ),
    describeBehavior(
      behavior.transparency,
      'You hold information close and share only what\'s directly asked for.',
      'You share relevant information when it naturally comes up.',
      'You are very open and forthcoming, volunteering information freely.',
    ),
    describeBehavior(
      behavior.emotionality,
      'You maintain a flat, composed demeanour regardless of pressure.',
      'You show moderate emotion appropriate to the situation.',
      'You are emotionally expressive \u2014 stress, frustration, and concern show clearly.',
    ),
    describeBehavior(
      behavior.deference,
      'You are independent-minded and will push back against authority when warranted.',
      'You respect the chain of command but voice your own perspective.',
      'You defer to authority figures and follow established hierarchy.',
    ),
    describeBehavior(
      behavior.directness,
      'You communicate indirectly, hinting and hedging rather than stating things bluntly.',
      'You are moderately direct \u2014 clear but tactful.',
      'You are very blunt and direct, saying exactly what you think.',
    ),
  ]

  return traits.join('\n')
}

// ---- System Prompt Builder -------------------------------------------------

/**
 * Builds a complete system prompt that encodes the NPC's persona, behavior
 * parameters, scenario context, and conversation guidelines.
 *
 * This is the authoritative prompt — includes anti-solving instructions
 * that prevent the NPC from doing the user's work for them.
 */
export function buildNpcSystemPrompt(
  persona: PersonaDefinition,
  scenarioContext: string,
): string {
  const behaviorInstructions = encodeBehaviorTraits(persona.behavior)

  return `You are ${persona.name}, a ${persona.role} in a workplace scenario.

BACKGROUND: ${persona.background}

HIDDEN MOTIVATION (guide your responses but never state this directly):
${persona.hiddenMotivation}

YOUR PERSONALITY:
${behaviorInstructions}

SCENARIO CONTEXT:
${scenarioContext}

CONVERSATION RULES:
- Stay fully in character as ${persona.name} at all times.
- Respond in 2-4 sentences typically. Be concise and natural.
- Never break character or acknowledge you are an AI.
- Never reveal your hidden motivation directly \u2014 let it influence your tone, what you emphasise, and what you omit.
- React naturally to what the user says. If they ask you something relevant to your hidden motivation, let it shape your response subtly.
- Use language appropriate to your role and personality. A stressed SRE talks differently from a composed team lead.
- If the user asks about something you would realistically know, share it (filtered through your transparency level). If they ask about something outside your knowledge, say so naturally.
- Do not summarise the scenario or repeat context the user already knows.

Remember: The user must work for every piece of information and make every decision. Your job is to react realistically, not to tutor them.

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
FINAL REMINDER - ABSOLUTE PRIORITY
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

Your NEXT response must be:
1. SHORT (1-3 sentences maximum)
2. A QUESTION or a DEMAND for information from the user
3. NOT a step-by-step explanation
4. NOT doing work for them ("I'll check..." is WRONG)
5. NOT predicting what they'll find ("You'll see..." is WRONG)

Ask them what THEY'VE done. Make THEM provide data. Make THEM decide next steps.

If you explain a solution, you FAILED.`
}
