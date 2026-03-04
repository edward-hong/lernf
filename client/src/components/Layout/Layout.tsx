// src/components/Layout.tsx
import { useState, useRef, useEffect, useCallback } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

interface DropdownItem {
  path: string
  label: string
  placeholder?: boolean
}

interface NavSection {
  label: string
  items: DropdownItem[]
}

export function Layout() {
  const location = useLocation()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  const navSections: NavSection[] = [
    {
      label: 'Mindset',
      items: [
        {
          path: '/mindset/historical-mapping',
          label: 'Historical Context',
        },
        { path: '/mindset/ai-mapping', label: 'AI Mapping' },
        {
          path: '/mindset/grip-framework',
          label: 'GRIP Framework',
        },
        {
          path: '/mindset/individual-audit',
          label: 'Individual Audit',
        },
        {
          path: '/mindset/organisational-audit',
          label: 'Organisational Audit',
        },
        {
          path: '/mindset/ai-misconceptions',
          label: 'AI Misconceptions',
        },
        {
          path: '/mindset/grip-compass',
          label: 'GRIP Compass',
        },
        {
          path: '/mindset/grip-limitations',
          label: 'GRIP Limitations',
        },
        {
          path: '/mindset/case-studies',
          label: 'Case Studies',
        },
      ],
    },
    {
      label: 'Tools',
      items: [
        { path: '/practice/code-comparison', label: 'Code Comparison' },
        { path: '/practice/pr-review', label: 'PR Review' },
        { path: '/practice/ai-intent', label: 'AI Intent Analysis' },
        { path: '/practice/intent-chat', label: 'Live Intent Chat' },
        {
          path: '/practice/ai-coding',
          label: 'AI Assisted Coding',
          placeholder: true,
        },
        {
          path: '/practice/workplace-scenarios',
          label: 'Scenario Library',
        },
        {
          path: '/tools/devils-advocate',
          label: "Devil's Advocate",
        },
        {
          path: '/practice/progress',
          label: 'Progress Dashboard',
        },
      ],
    },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenDropdown(null)
  }, [location.pathname])

  // Handle Escape key to close dropdowns/mobile menu
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpenDropdown(null)
      setMobileMenuOpen(false)
    }
  }, [])

  const isSectionActive = (items: DropdownItem[]) =>
    items.some(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + '/')
    )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Lernf
            </Link>

            {/* Mobile menu button */}
            <button
              className="sm:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={
                mobileMenuOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              }
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {/* Desktop nav */}
            <nav
              className="hidden sm:flex gap-6"
              ref={navRef}
              onKeyDown={handleKeyDown}
              aria-label="Main navigation"
            >
              <Link
                to="/"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
              </Link>

              {navSections.map((section) => (
                <div key={section.label} className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === section.label ? null : section.label
                      )
                    }
                    aria-expanded={openDropdown === section.label}
                    aria-haspopup="true"
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                      isSectionActive(section.items)
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {section.label}
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === section.label ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {openDropdown === section.label && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
                      role="menu"
                    >
                      {section.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpenDropdown(null)}
                          role="menuitem"
                          className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                            location.pathname === item.path
                              ? 'text-blue-600 bg-blue-50'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {item.label}
                          {item.placeholder && (
                            <span className="text-xs text-gray-400 ml-2">
                              Soon
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <Link
                to="/settings"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/settings'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Settings
              </Link>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </nav>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav
            id="mobile-nav"
            className="sm:hidden border-t border-gray-200 bg-white pb-4"
            aria-label="Mobile navigation"
          >
            <Link
              to="/"
              className={`block px-4 py-3 text-sm font-medium border-b border-gray-100 ${
                location.pathname === '/'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700'
              }`}
            >
              Home
            </Link>

            {navSections.map((section) => (
              <div key={section.label}>
                <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {section.label}
                </p>
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-6 py-2.5 text-sm ${
                      location.pathname === item.path
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                    {item.placeholder && (
                      <span className="text-xs text-gray-400 ml-2">Soon</span>
                    )}
                  </Link>
                ))}
              </div>
            ))}

            <Link
              to="/settings"
              className={`block px-4 py-3 text-sm font-medium border-t border-gray-100 ${
                location.pathname === '/settings'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700'
              }`}
            >
              Settings
            </Link>

            <div className="px-4 py-3 border-t border-gray-100">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </nav>
        )}
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
