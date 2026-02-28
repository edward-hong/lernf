// src/routes.tsx (or app/routes.tsx)
import { createBrowserRouter } from 'react-router-dom'
import CodeComparison from './pages/CodeComparison'
import PRReview from './pages/PRReview'
import { HomePage } from './pages/HomePage'
import { Layout } from './components/Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'practice/code-comparison',
        element: <CodeComparison />,
      },
      {
        path: 'practice/pr-review',
        element: <PRReview />,
      },
      // Future practice routes
      {
        path: 'practice/ai-coding',
        element: <div>AI Assisted Coding - Coming Soon</div>,
      },
      {
        path: 'practice/workplace-scenarios',
        element: <div>Workplace Scenarios - Coming Soon</div>,
      },
      // Mindset routes
      {
        path: 'mindset/historical-mapping',
        element: <div>Historical Mapping - Coming Soon</div>,
      },
      {
        path: 'mindset/ai-mapping',
        element: <div>AI Mapping - Coming Soon</div>,
      },
      {
        path: 'mindset/grip-framework',
        element: <div>GRIP Framework - Coming Soon</div>,
      },
    ],
  },
])
