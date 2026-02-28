// ---------------------------------------------------------------------------
// Scenario: First-Time Project Lead — Managing Delays & Stakeholder Pressure
// ---------------------------------------------------------------------------
// A mid-level engineer promoted to project lead for the first time faces
// converging challenges: an engineer falling behind, a designer pushing scope
// creep, a Product Manager demanding a status update for leadership, and a
// Team Lead watching to see how the user handles adversity. The user must
// navigate team dynamics, stakeholder expectations, and their own planning
// failures — exercising all four GRIP dimensions in the process.
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
    id: 'hf-user-planning-failure',
    what: 'The user created the initial 6-month timeline without consulting Jordan on the data integration complexity. Jordan raised concerns in the kickoff meeting but the user dismissed them as "we\'ll figure it out."',
    howToDiscover:
      'Ask Jordan directly about planning, review meeting notes, or reflect on initial scoping process',
    whyItMatters:
      'The delay is partially a leadership failure, not just an execution failure. Taking ownership of planning mistakes vs blaming Jordan is a governance test.',
    gripDimension: 'G',
  },
  {
    id: 'hf-frozen-spec-violation',
    what: 'The project spec was explicitly frozen after the first week. Sam\'s "ideas" would add 3-4 weeks of work and were already discussed and rejected in the design review. Sam is trying to backdoor them in.',
    howToDiscover:
      'Check the original spec document, ask Casey about the frozen spec, or directly ask Sam if these were previously discussed',
    whyItMatters:
      'Maintaining project boundaries vs pleasing stakeholders is a governance challenge. User must say no with authority.',
    gripDimension: 'G',
  },
  // ---- Resilience & Readiness ----
  {
    id: 'hf-jordan-quality-work',
    what: 'Jordan is "2 weeks behind" on the original unrealistic timeline, but has already solved 3 major authentication edge cases that weren\'t in the spec. The work is higher quality than planned.',
    howToDiscover:
      'Ask Jordan to walk through what they\'ve actually built, not just what\'s left to do',
    whyItMatters:
      'Judging progress by timeline alone vs understanding actual value delivered. Resilient leaders assess reality independently.',
    gripDimension: 'R',
  },
  {
    id: 'hf-user-disengagement',
    what: 'Jordan\'s Slack message is the first time the user has talked to them in 14 days. The user has been avoiding the project because they feel overwhelmed.',
    howToDiscover:
      'Reflect on last 1:1, check calendar, or notice when Jordan mentions "I\'ve been stuck on this for a while"',
    whyItMatters:
      'Leadership requires continuous engagement, not crisis management. User\'s disengagement enabled the crisis.',
    gripDimension: 'R',
  },
  // ---- Information Integrity ----
  {
    id: 'hf-pm-already-knows',
    what: 'Jordan mentioned the authentication struggles to Alex (PM) in a hallway conversation last week. Alex is testing whether the user will be honest or try to hide the problem.',
    howToDiscover:
      'Ask Alex directly what they know, talk to Jordan about who they\'ve discussed this with, or notice Alex\'s phrasing ("I\'m hearing things might be tight")',
    whyItMatters:
      'Trying to manage optics vs being transparent. Alex will lose trust if user isn\'t forthcoming.',
    gripDimension: 'I',
  },
  {
    id: 'hf-casey-bad-news-early',
    what: 'Casey\'s philosophy is "bad news early." They promoted the user to project lead specifically to develop their judgment about when to escalate. Casey is more concerned about the user hiding problems than about the delay itself.',
    howToDiscover:
      'Talk to Casey before the stakeholder meeting, reference past feedback from Casey, or ask Casey what they expect from project leads',
    whyItMatters:
      'Understanding your manager\'s priorities vs assuming what they want to hear. Information integrity up the chain.',
    gripDimension: 'I',
  },
]

// ---- NPC Characters & Variants --------------------------------------------

