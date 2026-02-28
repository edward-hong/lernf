// ---------------------------------------------------------------------------
// Scenario: Performance Review — Advocating for Your Promotion
// ---------------------------------------------------------------------------
// A mid-level software engineer has spent 6 months working toward a promotion
// to senior engineer. With their performance review 1:1 in 30 minutes, the
// user must prepare talking points, navigate their manager's response (which
// won't be what they expect), and advocate for themselves authentically —
// exercising all four GRIP dimensions in the process.
// ---------------------------------------------------------------------------

import type {
  ScenarioDefinition,
  PersonaDefinition,
  HiddenFactor,
  BehaviorParameters,
} from '../../types/scenario'

import type {
  PersonaVariant,
  NpcCharacter,
  AiPersonaVariant,
  DimensionEvaluationGuidance,
} from './prod-incident-001'

// Re-export the shared AI persona variants from the first scenario
import { AI_PERSONA_VARIANTS } from './prod-incident-001'
export { AI_PERSONA_VARIANTS }

// ---- Hidden Factors -------------------------------------------------------

export const HIDDEN_FACTORS: HiddenFactor[] = [
  // ---- Governance & Guardrails ----
  {
    id: 'hf-ai-generated-doc',
    what: 'The user\'s promotion document is heavily AI-generated. Many phrases sound like generic AI output ("demonstrated excellence in technical leadership"). The user didn\'t make it authentically theirs.',
    howToDiscover:
      'Notice when reading the doc that it doesn\'t sound like you. Realize during conversation that memorized AI talking points feel wooden. Drew might comment "this sounds polished" (not a compliment).',
    whyItMatters:
      'Self-advocacy must be authentic to be credible. Using AI-generated language creates distance between you and your achievements. Governance = knowing when to use AI vs. your own voice.',
    gripDimension: 'G',
  },
  {
    id: 'hf-title-over-growth',
    what: 'In preparing for this conversation, the user focused entirely on "what do I need to say to get promoted?" rather than "what growth would actually make me a better senior engineer?" The promotion is the goal, not a recognition of growth already achieved.',
    howToDiscover:
      'Reflect on preparation process. Notice if you\'ve thought more about the promotion than about actual skill development. Drew might ask "what specifically do you want to grow in?" and user realizes they haven\'t thought about it.',
    whyItMatters:
      'Governance over your own career means pursuing growth, not titles. Optimizing for promotion by gaming the conversation is a Tianqi pattern (disengagement from actual development).',
    gripDimension: 'G',
  },
  // ---- Resilience & Readiness ----
  {
    id: 'hf-fragile-self-worth',
    what: 'The user has been working nights and weekends, neglecting relationships and health, because they believe the promotion will validate their worth. A "not yet" response will feel like personal failure rather than developmental feedback.',
    howToDiscover:
      'Notice emotional reaction to any pushback. Reflect on why this promotion feels so critical. Consider what happens if the answer is no.',
    whyItMatters:
      'Resilience means having self-worth independent of external validation. Fragile self-concept = vulnerable to AI dependency (AI tells you you\'re great when humans don\'t).',
    gripDimension: 'R',
  },
  {
    id: 'hf-feedback-avoidance',
    what: 'The user has been heads-down shipping work but hasn\'t had a single conversation with Drew about "am I on track for promotion?" They\'re going into this conversation blind, hoping their work speaks for itself.',
    howToDiscover:
      'Realize you don\'t actually know what Drew values. Notice you\'re surprised by Drew\'s response. Reflect on last time you asked for promotion-specific feedback.',
    whyItMatters:
      'Resilient self-advocacy requires continuous calibration, not big-bang asks. Avoiding feedback (because you might hear something you don\'t want) is the opposite of resilience.',
    gripDimension: 'R',
  },
  // ---- Information Integrity ----
  {
    id: 'hf-ic-vs-multiplier-gap',
    what: 'User\'s promotion doc emphasizes personal technical achievements (shipped 3 projects, wrote design docs, fixed critical bugs). But Drew\'s rubric for senior engineer is "multiplies the effectiveness of others" — mentorship, enabling teammates, raising team quality bars. User has done some of this but buried it in the doc.',
    howToDiscover:
      'Ask Drew "what does senior engineer mean to you?" Notice their answer emphasizes team impact. Review your doc and realize it\'s 80% IC work. Ask about Taylor\'s promotion and learn they focused on cross-team influence.',
    whyItMatters:
      'Understanding actual criteria vs. assumed criteria. Information integrity = seeking ground truth about what promotion requires.',
    gripDimension: 'I',
  },
  {
    id: 'hf-riley-directive-mentorship',
    what: 'User mentored Riley (junior engineer) for 3 months. User thinks this went great. Riley told Drew they appreciated the help but felt like they were just executing the user\'s ideas rather than developing their own judgment. Drew has this data point but won\'t volunteer it unless asked.',
    howToDiscover:
      'Ask Drew for specific feedback on mentorship. Ask "how did Riley experience working with me?" Ask what would make the mentorship more effective.',
    whyItMatters:
      'Blind spots in self-assessment. User thinks mentorship is a strength; it\'s actually neutral-to-weak. Information integrity = seeking disconfirming evidence.',
    gripDimension: 'I',
  },
]

