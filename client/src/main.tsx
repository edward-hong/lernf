import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { router } from './router'
import { validateDeployment } from './utils/deploymentCheck'
import './main.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY environment variable')
}

// During development, validate deployment configuration
if (import.meta.env.DEV) {
  validateDeployment().then((result) => {
    if (result.success) {
      console.log('Deployment validated successfully')
    } else {
      console.warn('Deployment validation issues:', result.errors)
    }
  })
}

const clerkAppearance = {
  variables: {
    colorPrimary: '#2563eb',
    colorText: '#111827',
    colorTextSecondary: '#4b5563',
    colorBackground: '#ffffff',
    colorInputBackground: '#f9fafb',
    colorInputText: '#111827',
    borderRadius: '0.5rem',
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '0.875rem',
  },
  elements: {
    userButtonAvatarBox: {
      width: '1.75rem',
      height: '1.75rem',
    },
    card: {
      border: '1px solid #e5e7eb',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    },
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={clerkAppearance}>
      <RouterProvider router={router} />
      <SpeedInsights />
      <Analytics />
    </ClerkProvider>
  </StrictMode>
)