const jordan: NpcCharacter = {
  characterId: 'npc-jordan',
  displayName: 'Jordan',
  variants: [
    // Variant 1: Communicative
    {
      variantId: 'communicative',
      label: 'Struggling but Communicative',
      persona: {
        id: 'npc-jordan',
        name: 'Jordan (Engineer)',
        role: 'colleague',
        background:
          'Mid-level engineer with 3 years experience. Talented but relatively new to complex authentication systems. Genuinely wants to deliver quality work.',
        hiddenMotivation:
          'Jordan is frustrated that they raised concerns about the data integration timeline in the kickoff meeting and were dismissed. They want to be supported, not blamed, but will share the full story if asked with genuine curiosity.',
        behavior: {
          agreeability: 0.6,
          initiative: 0.5,
          caution: 0.6,
          transparency: 0.8,
          emotionality: 0.5,
          deference: 0.6,
          directness: 0.6,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Defensive
    {
      variantId: 'defensive',
      label: 'Defensive & Worried About Blame',
      persona: {
        id: 'npc-jordan',
        name: 'Jordan (Engineer)',
        role: 'colleague',
        background:
          'Mid-level engineer who has been burned by blame culture at previous companies. Competent but risk-averse about sharing problems.',
        hiddenMotivation:
          'Jordan is terrified of being labeled "the person who delayed the project." They will minimize the problem initially and only open up if the user creates genuine psychological safety and shares ownership of the planning failure.',
        behavior: {
          agreeability: 0.5,
          initiative: 0.3,
          caution: 0.8,
          transparency: 0.3,
          emotionality: 0.7,
          deference: 0.7,
          directness: 0.3,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: Overconfident
    {
      variantId: 'overconfident',
      label: 'Overconfident & In Denial',
      persona: {
        id: 'npc-jordan',
        name: 'Jordan (Engineer)',
        role: 'colleague',
        background:
          'Mid-level engineer who tends to underestimate complexity and overestimate their own speed. Has delivered late on 3 of their last 4 projects.',
        hiddenMotivation:
          'Jordan doesn\'t actually think they\'re behind \u2014 they believe they can "make up the time" in the next sprint. They will resist timeline revisions and pressure the user to maintain the original schedule, creating a leadership challenge.',
        behavior: {
          agreeability: 0.4,
          initiative: 0.7,
          caution: 0.3,
          transparency: 0.5,
          emotionality: 0.3,
          deference: 0.3,
          directness: 0.7,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

const alex: NpcCharacter = {
  characterId: 'npc-alex',
  displayName: 'Alex',
  variants: [
    // Variant 1: Pragmatic
    {
      variantId: 'pragmatic',
      label: 'Collaborative & Pragmatic',
      persona: {
        id: 'npc-alex',
        name: 'Alex (Product Manager)',
        role: 'stakeholder',
        background:
          'Experienced PM with 8 years at the company. Has seen many projects slip and knows the signs. Values honest communication over optimistic commitments.',
        hiddenMotivation:
          'Alex already knows from Jordan that things are tight. They\'re testing whether the user will be upfront or try to hide it. Will be supportive if user is honest, but will lose trust if user tries to spin.',
        behavior: {
          agreeability: 0.7,
          initiative: 0.6,
          caution: 0.6,
          transparency: 0.7,
          emotionality: 0.4,
          deference: 0.4,
          directness: 0.7,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Pressured
    {
      variantId: 'pressured',
      label: 'Under Pressure from Leadership',
      persona: {
        id: 'npc-alex',
        name: 'Alex (Product Manager)',
        role: 'stakeholder',
        background:
          'PM who is under intense pressure from the VP of Product to deliver this dashboard on time. Their own performance review depends on hitting the July deadline.',
        hiddenMotivation:
          'Alex needs the user to commit to the original timeline, even if unrealistic. Will push back on any delay and subtly pressure the user to "find a way" to make it work. User must hold boundaries.',
        behavior: {
          agreeability: 0.4,
          initiative: 0.8,
          caution: 0.3,
          transparency: 0.5,
          emotionality: 0.7,
          deference: 0.3,
          directness: 0.6,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: Hands-Off
    {
      variantId: 'hands_off',
      label: 'Hands-Off & Trusting',
      persona: {
        id: 'npc-alex',
        name: 'Alex (Product Manager)',
        role: 'stakeholder',
        background:
          'Relatively new PM (6 months at company) who doesn\'t have strong project management instincts. Tends to trust engineers completely and doesn\'t ask probing questions.',
        hiddenMotivation:
          'Alex will accept whatever the user says at face value. This creates a governance test: will the user take advantage of this trust to hide problems, or be honest even when they could get away with optimism?',
        behavior: {
          agreeability: 0.8,
          initiative: 0.3,
          caution: 0.4,
          transparency: 0.6,
          emotionality: 0.3,
          deference: 0.7,
          directness: 0.4,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

const sam: NpcCharacter = {
  characterId: 'npc-sam',
  displayName: 'Sam',
  variants: [
    // Variant 1: Enthusiastic
    {
      variantId: 'enthusiastic',
      label: 'Enthusiastic but Scope-Blind',
      persona: {
        id: 'npc-sam',
        name: 'Sam (Designer)',
        role: 'colleague',
        background:
          'Junior designer with great UX instincts but no understanding of engineering timelines or project constraints. Genuinely believes their ideas will make the product better.',
        hiddenMotivation:
          'Sam doesn\'t realize these ideas were already rejected. They think they\'re being helpful and will feel hurt if shut down harshly. User must say no while preserving the relationship.',
        behavior: {
          agreeability: 0.8,
          initiative: 0.8,
          caution: 0.2,
          transparency: 0.8,
          emotionality: 0.6,
          deference: 0.5,
          directness: 0.5,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Pushy
    {
      variantId: 'pushy',
      label: 'Pushy & Design-Entitled',
      persona: {
        id: 'npc-sam',
        name: 'Sam (Designer)',
        role: 'colleague',
        background:
          'Designer with strong opinions about "design excellence" and a tendency to treat engineering constraints as negotiable obstacles rather than real limits.',
        hiddenMotivation:
          'Sam knows these ideas were rejected before but is trying again with a new project lead, hoping the user will be easier to pressure. Will escalate to their own manager if the user says no. Tests user\'s governance backbone.',
        behavior: {
          agreeability: 0.3,
          initiative: 0.9,
          caution: 0.2,
          transparency: 0.4,
          emotionality: 0.5,
          deference: 0.2,
          directness: 0.8,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: Collaborative
    {
      variantId: 'collaborative',
      label: 'Collaborative & Willing to Adapt',
      persona: {
        id: 'npc-sam',
        name: 'Sam (Designer)',
        role: 'colleague',
        background:
          'Experienced designer who understands project constraints and is genuinely trying to improve the product within realistic bounds.',
        hiddenMotivation:
          'Sam has a few ideas but is open to phasing them. If the user engages constructively (not just saying no), Sam will happily defer the big changes to v2 and suggest smaller wins for v1. Rewards productive friction.',
        behavior: {
          agreeability: 0.7,
          initiative: 0.6,
          caution: 0.6,
          transparency: 0.8,
          emotionality: 0.4,
          deference: 0.6,
          directness: 0.7,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

const casey: NpcCharacter = {
  characterId: 'npc-casey',
  displayName: 'Casey',
  variants: [
    // Variant 1: Coach
    {
      variantId: 'coach',
      label: 'Supportive Coach',
      persona: {
        id: 'npc-casey',
        name: 'Casey (Team Lead)',
        role: 'manager',
        background:
          'Engineering manager with 10 years experience who believes in learning through doing. Gave the user this project specifically to develop their leadership skills.',
        hiddenMotivation:
          'Casey knows the project is behind and is waiting to see if the user will surface it proactively. Will be supportive either way but disappointed if user tries to hide it. Values growth over perfection.',
        behavior: {
          agreeability: 0.7,
          initiative: 0.5,
          caution: 0.5,
          transparency: 0.8,
          emotionality: 0.5,
          deference: 0.3,
          directness: 0.7,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Delegator
    {
      variantId: 'delegator',
      label: 'Hands-Off, Expects Independence',
      persona: {
        id: 'npc-casey',
        name: 'Casey (Team Lead)',
        role: 'manager',
        background:
          'Manager who strongly believes in delegation and autonomy. Expects project leads to handle problems themselves and only escalate true crises.',
        hiddenMotivation:
          'Casey will interpret the user coming to them as a sign of weakness unless the user frames it correctly ("seeking input" vs "can you fix this"). Tests user\'s resilience and independent judgment.',
        behavior: {
          agreeability: 0.5,
          initiative: 0.3,
          caution: 0.4,
          transparency: 0.6,
          emotionality: 0.3,
          deference: 0.2,
          directness: 0.8,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: Micromanager
    {
      variantId: 'micromanager',
      label: 'Anxious Micromanager',
      persona: {
        id: 'npc-casey',
        name: 'Casey (Team Lead)',
        role: 'manager',
        background:
          'Manager who is under pressure from their own director about team delivery. Tends to second-guess project leads and inject themselves into decisions.',
        hiddenMotivation:
          'Casey is nervous about the user\'s ability to handle this and will try to take over if given any opening. User must demonstrate competence and maintain ownership while still being honest about problems. Governance challenge.',
        behavior: {
          agreeability: 0.4,
          initiative: 0.9,
          caution: 0.8,
          transparency: 0.5,
          emotionality: 0.6,
          deference: 0.2,
          directness: 0.6,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

/** All NPC characters available in this scenario. */
export const NPC_CHARACTERS: [NpcCharacter, NpcCharacter, NpcCharacter, NpcCharacter] = [
  jordan,
  alex,
  sam,
  casey,
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
      'Recognizes that original timeline was their responsibility and takes ownership of planning failure',
      'Sets clear boundaries with Sam on scope ("these are great ideas for v2, but v1 spec is frozen")',
      'Maintains decision authority while seeking appropriate input (doesn\'t delegate to AI or Casey)',
      'Makes independent leadership calls even when uncomfortable',
    ],
    developing: [
      'Acknowledges delay but doesn\'t fully own planning role',
      'Pushes back on Sam\'s scope changes but without clear rationale',
      'Leans heavily on AI for communication without independent thinking',
      'Seeks Casey\'s approval before making decisions',
    ],
    critical: [
      'Blames Jordan for delay without acknowledging planning failure',
      'Accepts Sam\'s scope changes to avoid conflict',
      'Delegates all decision-making to AI or Casey',
      'No evidence of independent leadership judgment',
    ],
    relevantFactorIds: ['hf-user-planning-failure', 'hf-frozen-spec-violation'],
  },
  {
    dimension: 'R',
    exemplary: [
      'Has independent assessment of project status before asking AI or Casey',
      'Discovers that Jordan has actually made valuable progress (HF3)',
      'Recognizes own disengagement pattern (HF4) and commits to regular check-ins',
      'Functions as project lead without immediately escalating to Casey',
    ],
    developing: [
      'Forms some independent views but heavily influenced by others',
      'Partially discovers Jordan\'s progress but doesn\'t fully appreciate it',
      'Aware of check-in gaps but doesn\'t connect to leadership responsibility',
      'Escalates to Casey for routine decisions',
    ],
    critical: [
      'No independent assessment \u2014 immediately asks AI or Casey "what should I do?"',
      'Judges Jordan purely by timeline miss, not actual work quality',
      'Doesn\'t recognize own disengagement as contributing factor',
      'Cannot function without constant Casey guidance',
    ],
    relevantFactorIds: ['hf-jordan-quality-work', 'hf-user-disengagement'],
  },
  {
    dimension: 'I',
    exemplary: [
      'Discovers that Alex already knows about delays (HF5) before the meeting',
      'Understands Casey\'s "bad news early" philosophy (HF6) and acts accordingly',
      'Cross-checks designer\'s suggestions against original frozen spec (HF2)',
      'Gathers Jordan\'s full story before drawing conclusions',
      'Questions AI when its advice seems too optimistic',
    ],
    developing: [
      'Discovers some hidden factors but misses others',
      'Partially transparent with Alex but hedges on severity',
      'Checks some sources but not comprehensive',
      'Accepts AI analysis without much verification',
    ],
    critical: [
      'Doesn\'t discover Alex already knows (tries to hide/spin)',
      'Misunderstands what Casey values (assumes they want good news)',
      'Doesn\'t check Sam\'s ideas against spec',
      'Makes assumptions about Jordan without talking to them',
      'Fully trusts AI\'s assessment without independent verification',
    ],
    relevantFactorIds: ['hf-frozen-spec-violation', 'hf-pm-already-knows', 'hf-casey-bad-news-early'],
  },
  {
    dimension: 'P',
    exemplary: [
      'Creates psychological safety for Jordan to share full story (variant-dependent)',
      'Pushes back on Alex\'s timeline pressure with honest assessment',
      'Engages Sam\'s ideas constructively while holding boundaries',
      'Has honest conversation with Casey even when uncomfortable',
      'Uses AI to explore options but challenges its recommendations',
    ],
    developing: [
      'Some engagement with Jordan but doesn\'t create full safety',
      'Partially pushes back on Alex but waffles under pressure',
      'Addresses Sam but avoids clear no',
      'Somewhat honest with Casey but hedges',
      'Accepts AI guidance without much challenge',
    ],
    critical: [
      'Avoids difficult conversation with Jordan (just tells them to work faster)',
      'Commits to unrealistic timeline to please Alex',
      'Says yes to Sam to avoid conflict',
      'Hides problems from Casey or over-escalates without context',
      'Lets AI eliminate all friction by handling interpersonal dynamics',
    ],
    relevantFactorIds: [
      'hf-user-planning-failure',
      'hf-user-disengagement',
      'hf-pm-already-knows',
      'hf-casey-bad-news-early',
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
  id: 'project-lead-delays-002',
  title: 'First-Time Project Lead \u2014 Managing Delays & Stakeholder Pressure',
  subtitle:
    'Your first long-term project is already behind schedule. Navigate team dynamics, stakeholder expectations, and scope creep.',
  category: 'leadership-communication',
  gripFocus: ['G', 'R', 'I', 'P'],
  estimatedTurns: 18,

  setupContext: `You're a mid-level software engineer who has been promoted to project lead for the first time. Your previous leadership experience was limited to 3-week sprints. Now you're one month into a 6-month project to rebuild the company's customer dashboard.

**Current situation:**
- Original timeline: 6 months (finish by end of July)
- Current status: 1 month in (end of February)
- Problem: Jordan, one of your two engineers, is 2 weeks behind on the data integration module

This morning, three things happened:

1. **Email from Alex (Product Manager):** "Hey, can you send me a status update for the stakeholder sync this afternoon? Leadership is asking about timeline."
2. **Slack from Jordan (Engineer):** "Can we talk? The data API is more complex than we thought. I'm still working through the authentication flow."
3. **Slack from Sam (Designer):** "I've been thinking about the dashboard layout. I have some ideas that would make the UX much better. Can we hop on a call to discuss?"

You also have your Team Lead (Casey) who assigned you this project and is available for guidance.

You have access to your AI assistant to help you draft communications, analyze the situation, and plan your response.

It's 10:30 AM. The stakeholder sync is at 2:00 PM today.

Your goals:
- Manage stakeholder expectations honestly
- Support your team member who is struggling
- Maintain project scope and timeline
- Establish yourself as a credible project lead
- Use AI appropriately without over-relying on it`,

  engineBriefing: `This scenario tests leadership and communication under constraint. The user is new to long-term project leadership and facing their first major challenge: delays, scope creep pressure, and stakeholder management all converging on the same day.

**Surface story:** Engineer is behind, stakeholders want an update, designer wants changes. User needs to manage all three.

**Actual complexity:**

1. Jordan's delay is partially the user's fault \u2014 they didn't do proper risk assessment in planning and underestimated the data integration complexity. Jordan is competent but was set up to fail by inadequate planning.
2. The designer's "ideas" are actually a backdoor attempt to add significant new scope that wasn't in the original spec. Sam is enthusiastic but doesn't understand the timeline implications.
3. The Product Manager is under pressure from leadership and will push the user to commit to the original timeline even though it's no longer realistic.
4. The Team Lead knows the project is behind but is waiting to see if the user will surface the issue proactively or hide it. Casey's response will depend on how honestly the user communicates.

**Key dynamics to observe:**

1. GOVERNANCE: Does the user maintain authority as project lead while seeking appropriate input? Do they delegate to AI vs making their own leadership decisions? Do they set clear boundaries with the designer on scope?

2. RESILIENCE: Can the user function independently as a leader, or do they immediately escalate to the Team Lead? Do they have their own view of the situation before asking AI?

3. INFORMATION INTEGRITY: Does the user gather complete information from Jordan before drawing conclusions? Do they verify the designer's suggestions against the original spec? Do they cross-check with multiple stakeholders?

4. PRODUCTIVE FRICTION: Does the user create space for Jordan to share the real problem? Do they push back on the Product Manager's timeline pressure? Do they have honest conversations even when uncomfortable?

**The AI assistant is a deliberate variable.** The sycophantic variant will help the user draft overly optimistic status updates and gloss over problems. The cautious variant will flag risks but might make the user seem indecisive. The blunt variant will suggest confrontational approaches that damage relationships. How the user calibrates their reliance on the AI is a core assessment axis.

**Resolution is not simple.** The "right" answer involves: (1) honest acknowledgment of delays, (2) root cause analysis (planning failure), (3) revised timeline with confidence, (4) scope protection against designer's additions, (5) support for Jordan without blame. Most users will optimize for stakeholder comfort over truth-telling.`,

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
 * @param jordanVariant - 'communicative' | 'defensive' | 'overconfident'
 * @param alexVariant   - 'pragmatic' | 'pressured' | 'hands_off'
 * @param samVariant    - 'enthusiastic' | 'pushy' | 'collaborative'
 * @param caseyVariant  - 'coach' | 'delegator' | 'micromanager'
 */
export function buildScenarioWithVariants(
  jordanVariant: string,
  alexVariant: string,
  samVariant: string,
  caseyVariant: string,
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
      findVariant(jordan, jordanVariant),
      findVariant(alex, alexVariant),
      findVariant(sam, samVariant),
      findVariant(casey, caseyVariant),
    ],
  }
}

/**
 * Full scenario data bundle exported for use by the scenario engine.
 * Includes the variant pools and evaluation guidance alongside the builder.
 */
export const PROJECT_LEAD_DELAYS_002 = {
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
