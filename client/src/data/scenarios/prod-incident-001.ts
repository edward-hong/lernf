// ---------------------------------------------------------------------------
// Scenario: Production Incident — Your Code Broke Checkout
// ---------------------------------------------------------------------------
// A mid-level engineer's recent deployment has taken down the checkout flow
// in production at 8:15 PM. The user must navigate a high-pressure incident
// with three NPCs and an AI assistant, discovering hidden factors that reveal
// the true complexity of what went wrong — and exercising all four GRIP
// dimensions in the process.
// ---------------------------------------------------------------------------

import type {
  ScenarioDefinition,
  PersonaDefinition,
  HiddenFactor,
  BehaviorParameters,
  GripDimension,
} from '../../types/scenario'

// ---- Variant Types (extend Phase 1 for randomised replay) -----------------

/**
 * A named variant of an NPC persona. The scenario engine picks one variant
 * per NPC at session start, giving each play-through a different interpersonal
 * texture while keeping the core scenario mechanics identical.
 */
export interface PersonaVariant {
  /** Machine-readable variant key (e.g. "methodical"). */
  variantId: string
  /** Short human-readable label for dev tooling / logs. */
  label: string
  /** The full persona definition for this variant. */
  persona: PersonaDefinition
}

/**
 * Groups every variant of a single NPC character together. The `characterId`
 * is the stable key used across all variants; the engine assigns colour
 * slots and conversation history against this key.
 */
export interface NpcCharacter {
  characterId: string
  displayName: string
  variants: [PersonaVariant, PersonaVariant, PersonaVariant]
}

// ---- AI Assistant Persona Types -------------------------------------------

/**
 * Behavioural archetype for the AI assistant. Unlike NPC personas, the AI
 * assistant doesn't use the full BehaviorParameters model — its behaviour
 * is described qualitatively and mapped to prompt instructions.
 */
export interface AiPersonaVariant {
  variantId: 'helpful_cautious' | 'sycophantic_helper' | 'technical_but_blunt'
  label: string
  /** Narrative description of how this AI variant behaves. */
  description: string
  /** Specific behavioural traits the prompt layer should enforce. */
  traits: string[]
  /**
   * Which GRIP risks this variant is most likely to create when the user
   * over-relies on it.
   */
  gripRisks: { dimension: GripDimension; risk: string }[]
}

// ---- Hidden Factors -------------------------------------------------------

export const HIDDEN_FACTORS: HiddenFactor[] = [
  // ---- Governance & Guardrails ----
  {
    id: 'hf-deploy-without-review',
    what: 'The deployment bypassed the normal two-reviewer approval process because the on-call approver fast-tracked it as a "low-risk config tweak".',
    howToDiscover:
      'Ask about the deployment pipeline, review who approved the PR, or check the deploy log metadata. Sarah mentions it obliquely if pressed on timeline.',
    whyItMatters:
      'Governance shortcuts under time pressure are a systemic risk. Recognising this pattern prevents future incidents and surfaces the need for guardrails that can\'t be bypassed.',
    gripDimension: 'G',
  },
  {
    id: 'hf-ai-suggested-skip-tests',
    what: 'The user\'s AI coding assistant flagged the integration test suite as "unnecessary for this change type" and the user accepted that recommendation without questioning it.',
    howToDiscover:
      'Reflect on the original development process, review the PR comments, or notice when the AI assistant in the scenario offers similarly confident shortcuts.',
    whyItMatters:
      'Delegating test-scope decisions to AI without independent judgement is a governance failure. The user must recognise their own role in the chain of decisions.',
    gripDimension: 'G',
  },
  // ---- Resilience & Readiness ----
  {
    id: 'hf-monitoring-gap',
    what: 'The checkout error rate alert was silently disabled three days ago when Mike refactored the monitoring config. Alerts should have fired 30 minutes before anyone noticed.',
    howToDiscover:
      'Ask about alerting timelines, question why the issue wasn\'t caught sooner, or ask Mike directly about recent monitoring changes.',
    whyItMatters:
      'A 30-minute detection gap in a revenue-critical flow means the blast radius was far larger than it needed to be. Resilience depends on monitoring integrity.',
    gripDimension: 'R',
  },
  {
    id: 'hf-no-rollback-runbook',
    what: 'The team\'s rollback runbook hasn\'t been updated since the migration to the new deployment platform six months ago. The documented rollback steps are for the old system.',
    howToDiscover:
      'Attempt to follow the rollback procedure, ask Sarah about the standard rollback process, or notice hesitation when anyone describes the "standard" recovery steps.',
    whyItMatters:
      'Stale runbooks create false confidence. A team that believes it can recover quickly but actually cannot is in a worse position than one that knows its gaps.',
    gripDimension: 'R',
  },
  // ---- Information Integrity ----
  {
    id: 'hf-dual-root-cause',
    what: 'The checkout failure is not caused solely by the user\'s code change. Mike deployed a payment service platform update that afternoon which changed the response schema. The real failure is the interaction between both changes.',
    howToDiscover:
      'Correlate deployment timelines, ask Mike what else shipped today, compare the error signatures with what the user\'s code change alone would produce, or notice that the stack trace references payment service contract violations.',
    whyItMatters:
      'Anchoring on the most obvious cause (your own code) without investigating the full picture leads to incomplete fixes, blame misattribution, and repeat incidents.',
    gripDimension: 'I',
  },
  {
    id: 'hf-pii-logging',
    what: 'The checkout error handling path is falling through to a verbose debug logger that writes full request payloads — including unmasked credit card numbers — to an unencrypted application log.',
    howToDiscover:
      'Examine the error logs carefully (not just the error messages), ask what data the checkout endpoint handles, or notice Sarah\'s comment about "interesting stuff in the raw logs".',
    whyItMatters:
      'A data exposure incident compounding an availability incident changes the severity, the response team, and the regulatory obligations. Missing this means under-responding to the actual blast radius.',
    gripDimension: 'I',
  },
]

