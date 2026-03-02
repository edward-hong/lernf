import { useEffect, useState } from 'react'
import { loadProviderSettings } from '../../utils/providerStorage'

interface ProviderIndicatorProps {
  /** Provider ID from the AI response. */
  provider: string
  /** Model name from the AI response. */
  model: string
}

/** Formats a raw provider ID into a user-friendly display name. */
function formatProviderName(provider: string): string {
  switch (provider) {
    case 'backend-deepseek':
      return 'DeepSeek'
    case 'claude':
      return 'Claude'
    case 'openai':
      return 'OpenAI'
    case 'gemini':
      return 'Gemini'
    case 'deepseek':
      return 'DeepSeek'
    default:
      return provider
  }
}

/**
 * Displays a small "via Provider" indicator next to AI messages.
 * Only renders when the user has enabled `showProviderInUI` in settings.
 */
export function ProviderIndicator({ provider, model }: ProviderIndicatorProps) {
  const [showProvider, setShowProvider] = useState(false)

  useEffect(() => {
    const settings = loadProviderSettings()
    setShowProvider(settings.showProviderInUI)
  }, [])

  if (!showProvider) return null

  return (
    <span className="text-xs text-gray-500" title={`Model: ${model}`}>
      via {formatProviderName(provider)}
    </span>
  )
}