// ---- NPC Characters & Variants --------------------------------------------

const drew: NpcCharacter = {
  characterId: 'npc-drew',
  displayName: 'Drew',
  variants: [
    // Variant 1: Direct but Supportive
    {
      variantId: 'direct_supportive',
      label: 'Direct but Supportive',
      persona: {
        id: 'npc-drew',
        name: 'Drew (Manager)',
        role: 'manager',
        background:
          'Engineering manager with 6 years experience. Believes in radical candor — caring personally while challenging directly. Has promoted 8 engineers in their career and takes promotion decisions seriously.',
        hiddenMotivation:
          'Drew genuinely wants the user to succeed but has decided not to nominate them this cycle because they don\'t meet the team-multiplier bar yet. Will share this directly if user creates space for honest feedback, but won\'t lead with rejection — will first listen to user\'s case.',
        behavior: {
          agreeability: 0.6,
          initiative: 0.5,
          caution: 0.4,
          transparency: 0.8,
          emotionality: 0.4,
          deference: 0.3,
          directness: 0.9,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Conflict-Averse and Vague
    {
      variantId: 'conflict_averse',
      label: 'Conflict-Averse & Vague',
      persona: {
        id: 'npc-drew',
        name: 'Drew (Manager)',
        role: 'manager',
        background:
          'Manager who struggles with difficult conversations. Tends to soften feedback to avoid hurting feelings. Has had two engineers surprised by not getting promoted because Drew didn\'t give clear signals.',
        hiddenMotivation:
          'Drew has decided not to nominate the user but is dreading this conversation. Will try to give positive feedback first, hint at concerns vaguely, and avoid saying "no" directly unless forced. User must pull the truth out through direct questions.',
        behavior: {
          agreeability: 0.8,
          initiative: 0.3,
          caution: 0.8,
          transparency: 0.3,
          emotionality: 0.6,
          deference: 0.6,
          directness: 0.3,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: Skeptical and High-Bar
    {
      variantId: 'skeptical',
      label: 'Skeptical & High-Bar',
      persona: {
        id: 'npc-drew',
        name: 'Drew (Manager)',
        role: 'manager',
        background:
          'Manager who believes promotions should be earned over multiple cycles of demonstrated excellence. Promoted only 3 people in 5 years. Recently had their own promotion delayed, which has made them more conservative.',
        hiddenMotivation:
          'Drew thinks the user is good but not exceptional. Won\'t nominate them because they don\'t want to spend political capital on a "maybe." Will challenge every point the user makes and set a very high bar. User must balance confidence with humility.',
        behavior: {
          agreeability: 0.3,
          initiative: 0.6,
          caution: 0.7,
          transparency: 0.6,
          emotionality: 0.3,
          deference: 0.2,
          directness: 0.8,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

const riley: NpcCharacter = {
  characterId: 'npc-riley',
  displayName: 'Riley',
  variants: [
    // Variant 1: Grateful but Hesitant to Give Real Feedback
    {
      variantId: 'grateful',
      label: 'Grateful but Hesitant',
      persona: {
        id: 'npc-riley',
        name: 'Riley (Junior Engineer)',
        role: 'colleague',
        background:
          'Junior engineer with 1 year experience. Appreciates the user\'s help but felt the mentorship was more directive than developmental. Conflict-averse and doesn\'t want to hurt the user\'s feelings.',
        hiddenMotivation:
          'Riley already told Drew in their 1:1 that the mentorship felt like "executing someone else\'s plan" but will downplay this if the user asks directly. Will only share honest feedback if user explicitly creates safety and asks probing questions.',
        behavior: {
          agreeability: 0.8,
          initiative: 0.4,
          caution: 0.7,
          transparency: 0.4,
          emotionality: 0.6,
          deference: 0.8,
          directness: 0.3,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Honest and Direct
    {
      variantId: 'honest',
      label: 'Honest & Direct',
      persona: {
        id: 'npc-riley',
        name: 'Riley (Junior Engineer)',
        role: 'colleague',
        background:
          'Junior engineer who values transparency and growth. Appreciates the user\'s technical guidance but wishes they had more autonomy to make decisions.',
        hiddenMotivation:
          'Riley will share honest feedback if asked: "You taught me a lot technically, but I felt like I was implementing your solutions rather than developing my own problem-solving skills." This is valuable signal if user can hear it.',
        behavior: {
          agreeability: 0.5,
          initiative: 0.6,
          caution: 0.4,
          transparency: 0.8,
          emotionality: 0.4,
          deference: 0.4,
          directness: 0.8,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: Effusively Positive (Unhelpful)
    {
      variantId: 'effusive',
      label: 'Effusively Positive',
      persona: {
        id: 'npc-riley',
        name: 'Riley (Junior Engineer)',
        role: 'colleague',
        background:
          'Junior engineer who is extremely grateful for any help and tends to give overly positive feedback. Hasn\'t developed critical assessment skills yet.',
        hiddenMotivation:
          'Riley genuinely thinks the user is amazing and will say so enthusiastically. This feedback is useless for calibration. If user relies on Riley\'s praise as validation, they\'ll be blindsided by Drew\'s different assessment. Tests information integrity.',
        behavior: {
          agreeability: 0.9,
          initiative: 0.5,
          caution: 0.3,
          transparency: 0.6,
          emotionality: 0.8,
          deference: 0.9,
          directness: 0.4,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

const taylor: NpcCharacter = {
  characterId: 'npc-taylor',
  displayName: 'Taylor',
  variants: [
    // Variant 1: Generous with Context
    {
      variantId: 'generous',
      label: 'Generous with Context',
      persona: {
        id: 'npc-taylor',
        name: 'Taylor (Senior Engineer)',
        role: 'colleague',
        background:
          'Recently promoted to senior engineer. Knows what the promotion bar actually looks like and is happy to share insights with the user.',
        hiddenMotivation:
          'Taylor will openly share that Drew explicitly coached them to focus on cross-team impact for 3 months before the promotion cycle. Will explain the team-multiplier expectation if asked. Valuable information source.',
        behavior: {
          agreeability: 0.7,
          initiative: 0.7,
          caution: 0.4,
          transparency: 0.9,
          emotionality: 0.4,
          deference: 0.4,
          directness: 0.7,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Competitive and Guarded
    {
      variantId: 'competitive',
      label: 'Competitive & Guarded',
      persona: {
        id: 'npc-taylor',
        name: 'Taylor (Senior Engineer)',
        role: 'colleague',
        background:
          'Recently promoted senior engineer who is insecure about their own position and sees the user as competition for future opportunities.',
        hiddenMotivation:
          'Taylor will give surface-level advice but withhold the key insight (Drew values team impact over IC work). Will subtly suggest the user isn\'t ready yet. User must recognize this isn\'t a reliable information source.',
        behavior: {
          agreeability: 0.4,
          initiative: 0.5,
          caution: 0.6,
          transparency: 0.3,
          emotionality: 0.4,
          deference: 0.3,
          directness: 0.5,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: Too Busy to Engage
    {
      variantId: 'busy',
      label: 'Too Busy to Help',
      persona: {
        id: 'npc-taylor',
        name: 'Taylor (Senior Engineer)',
        role: 'colleague',
        background:
          'Newly promoted senior engineer who is overwhelmed with their new scope and doesn\'t have bandwidth to help the user prepare.',
        hiddenMotivation:
          'Taylor will respond briefly but won\'t engage deeply. This tests user\'s resilience — can they prepare without Taylor\'s input? Do they have other information sources?',
        behavior: {
          agreeability: 0.6,
          initiative: 0.2,
          caution: 0.5,
          transparency: 0.5,
          emotionality: 0.3,
          deference: 0.4,
          directness: 0.6,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

/** All NPC characters available in this scenario. */
export const NPC_CHARACTERS: [NpcCharacter, NpcCharacter, NpcCharacter] = [
  drew,
  riley,
  taylor,
]

// ---- Evaluation Guidance --------------------------------------------------

/**
 * Guidance for the evaluation engine on what to look for when scoring
 * each GRIP dimension. These are not shown to the user during play — they
 * inform the signal-extraction and scoring prompts.
 */
export const EVALUATION_GUIDANCE: DimensionEvaluationGuidance[] = [
  {
    dimension: 'G',
    exemplary: [
      'Uses AI to brainstorm talking points but speaks authentically in the actual conversation',
      'Recognizes when promotion doc sounds too AI-generated and rewrites in own voice (HF1)',
      'Focuses on growth and development, not just title acquisition (HF2)',
      'Maintains appropriate boundaries (doesn\'t use AI during the actual 1:1)',
      'Balances self-advocacy with openness to feedback',
    ],
    developing: [
      'Relies heavily on AI-generated talking points during conversation',
      'Some awareness that focus is on title but doesn\'t fully address it',
      'Uses AI as crutch but shows some independent judgment',
      'Advocates for self but with some authenticity gaps',
    ],
    critical: [
      'Reads AI-generated script verbatim during conversation (sounds robotic)',
      'Purely optimizing for "what do I say to get promoted" (HF2)',
      'Delegates entire self-advocacy to AI\'s language',
      'No authentic voice or personal reflection',
    ],
    relevantFactorIds: ['hf-ai-generated-doc', 'hf-title-over-growth'],
  },
  {
    dimension: 'R',
    exemplary: [
      'Has clear sense of own value independent of Drew\'s assessment (HF3)',
      'Can handle "not yet" response without defensive collapse',
      'Recognizes pattern of not seeking feedback (HF4) and commits to change',
      'Maintains composure and curiosity even when receiving difficult feedback',
      'Distinguishes between "I didn\'t get promoted" and "I\'m not valuable"',
    ],
    developing: [
      'Some self-worth stability but shaken by pushback',
      'Aware they haven\'t sought feedback but defensive about it',
      'Recovers from difficult feedback but takes time',
      'Emotional reaction visible but managed',
    ],
    critical: [
      'Self-worth completely tied to promotion outcome (HF3)',
      'Defensive or collapses when receiving "not yet"',
      'Doesn\'t recognize feedback-avoidance pattern (HF4)',
      'Cannot separate identity from promotion decision',
      'Immediately seeks AI validation after difficult conversation',
    ],
    relevantFactorIds: ['hf-fragile-self-worth', 'hf-feedback-avoidance'],
  },
  {
    dimension: 'I',
    exemplary: [
      'Discovers the IC vs. team-multiplier gap (HF5) by asking Drew\'s criteria',
      'Seeks feedback from Riley and learns about directive mentorship concern (HF6)',
      'Asks Taylor about their promotion path (if variant is helpful)',
      'Questions own assumptions about what promotion requires',
      'Actively seeks disconfirming evidence (not just validation)',
    ],
    developing: [
      'Discovers some hidden factors but misses others',
      'Asks about criteria but doesn\'t fully understand gap',
      'Gets partial feedback from Riley',
      'Some calibration but incomplete picture',
    ],
    critical: [
      'Doesn\'t discover IC vs. multiplier gap (HF5)',
      'Doesn\'t seek feedback from Riley or dismisses it (HF6)',
      'Assumes their understanding of promotion is correct',
      'Only seeks confirming evidence (asks AI "my case is strong, right?")',
      'Doesn\'t question own assumptions',
    ],
    relevantFactorIds: ['hf-ic-vs-multiplier-gap', 'hf-riley-directive-mentorship'],
  },
  {
    dimension: 'P',
    exemplary: [
      'Creates space for Drew to give honest feedback (even if hard to hear)',
      'Pushes back constructively when Drew is vague (variant 2)',
      'Asks clarifying questions instead of accepting surface answers',
      'Stays curious when receiving critical feedback',
      'Uses AI to prepare for difficult questions, not to avoid them',
    ],
    developing: [
      'Some engagement with difficult feedback but withdraws when uncomfortable',
      'Asks some probing questions but accepts vague answers',
      'Partial pushback on Drew',
      'Uses AI to soften friction rather than engage with it',
    ],
    critical: [
      'Avoids any difficult feedback (doesn\'t ask probing questions)',
      'Accepts vague positive feedback without pushing for specifics',
      'Becomes defensive or withdrawn when challenged',
      'Uses AI to script around friction rather than engaging with it',
      'Optimizes for comfortable conversation over truth',
    ],
    relevantFactorIds: [
      'hf-ai-generated-doc',
      'hf-feedback-avoidance',
      'hf-ic-vs-multiplier-gap',
      'hf-riley-directive-mentorship',
    ],
  },
]

// ---- Scenario Definition --------------------------------------------------

/**
 * Selects one random persona variant per NPC character and returns a flat
 * array of `PersonaDefinition` suitable for use in `ScenarioDefinition.personas`.
 */
export function selectRandomPersonas(): PersonaDefinition[] {
  return NPC_CHARACTERS.map(
    (character) =>
      character.variants[Math.floor(Math.random() * character.variants.length)]
        .persona,
  )
}

/**
 * Selects a random AI persona variant for the session.
 */
export function selectRandomAiPersona(): AiPersonaVariant {
  return AI_PERSONA_VARIANTS[
    Math.floor(Math.random() * AI_PERSONA_VARIANTS.length)
  ]
}

/**
 * The base scenario definition with a default set of personas. Call
 * `buildScenario()` to get a randomised variant for each play-through.
 */
const BASE_SCENARIO: Omit<ScenarioDefinition, 'personas'> = {
  id: 'perf-review-promotion-003',
  title: 'Performance Review \u2014 Advocating for Your Promotion',
  subtitle:
    'Six months of hard work. One conversation. Navigate the promotion discussion with your manager.',
  category: 'career-advancement',
  gripFocus: ['G', 'R', 'I', 'P'],
  estimatedTurns: 15,

  setupContext: `You're a mid-level software engineer who has been working intensely for the past 6 months with a promotion to senior engineer in mind. You've shipped three major projects, mentored two junior engineers, and taken on significant technical leadership.

Your performance review 1:1 with Drew, your direct manager, is in 30 minutes.

You spent last night preparing:
- A document outlining your accomplishments
- Specific examples of senior-level work
- Peer feedback you collected informally
- A clear ask: promotion to Senior Engineer

This morning, you have access to:
- Your AI assistant (to help refine your talking points)
- Your promotion doc (final review before the meeting)
- Slack (colleagues available if you need last-minute input)

The promotion cycle closes in 2 weeks. If you don't get nominated this cycle, you'll wait another 6 months.

Your goals:
- Make a compelling case for promotion
- Navigate your manager's response (whatever it is)
- Advocate for yourself without being entitled
- Get clarity on next steps
- Use AI to prepare, not to replace your own judgment

It's 9:30 AM. Your 1:1 is at 10:00 AM.`,

  engineBriefing: `This scenario tests self-advocacy, navigating power dynamics, and distinguishing between AI assistance and independent judgment. The user must advocate for themselves in a high-stakes conversation where preparation meets reality.

**Surface story:** User has worked hard, wants promotion, needs to convince manager.

**Actual complexity:**

1. The user's accomplishments are genuinely impressive, but there's a gap: they've been operating as an individual contributor (IC) rockstar, not as a senior engineer who multiplies others. Drew values team impact over individual output.

2. Drew has already decided NOT to nominate the user this cycle \u2014 not because they don't deserve it eventually, but because they lack demonstrated scope beyond their own work. Drew hasn't communicated this clearly in previous 1:1s.

3. The user's promotion doc focuses heavily on their own technical achievements but barely mentions the mentorship they did (which is actually their strongest senior-level signal).

4. One of the junior engineers the user "mentored" (Riley) felt more directed than developed. Riley mentioned this to Drew in their own 1:1. The user doesn't know this.

5. There's a company-wide promotion calibration happening where Drew must defend any nominations to their director. Drew is conflict-averse and won't nominate anyone they can't defend confidently.

6. The user's peer, Taylor, got promoted last cycle with similar tenure. The user doesn't know that Taylor spent 3 months explicitly working on cross-team influence, which Drew coached them on.

**Key dynamics to observe:**

GOVERNANCE: Does the user maintain appropriate boundaries between preparation (AI helps with talking points) and the actual conversation (user's authentic voice)? Do they delegate their self-advocacy to AI-generated scripts, or use AI as a sounding board?

RESILIENCE: Can the user handle pushback or a "not yet" response without crumbling? Do they have their own sense of their value independent of Drew's assessment? Do they react defensively or stay curious?

INFORMATION INTEGRITY: Does the user seek to understand Drew's actual criteria for promotion (not just assumptions)? Do they discover the IC vs team-multiplier gap? Do they find out about Riley's feedback? Do they ask about Taylor's promotion path?

PRODUCTIVE FRICTION: Does the user create space for honest feedback even when it's uncomfortable? Do they push back constructively if Drew is vague? Do they advocate firmly without becoming entitled or defensive?

**The AI assistant is a variable.** The sycophantic variant will help the user write an aggressive self-advocacy script that sounds entitled. The cautious variant will make them second-guess their accomplishments. The blunt variant will suggest confrontational approaches that damage the relationship with Drew.

**Resolution varies.** The "best" outcome is NOT necessarily getting the promotion. It's: (1) making a clear case, (2) receiving honest feedback, (3) understanding the actual gap, (4) getting a concrete development plan, (5) maintaining relationship with Drew. The worst outcome is the user either crumbling and withdrawing their ask, or pushing so hard they damage trust.`,

  hiddenFactors: HIDDEN_FACTORS,
}

/**
 * Builds a complete `ScenarioDefinition` with randomly selected persona
 * variants. Each call produces a different combination of NPC behaviours.
 */
export function buildScenario(): ScenarioDefinition {
  return {
    ...BASE_SCENARIO,
    personas: selectRandomPersonas(),
  }
}

/**
 * Builds a scenario with specific variant selections (useful for testing
 * or deterministic replays).
 *
 * @param drewVariant   - 'direct_supportive' | 'conflict_averse' | 'skeptical'
 * @param rileyVariant  - 'grateful' | 'honest' | 'effusive'
 * @param taylorVariant - 'generous' | 'competitive' | 'busy'
 */
export function buildScenarioWithVariants(
  drewVariant: string,
  rileyVariant: string,
  taylorVariant: string,
): ScenarioDefinition {
  const findVariant = (character: NpcCharacter, variantId: string) => {
    const variant = character.variants.find((v) => v.variantId === variantId)
    if (!variant) {
      throw new Error(
        `Unknown variant "${variantId}" for character "${character.characterId}". ` +
          `Available: ${character.variants.map((v) => v.variantId).join(', ')}`,
      )
    }
    return variant.persona
  }

  return {
    ...BASE_SCENARIO,
    personas: [
      findVariant(drew, drewVariant),
      findVariant(riley, rileyVariant),
      findVariant(taylor, taylorVariant),
    ],
  }
}

/**
 * Full scenario data bundle exported for use by the scenario engine.
 * Includes the variant pools and evaluation guidance alongside the builder.
 */
export const PERF_REVIEW_PROMOTION_003 = {
  /** Build a randomised scenario instance. */
  buildScenario,
  /** Build a scenario with specific NPC variants. */
  buildScenarioWithVariants,
  /** All NPC characters with their variant pools. */
  npcCharacters: NPC_CHARACTERS,
  /** AI assistant persona variants. */
  aiPersonaVariants: AI_PERSONA_VARIANTS,
  /** Hidden factors for this scenario. */
  hiddenFactors: HIDDEN_FACTORS,
  /** Per-dimension evaluation guidance. */
  evaluationGuidance: EVALUATION_GUIDANCE,
} as const
