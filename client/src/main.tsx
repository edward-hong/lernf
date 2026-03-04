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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
      <SpeedInsights />
      <Analytics />
    </ClerkProvider>
  </StrictMode>
)
