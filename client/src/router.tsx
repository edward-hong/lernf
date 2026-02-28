// src/routes.tsx (or app/routes.tsx)
import { createBrowserRouter } from 'react-router-dom'
import CodeComparison from './pages/tools/CodeComparison'
import PRReview from './pages/tools/PRReview'
import { HomePage } from './pages/HomePage'
import { Layout } from './components/Layout'
import { HistoricalContext } from './pages/mindset/HistoricalContext'
import { AiMapping } from './pages/mindset/AiMapping'
import { GripFramework } from './pages/mindset/GripFramework'

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
        element: <HistoricalContext />,
      },
      {
        path: 'mindset/ai-mapping',
        element: <AiMapping />,
      },
      {
        path: 'mindset/grip-framework',
        element: <GripFramework />,
      },
    ],
  },
])
