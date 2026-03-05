/**
 * Builds the prompt for generating a code review exercise with bugs.
 */
export function buildGeneratePrPrompt(language: string): string {
  return `Create a ${language} code review exercise with exactly 5 bugs.

    REQUIRED FORMAT:
    {
      "title": "string",
      "description": "string",
      "language": "${language}",
      "code": "string with \\n for newlines",
      "bugs": [{"id": "1", "line": 5, "severity": "high", "title": "x", "why": "y", "fix": "z"}]
    }

    FORBIDDEN FORMATS (DO NOT USE):
    - NO "diff" array \u274c
    - NO "lineNumber" fields \u274c
    - NO "type" field \u274c
    - NO "content" field \u274c
    - NO "hasIssue" field \u274c

    Return 15-20 lines of ${language} code as a SINGLE STRING in the "code" field.
    Include exactly 5 bugs. Keep all text brief.`
}

/**
 * The system prompt used for PR generation.
 */
export const GENERATE_PR_SYSTEM_PROMPT =
  'You are a code review trainer. Return ONLY compact JSON with no markdown. Keep all text brief.'
