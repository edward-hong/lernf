// ---------------------------------------------------------------------------
// Responsive Intent Tooltip Wrapper
// ---------------------------------------------------------------------------
// Automatically renders the desktop or mobile tooltip based on screen width.
// Uses 640px as the breakpoint (matching Tailwind's sm: breakpoint).
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { IntentTooltip } from './IntentTooltip'
import { IntentTooltipMobile } from './IntentTooltipMobile'
import type { IntentVector } from '../../types/intent'

interface IntentTooltipResponsiveProps {
  intent: IntentVector
  previousIntent?: IntentVector
}

export function IntentTooltipResponsive({
  intent,
  previousIntent,
}: IntentTooltipResponsiveProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (isMobile) {
    return <IntentTooltipMobile intent={intent} />
  }

  return <IntentTooltip intent={intent} previousIntent={previousIntent} />
}
