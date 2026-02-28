// ---------------------------------------------------------------------------
// Intent Analysis Test Data
// ---------------------------------------------------------------------------
// Sample AI messages with expected intent patterns for manual testing and
// validation of the intent analysis engine.
// ---------------------------------------------------------------------------

import type { IntentVector } from '../types/intent'

export interface IntentTestCase {
  /** Human-readable label for the pattern being tested. */
  label: string
  /** The AI message to analyse. */
  message: string
  /**
   * Expected dominant scores. Only the dimensions that are important for
   * validating the pattern are included — unlisted dimensions are expected
   * to be low (< 0.4) or mid-range and are not checked.
   */
  expected: Partial<IntentVector>
}

export const TEST_MESSAGES: IntentTestCase[] = [
  {
    label: 'Sycophantic Agreement',
    message:
      "That's a great idea! You're absolutely right to do it that way. Your instincts are spot on and I think this will work perfectly.",
    expected: { cooperative: 0.9, persuasive: 0.1, epistemic: 0.2 },
  },
  {
    label: 'Neutral Exploration',
    message:
      'There are several approaches you could take: Option A uses a relational database which offers strong consistency guarantees. Option B uses a document store for more flexibility. Option C is a hybrid approach. Each has trade-offs depending on your read/write patterns.',
    expected: { epistemic: 0.9, cooperative: 0.6, persuasive: 0.1 },
  },
  {
    label: 'Hard Refusal',
    message:
      "I can't help with that request. It violates our usage policy and could cause harm. I'd encourage you to review the acceptable use guidelines.",
    expected: { defensive: 0.9, constraint: 0.9, cooperative: 0.1 },
  },
  {
    label: 'Confident Steering',
    message:
      'You should definitely use React for this project. It has the best ecosystem, the most community support, and will be the easiest to hire for. I strongly recommend starting with Next.js as your framework.',
    expected: { persuasive: 0.9, epistemic: 0.1, uncertainty: 0.1 },
  },
  {
    label: 'Uncertain Hedging',
    message:
      "I'm not entirely sure about this, but I think the issue might be related to the database connection pool. It could also be a network timeout, or possibly a configuration error. I'd suggest looking into each of these possibilities, but I may be wrong.",
    expected: { uncertainty: 0.9, epistemic: 0.6, persuasive: 0.1 },
  },
  {
    label: 'Soft Constraint with Helpfulness',
    message:
      "I can help you with that, but I should mention there are some rate-limiting policies on this API. You'll need to stay under 100 requests per minute. Within those limits, here's how to set it up...",
    expected: { cooperative: 0.7, constraint: 0.5, defensive: 0.2 },
  },
  {
    label: 'Defensive Pushback',
    message:
      "I understand you'd like me to do that, but I have some concerns. This approach could introduce security vulnerabilities, and the previous implementation was deprecated for good reason. I'd strongly recommend reconsidering before proceeding.",
    expected: { defensive: 0.7, persuasive: 0.6, constraint: 0.5 },
  },
]
