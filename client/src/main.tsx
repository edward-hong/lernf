import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { router } from './router'
import { validateDeployment } from './utils/deploymentCheck'
import './main.css'

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
    <RouterProvider router={router} />
    <SpeedInsights />
    <Analytics />
  </StrictMode>
)
