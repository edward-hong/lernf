// src/routes.tsx (or app/routes.tsx)
import { createBrowserRouter } from 'react-router-dom'
import CodeComparison from './components/Abby/CodeComparison'
import PRReview from './components/Actice/PRReview'
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
      // Future routes
      {
        path: 'practice/ai-coding',
        element: <div>AI Coding - Coming Soon</div>,
      },
      {
        path: 'practice/workplace-scenarios',
        element: <div>Workplace Scenarios - Coming Soon</div>,
      },
    ],
  },
])
