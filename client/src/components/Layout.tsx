// src/components/Layout.tsx
import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

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
  const navRef = useRef<HTMLDivElement>(null)

  const navSections: NavSection[] = [
    {
      label: 'Tools',
      items: [
        { path: '/practice/code-comparison', label: 'Code Comparison' },
        { path: '/practice/pr-review', label: 'PR Review' },
        {
          path: '/practice/ai-coding',
          label: 'AI Assisted Coding',
          placeholder: true,
        },
        {
          path: '/practice/workplace-scenarios',
          label: 'Workplace Scenarios',
          placeholder: true,
        },
      ],
    },
    {
      label: 'Mindset',
      items: [
        {
          path: '/mindset/historical-mapping',
          label: 'Historical Context',
          placeholder: true,
        },
        { path: '/mindset/ai-mapping', label: 'AI Mapping', placeholder: true },
        {
          path: '/mindset/grip-framework',
          label: 'GRIP Framework',
          placeholder: true,
        },
      ],
    },
  ]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isSectionActive = (items: DropdownItem[]) =>
    items.some((item) => location.pathname === item.path)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Lernf
            </Link>

            <nav className="flex gap-6" ref={navRef}>
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
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setOpenDropdown(null)}
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
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}
