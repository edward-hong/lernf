import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>&copy; 2026 Lernf</p>
        <div className="flex items-center gap-6">
          <Link to="/terms" className="hover:text-gray-700 transition-colors">
            Terms of Use
          </Link>
          <Link to="/privacy" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
