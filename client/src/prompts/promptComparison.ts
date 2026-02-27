export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'ruby', label: 'Ruby', icon: '💎' },
  { value: 'csharp', label: 'C#', icon: '🎵' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'swift', label: 'Swift', icon: '🍎' },
]

export function generateComparisonPrompt(language: string): string {
  const languageGuidance = {
    javascript: {
      name: 'JavaScript',
      focus: 'modern ES6+ features, async patterns, functional vs imperative',
      avoid: 'var keyword, callback hell, eval',
    },
    python: {
      name: 'Python',
      focus: 'pythonic idioms, list comprehensions, generators',
      avoid: 'unnecessary loops, mutable default arguments, bare except',
    },
    typescript: {
      name: 'TypeScript',
      focus: 'type safety, generics, utility types',
      avoid: 'any type, type assertions without guards, implicit any',
    },
    java: {
      name: 'Java',
      focus: 'streams API, Optional, modern Java features',
      avoid: 'null returns, raw types, unnecessary mutability',
    },
    go: {
      name: 'Go',
      focus: 'idiomatic Go, error handling, concurrency patterns',
      avoid: 'goroutine leaks, unhandled errors, unnecessary complexity',
    },
    rust: {
      name: 'Rust',
      focus: 'ownership, borrowing, Result type, iterators',
      avoid:
        'unnecessary cloning, unwrap in production, unsafe without justification',
    },
  }

  const guidance =
    languageGuidance[language.toLowerCase()] || languageGuidance.javascript

  return `Generate two ${guidance.name} functions that accomplish the same task, but one is better than the other.

Format your response as JSON:
{
  "context": "Brief description of what the functions do",
  "optionA": {
    "code": "function code here",
    "approach": "Brief description of approach"
  },
  "optionB": {
    "code": "function code here", 
    "approach": "Brief description of approach"
  },
  "correctAnswer": "A or B",
  "reason": "Why one is better"
}

Focus on ${guidance.name}-specific best practices:
- ${guidance.focus}
- Performance and readability trade-offs
- Edge case handling
- Common pitfalls to avoid: ${guidance.avoid}

Make the difference subtle but meaningful. Use realistic scenarios.

Only return valid JSON, no markdown or other text.`
}
