export interface Language {
  value: string
  label: string
  icon: string
}

export const LANGUAGES: Language[] = [
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