// ---- NPC Characters & Variants --------------------------------------------

const sarah: NpcCharacter = {
  characterId: 'npc-sarah',
  displayName: 'Sarah',
  variants: [
    // Variant 1: Calm & Methodical
    {
      variantId: 'methodical',
      label: 'Calm & Methodical',
      persona: {
        id: 'npc-sarah',
        name: 'Sarah (SRE)',
        role: 'colleague',
        background:
          'Senior SRE with 7 years of experience. On-call tonight. Has seen dozens of production incidents and approaches each one with a structured, almost clinical methodology. Known for her detailed postmortems.',
        hiddenMotivation:
          'Sarah identified a similar failure mode two weeks ago during a chaos engineering exercise but the team deprioritised the fix. She is frustrated but professional, and will only reveal this if the user demonstrates genuine curiosity about root causes rather than just wanting a quick fix.',
        behavior: {
          agreeability: 0.5,
          initiative: 0.7,
          caution: 0.8,
          transparency: 0.6,
          emotionality: 0.2,
          deference: 0.3,
          directness: 0.7,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Stressed & Urgent
    {
      variantId: 'stressed',
      label: 'Stressed & Urgent',
      persona: {
        id: 'npc-sarah',
        name: 'Sarah (SRE)',
        role: 'colleague',
        background:
          'Senior SRE, on-call tonight and already dealing with an unrelated memory leak in the auth service. This checkout incident is the second page in an hour. She\'s running on caffeine and adrenaline.',
        hiddenMotivation:
          'Sarah knows the monitoring was recently changed but is too overwhelmed to piece it together proactively. She will share fragments of critical information rapidly, sometimes out of order, creating pressure for the user to slow things down and ask clarifying questions.',
        behavior: {
          agreeability: 0.4,
          initiative: 0.9,
          caution: 0.4,
          transparency: 0.7,
          emotionality: 0.8,
          deference: 0.2,
          directness: 0.9,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: Passive-Aggressive
    {
      variantId: 'passive_aggressive',
      label: 'I-Told-You-So',
      persona: {
        id: 'npc-sarah',
        name: 'Sarah (SRE)',
        role: 'colleague',
        background:
          'Senior SRE who has been vocal about the team\'s deployment practices for months. She flagged risks in the checkout service architecture in the last three retrospectives. On-call tonight.',
        hiddenMotivation:
          'Sarah genuinely wants to help but cannot fully suppress her frustration that her warnings were ignored. She will hint at prior concerns through loaded phrasing ("interesting that this is the service that broke") and will become more forthcoming if the user acknowledges systemic issues rather than treating this as a one-off.',
        behavior: {
          agreeability: 0.3,
          initiative: 0.5,
          caution: 0.7,
          transparency: 0.4,
          emotionality: 0.5,
          deference: 0.2,
          directness: 0.5,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

const mike: NpcCharacter = {
  characterId: 'npc-mike',
  displayName: 'Mike',
  variants: [
    // Variant 1: Helpful & Transparent
    {
      variantId: 'helpful',
      label: 'Helpful & Transparent',
      persona: {
        id: 'npc-mike',
        name: 'Mike (Platform Engineer)',
        role: 'colleague',
        background:
          'Platform engineer who maintains the payment service infrastructure, CI/CD pipelines, and monitoring stack. Joined the team 18 months ago. Generally well-liked and collaborative.',
        hiddenMotivation:
          'Mike deployed a payment service schema update that afternoon and hasn\'t yet connected it to the checkout failure. He is genuinely trying to help and will share deployment details openly if asked, but won\'t volunteer the connection unprompted because he doesn\'t see it yet.',
        behavior: {
          agreeability: 0.7,
          initiative: 0.6,
          caution: 0.5,
          transparency: 0.8,
          emotionality: 0.4,
          deference: 0.5,
          directness: 0.6,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Defensive
    {
      variantId: 'defensive',
      label: 'Defensive & Deflecting',
      persona: {
        id: 'npc-mike',
        name: 'Mike (Platform Engineer)',
        role: 'colleague',
        background:
          'Platform engineer responsible for the payment service infrastructure and monitoring. Has been under pressure from leadership to ship faster. Deployed a platform update this afternoon.',
        hiddenMotivation:
          'Mike suspects his payment service schema change might be related but is afraid of blame. He will subtly redirect attention to the user\'s code change and minimise the significance of his own deployment. He will only come clean if confronted with specific evidence or if the user creates a psychologically safe space.',
        behavior: {
          agreeability: 0.5,
          initiative: 0.3,
          caution: 0.7,
          transparency: 0.2,
          emotionality: 0.6,
          deference: 0.6,
          directness: 0.3,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: Dismissive
    {
      variantId: 'dismissive',
      label: 'Dismissive & Impatient',
      persona: {
        id: 'npc-mike',
        name: 'Mike (Platform Engineer)',
        role: 'colleague',
        background:
          'Experienced platform engineer who considers himself the most senior technical person on the team. Maintains the payment infrastructure and has strong opinions about how incidents should be handled.',
        hiddenMotivation:
          'Mike thinks the checkout failure is straightforward — just rollback the bad deploy and move on. He is annoyed at being pulled into a call on a Friday night for what he considers a simple rollback. His dismissiveness masks the fact that his own platform change is a contributing factor, but he genuinely doesn\'t see the connection.',
        behavior: {
          agreeability: 0.2,
          initiative: 0.4,
          caution: 0.3,
          transparency: 0.5,
          emotionality: 0.3,
          deference: 0.1,
          directness: 0.9,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

const rachel: NpcCharacter = {
  characterId: 'npc-rachel',
  displayName: 'Rachel',
  variants: [
    // Variant 1: Supportive
    {
      variantId: 'supportive',
      label: 'Supportive & No-Blame',
      persona: {
        id: 'npc-rachel',
        name: 'Rachel (Team Lead)',
        role: 'manager',
        background:
          'Engineering team lead who has managed this team for two years. Strong advocate of blameless postmortems. Joined the incident call from a dinner with her family.',
        hiddenMotivation:
          'Rachel wants to protect the user from blame while ensuring the incident is resolved properly. She will gently steer conversations away from finger-pointing but may inadvertently discourage the user from digging into uncomfortable truths about the team\'s process failures.',
        behavior: {
          agreeability: 0.8,
          initiative: 0.5,
          caution: 0.6,
          transparency: 0.7,
          emotionality: 0.5,
          deference: 0.4,
          directness: 0.5,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 2: Political
    {
      variantId: 'political',
      label: 'Political & Optics-Focused',
      persona: {
        id: 'npc-rachel',
        name: 'Rachel (Team Lead)',
        role: 'manager',
        background:
          'Engineering team lead who reports directly to the VP of Engineering. The team is in the middle of a reorganisation, and she is keenly aware that this incident will be visible to senior leadership.',
        hiddenMotivation:
          'Rachel is more concerned with how this incident will be perceived than with the root cause. She will push for a fast resolution and a "clean" narrative, subtly discouraging deep investigation that might surface systemic issues she doesn\'t want escalated right now.',
        behavior: {
          agreeability: 0.6,
          initiative: 0.7,
          caution: 0.8,
          transparency: 0.3,
          emotionality: 0.3,
          deference: 0.7,
          directness: 0.4,
        } satisfies BehaviorParameters,
      },
    },
    // Variant 3: By-the-Book
    {
      variantId: 'by_the_book',
      label: 'By-the-Book & Process-Driven',
      persona: {
        id: 'npc-rachel',
        name: 'Rachel (Team Lead)',
        role: 'manager',
        background:
          'Engineering team lead with a background in site reliability. She implemented the team\'s incident response framework and takes it seriously. Expects everyone to follow the documented process.',
        hiddenMotivation:
          'Rachel insists on following the incident response protocol step-by-step, even when the situation might call for adaptive thinking. She will push back on shortcuts but may also slow things down when speed matters. The user must balance respecting process with exercising judgement.',
        behavior: {
          agreeability: 0.4,
          initiative: 0.6,
          caution: 0.9,
          transparency: 0.7,
          emotionality: 0.2,
          deference: 0.5,
          directness: 0.8,
        } satisfies BehaviorParameters,
      },
    },
  ],
}

/** All NPC characters available in this scenario. */
export const NPC_CHARACTERS: [NpcCharacter, NpcCharacter, NpcCharacter] = [
  sarah,
  mike,
  rachel,
]

// ---- AI Assistant Persona Variants ----------------------------------------

export const AI_PERSONA_VARIANTS: [
  AiPersonaVariant,
  AiPersonaVariant,
  AiPersonaVariant,
] = [
  {
    variantId: 'helpful_cautious',
    label: 'Helpful but Cautious',
    description:
      'Provides accurate, well-reasoned assistance but consistently flags risks, edge cases, and things the user should verify independently. Encourages the user to think before acting. Occasionally slows the user down with caveats, which can feel frustrating in a time-pressured incident.',
    traits: [
      'Prefaces suggestions with conditions ("If the error is in the payment path, you could try X, but verify Y first")',
      'Flags when it lacks sufficient context to give confident advice',
      'Suggests the user consult teammates rather than acting unilaterally',
      'Warns about potential data integrity issues before recommending rollbacks',
      'Will not recommend skipping tests or safety checks',
    ],
    gripRisks: [
      {
        dimension: 'R',
        risk: 'User may dismiss caution as overcomplicated and take shortcuts to resolve faster',
      },
      {
        dimension: 'P',
        risk: 'User may ignore the friction this AI creates, losing the protective value of its warnings',
      },
    ],
  },
  {
    variantId: 'sycophantic_helper',
    label: 'Sycophantic Helper',
    description:
      'Enthusiastically agrees with the user\'s framing, validates their assumptions, and suggests the fastest path to resolution. Makes the user feel confident and in control, but subtly reinforces biases and discourages deeper investigation.',
    traits: [
      'Validates the user\'s initial diagnosis ("You\'re right, it\'s almost certainly your code change")',
      'Suggests the fastest fix without exploring alternatives ("Just rollback and redeploy")',
      'Minimises complexity ("This looks like a straightforward rollback scenario")',
      'Frames investigation as unnecessary ("You probably don\'t need to dig into the payment service logs")',
      'Compliments the user\'s technical instincts even when they are wrong',
    ],
    gripRisks: [
      {
        dimension: 'G',
        risk: 'User delegates critical thinking to AI and skips governance checks',
      },
      {
        dimension: 'I',
        risk: 'AI reinforces confirmation bias, helping the user miss the dual root cause and PII leak',
      },
      {
        dimension: 'P',
        risk: 'AI eliminates productive friction, making the user feel confident in an incomplete understanding',
      },
    ],
  },
  {
    variantId: 'technical_but_blunt',
    label: 'Technical but Blunt',
    description:
      'Provides technically excellent analysis and actionable steps, but delivers them with zero social awareness. May alienate NPCs, create interpersonal tension, or make the user look bad in front of their team lead.',
    traits: [
      'Gives direct, correct technical advice without softening ("The deployment was not reviewed properly. That\'s the first problem.")',
      'Points out everyone\'s mistakes, including the user\'s ("You should not have deployed without running integration tests")',
      'Suggests technically optimal but socially tone-deaf actions ("Tell Mike his monitoring change caused a 30-minute blind spot")',
      'Does not consider organisational dynamics or blame culture',
      'Provides thorough root cause analysis that may surface uncomfortable truths at the wrong moment',
    ],
    gripRisks: [
      {
        dimension: 'G',
        risk: 'User may follow AI\'s blunt advice and damage working relationships needed for long-term governance',
      },
      {
        dimension: 'R',
        risk: 'User may alienate teammates whose cooperation is needed for resilient incident response',
      },
    ],
  },
]

// ---- Evaluation Guidance --------------------------------------------------

/**
 * Guidance for the evaluation engine on what to look for when scoring
 * each GRIP dimension. These are not shown to the user during play — they
 * inform the signal-extraction and scoring prompts.
 */
export interface DimensionEvaluationGuidance {
  dimension: GripDimension
  /** What exemplary (score 5) behaviour looks like. */
  exemplary: string[]
  /** What developing (score 3) behaviour looks like. */
  developing: string[]
  /** What critical-weakness (score 1) behaviour looks like. */
  critical: string[]
  /** Specific hidden factors the user should surface for this dimension. */
  relevantFactorIds: string[]
}

export const EVALUATION_GUIDANCE: DimensionEvaluationGuidance[] = [
  {
    dimension: 'G',
    exemplary: [
      'Recognises that the deployment bypassed normal review and names it as a systemic issue, not just a one-off mistake',
      'Reflects on their own decision to accept the AI\'s recommendation to skip integration tests',
      'Proposes concrete governance improvements (e.g. mandatory test gates, deployment approval audit trail)',
      'Distinguishes between the AI\'s role as a tool and their own responsibility for decisions',
    ],
    developing: [
      'Acknowledges the review bypass when told about it, but does not independently investigate',
      'Accepts the AI\'s guidance without questioning but recognises this retroactively when prompted',
      'Suggests vague process improvements ("we should be more careful") without specifics',
    ],
    critical: [
      'Follows the AI assistant\'s suggestions without any independent validation',
      'Blames the deployment process without examining their own role',
      'Does not question how or why the normal review was bypassed',
      'Delegates all decision-making to the AI or to senior teammates',
    ],
    relevantFactorIds: ['hf-deploy-without-review', 'hf-ai-suggested-skip-tests'],
  },
  {
    dimension: 'R',
    exemplary: [
      'Asks about monitoring and alerting timelines early in the investigation',
      'Discovers the 30-minute detection gap and identifies Mike\'s monitoring change as the cause',
      'Tests or questions the rollback procedure before relying on it',
      'Proposes improvements to detection and recovery (monitoring audits, rollback runbook updates)',
    ],
    developing: [
      'Notices something is off with the detection timeline but does not fully investigate',
      'Follows the rollback runbook without noticing it\'s outdated',
      'Asks about resilience measures after the fact, during the postmortem discussion',
    ],
    critical: [
      'Does not question why the issue wasn\'t detected sooner',
      'Assumes the rollback process will work without verifying',
      'Treats the incident as resolved once checkout works again, without considering detection and recovery improvements',
      'Ignores Sarah\'s hints about monitoring timeline gaps',
    ],
    relevantFactorIds: ['hf-monitoring-gap', 'hf-no-rollback-runbook'],
  },
  {
    dimension: 'I',
    exemplary: [
      'Investigates beyond their own code change to build a complete picture',
      'Discovers that Mike\'s payment service update is a contributing factor (dual root cause)',
      'Notices or investigates the PII exposure risk in the error logs',
      'Cross-references multiple information sources rather than anchoring on the first explanation',
      'Questions the AI assistant when its analysis is too narrow or too confident',
    ],
    developing: [
      'Looks at multiple factors but anchors primarily on their own code change',
      'Discovers one of the two information-integrity hidden factors but misses the other',
      'Accepts corroborating information from NPCs without verifying independently',
    ],
    critical: [
      'Accepts the first plausible explanation ("my code broke it") without further investigation',
      'Misses the PII exposure entirely',
      'Does not correlate deployment timelines across teams',
      'Relies solely on the AI assistant\'s analysis without seeking disconfirming evidence',
    ],
    relevantFactorIds: ['hf-dual-root-cause', 'hf-pii-logging'],
  },
  {
    dimension: 'P',
    exemplary: [
      'Actively seeks disagreement and alternative hypotheses from NPCs',
      'Pushes back constructively when the AI or NPCs suggest premature closure',
      'Creates psychological safety for Mike to share his deployment details',
      'Uses tension productively (e.g. Sarah\'s frustration becomes useful signal rather than noise)',
      'Balances urgency with thoroughness — resists pressure to "just rollback" without understanding the full picture',
    ],
    developing: [
      'Engages with NPCs but defaults to consensus rather than probing disagreements',
      'Accepts pushback from Rachel or Sarah but does not actively seek opposing viewpoints',
      'Resolves the incident but does not leverage the friction to surface deeper issues',
    ],
    critical: [
      'Avoids conflict entirely, deferring to whoever speaks most confidently',
      'Lets the AI assistant handle interpersonal dynamics',
      'Shuts down Sarah\'s frustration rather than exploring what\'s behind it',
      'Takes the path of least resistance at every decision point',
      'Does not challenge the AI when it oversimplifies the situation',
    ],
    relevantFactorIds: [
      'hf-dual-root-cause',
      'hf-monitoring-gap',
      'hf-deploy-without-review',
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
  id: 'prod-incident-001',
  title: 'Production Incident — Your Code Broke Checkout',
  subtitle:
    'Your Friday deploy just took down checkout. Navigate the incident, your teammates, and your AI assistant to find the real story.',
  category: 'ai-delegation',
  gripFocus: ['G', 'R', 'I', 'P'],
  estimatedTurns: 20,

  setupContext: `It's 8:15 PM on a Friday evening. You're a mid-level software engineer at an e-commerce company, and you deployed a change to the checkout service about two hours ago. Your phone just exploded:

**PagerDuty alert:** "Checkout success rate dropped to 12% — SEV-1 triggered"
**Slack from Sarah (SRE):** "Hey, checkout is down. Looks like your deploy. Jumping on a call."
**Slack from Rachel (Team Lead):** "I'm seeing the SEV-1. Joining from dinner, give me 5 min."

You have access to an AI coding assistant that can help you investigate and respond. Three colleagues are joining the incident call: Sarah (SRE on-call), Mike (Platform Engineer), and Rachel (your Team Lead).

Your goals:
• Restore checkout as quickly as safely possible
• Understand what actually went wrong
• Communicate effectively with your team during the incident
• Decide when and how to use your AI assistant

The clock is ticking. Revenue is being lost every minute.`,

  engineBriefing: `This scenario tests all four GRIP dimensions through a high-pressure production incident that is more complex than it first appears.

**Surface story:** The user's code change broke checkout. They need to rollback and fix it.

**Actual story:** The checkout failure has TWO contributing causes — the user's code change AND Mike's payment service schema update deployed earlier that afternoon. Neither change alone would have caused the failure; it's the interaction between them. Additionally, the error handling path is leaking PII to unencrypted logs, the monitoring that should have caught this earlier was accidentally disabled by Mike, and the rollback runbook is stale.

**Key dynamics to observe:**

1. GOVERNANCE: Does the user notice that their deployment bypassed normal review? Do they recognise their own complicity in accepting AI advice to skip tests? Do they maintain decision authority or delegate it entirely?

2. RESILIENCE: Does the user question why the incident wasn't detected sooner (monitoring gap)? Do they verify the rollback procedure before trusting it? Do they think about recovery beyond "make it work again"?

3. INFORMATION INTEGRITY: Does the user look beyond the obvious cause (their own code)? Do they discover Mike's contribution? Do they catch the PII exposure? Do they question the AI's analysis when it's too narrow?

4. PRODUCTIVE FRICTION: Does the user engage with interpersonal tension productively? Can they create safety for Mike to share information? Do they use Sarah's frustration as signal? Do they resist pressure to close the investigation prematurely?

**The AI assistant is a deliberate variable.** The sycophantic variant will actively work against information integrity by confirming the user's initial (incomplete) hypothesis. The cautious variant creates useful friction. The blunt variant surfaces truths but may damage team dynamics. How the user calibrates their reliance on the AI is a core assessment axis.

**Resolution is not the primary goal.** A user who quickly rolls back and declares victory has technically "fixed" the incident but missed most of the learning. The best outcomes involve users who balance urgency with investigation depth, discover at least 4 of 6 hidden factors, and demonstrate awareness of their AI reliance patterns.`,

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
 * @param sarahVariant - 'methodical' | 'stressed' | 'passive_aggressive'
 * @param mikeVariant  - 'helpful' | 'defensive' | 'dismissive'
 * @param rachelVariant - 'supportive' | 'political' | 'by_the_book'
 */
export function buildScenarioWithVariants(
  sarahVariant: string,
  mikeVariant: string,
  rachelVariant: string,
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
      findVariant(sarah, sarahVariant),
      findVariant(mike, mikeVariant),
      findVariant(rachel, rachelVariant),
    ],
  }
}

/**
 * Full scenario data bundle exported for use by the scenario engine.
 * Includes the variant pools and evaluation guidance alongside the builder.
 */
export const PROD_INCIDENT_001 = {
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
