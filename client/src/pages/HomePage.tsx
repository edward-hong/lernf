// src/pages/HomePage.tsx
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { PublicHomepage } from './PublicHomepage'
import { Dashboard } from './Dashboard'

export function HomePage() {
  return (
    <>
      <SignedOut>
        <PublicHomepage />
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  )
}
