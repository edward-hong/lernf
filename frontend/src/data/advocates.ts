import type { Advocate } from '../types/advocate'

export const AVAILABLE_ADVOCATES: Advocate[] = [
  {
    id: 'claude-opus-logical',
    provider: 'claude',
    model: 'claude-opus-4',
    lens: 'logical',
    name: 'Claude Opus',
    description: 'Finds logical flaws and reasoning errors',
    example: '"Your proposal rests on a false dichotomy between X and Y..."',
    color: '#8B5CF6'
  },
  {
    id: 'claude-sonnet-practical',
    provider: 'claude',
    model: 'claude-sonnet-3.5',
    lens: 'practical',
    name: 'Claude Sonnet',
    description: 'Surfaces execution challenges and implementation risks',
    example: '"Your timeline assumes zero delays. Here\'s the actual math..."',
    color: '#3B82F6'
  },
  {
    id: 'gpt4o-consequences',
    provider: 'openai',
    model: 'gpt-4o',
    lens: 'consequences',
    name: 'GPT-4o',
    description: 'Identifies unintended consequences and second-order effects',
    example: '"You\'re optimizing for X but sacrificing Y, which undermines..."',
    color: '#10B981'
  },
  {
    id: 'gemini-stakeholder',
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    lens: 'stakeholder',
    name: 'Gemini 2.0',
    description: 'Examines stakeholder impact and human costs',
    example: '"You haven\'t considered the impact on X stakeholder group..."',
    color: '#F59E0B'
  },
  {
    id: 'deepseek-resources',
    provider: 'deepseek',
    model: 'deepseek-chat',
    lens: 'resources',
    name: 'DeepSeek',
    description: 'Analyzes resource constraints and opportunity costs',
    example: '"The opportunity cost of doing this is..."',
    color: '#EF4444'
  }
]
