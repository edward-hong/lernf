// src/routes.tsx — React Router configuration with lazy-loaded routes
import { lazy, Suspense } from 'react'
import { createBrowserRouter, useParams, Navigate } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Layout } from './components/Layout/Layout'
import { ProgressDashboard } from './components/Progress/ProgressDashboard'

// Lazy-loaded routes for non-critical pages (code-split)
const CodeComparison = lazy(() => import('./pages/tools/CodeComparison'))
const PRReview = lazy(() => import('./pages/tools/PRReview'))
const AiIntent = lazy(() => import('./pages/tools/AiIntent'))
const IntentChat = lazy(() => import('./pages/tools/IntentChat'))
const ScenarioLibrary = lazy(() => import('./pages/tools/ScenarioLibrary'))
const ScenarioPlayer = lazy(() => import('./pages/tools/ScenarioPlayer'))
const ScenarioResultsRoute = lazy(() => import('./pages/tools/ScenarioResults'))
const HistoricalContext = lazy(() => import('./pages/mindset/HistoricalContext').then(m => ({ default: m.HistoricalContext })))
const AiMapping = lazy(() => import('./pages/mindset/AiMapping').then(m => ({ default: m.AiMapping })))
const GripFramework = lazy(() => import('./pages/mindset/GripFramework').then(m => ({ default: m.GripFramework })))
const IndividualAudit = lazy(() => import('./pages/mindset/IndividualAudit').then(m => ({ default: m.IndividualAudit })))
const OrganisationalAudit = lazy(() => import('./pages/mindset/OrganisationalAudit').then(m => ({ default: m.OrganisationalAudit })))
const CaseStudiesIndex = lazy(() => import('./pages/mindset/case-studies/CaseStudiesIndex').then(m => ({ default: m.CaseStudiesIndex })))
const WeiZhongxianTianqi = lazy(() => import('./pages/mindset/case-studies/WeiZhongxianTianqi').then(m => ({ default: m.WeiZhongxianTianqi })))
const SejanustTiberius = lazy(() => import('./pages/mindset/case-studies/SejanustTiberius').then(m => ({ default: m.SejanustTiberius })))
const QinHuiGaozong = lazy(() => import('./pages/mindset/case-studies/QinHuiGaozong').then(m => ({ default: m.QinHuiGaozong })))
const RasputinRomanovs = lazy(() => import('./pages/mindset/case-studies/RasputinRomanovs').then(m => ({ default: m.RasputinRomanovs })))
const AlMansurHisham = lazy(() => import('./pages/mindset/case-studies/AlMansurHisham').then(m => ({ default: m.AlMansurHisham })))
const FoucheNapoleon = lazy(() => import('./pages/mindset/case-studies/FoucheNapoleon').then(m => ({ default: m.FoucheNapoleon })))
const ZhouMao = lazy(() => import('./pages/mindset/case-studies/ZhouMao').then(m => ({ default: m.ZhouMao })))
const CecilElizabeth = lazy(() => import('./pages/mindset/case-studies/CecilElizabeth').then(m => ({ default: m.CecilElizabeth })))
const WeiZhengTaizong = lazy(() => import('./pages/mindset/case-studies/WeiZhengTaizong').then(m => ({ default: m.WeiZhengTaizong })))
const SewardLincoln = lazy(() => import('./pages/mindset/case-studies/SewardLincoln').then(m => ({ default: m.SewardLincoln })))
const LennonMcCartney = lazy(() => import('./pages/mindset/case-studies/LennonMcCartney').then(m => ({ default: m.LennonMcCartney })))
const WozniakJobs = lazy(() => import('./pages/mindset/case-studies/WozniakJobs').then(m => ({ default: m.WozniakJobs })))
const AobaiKangxi = lazy(() => import('./pages/mindset/case-studies/AobaiKangxi').then(m => ({ default: m.AobaiKangxi })))
const AiMisconceptions = lazy(() => import('./pages/mindset/AiMisconceptions').then(m => ({ default: m.AiMisconceptions })))
const GripCompass = lazy(() => import('./pages/mindset/GripCompass').then(m => ({ default: m.GripCompass })))
const GripLimitations = lazy(() => import('./pages/mindset/GripLimitations').then(m => ({ default: m.GripLimitations })))
const DevilsAdvocate = lazy(() => import('./pages/tools/DevilsAdvocate'))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

/** Suspense fallback for lazy-loaded routes. */
function LazyFallback() {
  return (
    <div className="flex items-center justify-center h-64" role="status" aria-label="Loading page">
      <div className="flex items-center gap-3 text-gray-400 text-sm">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading...
      </div>
    </div>
  )
}

/** Suspense wrapper for lazy-loaded routes. */
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LazyFallback />}>{children}</Suspense>
}

/** Route wrapper that extracts the scenarioId param. */
function ScenarioPlayerRoute() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  return <Lazy><ScenarioPlayer scenarioId={scenarioId ?? 'prod-incident-001'} /></Lazy>
}

/** Route wrapper for scenario results. */
function ScenarioResultsRouteWrapper() {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  return <Lazy><ScenarioResultsRoute scenarioId={scenarioId ?? 'prod-incident-001'} /></Lazy>
}

/** Redirect wrapper that preserves the scenarioId param. */
function ScenarioRedirect({ suffix }: { suffix?: string }) {
  const { scenarioId } = useParams<{ scenarioId: string }>()
  const target = suffix
    ? `/practice/workplace-scenarios/${scenarioId}/${suffix}`
    : `/practice/workplace-scenarios/${scenarioId}`
  return <Navigate to={target} replace />
}

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
        element: <Lazy><CodeComparison /></Lazy>,
      },
      {
        path: 'practice/pr-review',
        element: <Lazy><PRReview /></Lazy>,
      },
      {
        path: 'practice/ai-intent',
        element: <Lazy><AiIntent /></Lazy>,
      },
      {
        path: 'practice/intent-chat',
        element: <Lazy><IntentChat /></Lazy>,
      },
      {
        path: 'practice/ai-coding',
        element: <div>AI Assisted Coding - Coming Soon</div>,
      },
      {
        path: 'tools/devils-advocate/*',
        element: <Lazy><DevilsAdvocate /></Lazy>,
      },
      // Scenario routes (canonical paths)
      {
        path: 'practice/workplace-scenarios',
        element: <Lazy><ScenarioLibrary /></Lazy>,
      },
      {
        path: 'practice/workplace-scenarios/:scenarioId',
        element: <ScenarioPlayerRoute />,
      },
      {
        path: 'practice/workplace-scenarios/:scenarioId/results',
        element: <ScenarioResultsRouteWrapper />,
      },
      {
        path: 'practice/progress',
        element: <ProgressDashboard />,
      },
      // /scenarios aliases — redirect to canonical paths
      {
        path: 'scenarios',
        element: <Navigate to="/practice/workplace-scenarios" replace />,
      },
      {
        path: 'scenarios/:scenarioId',
        element: <ScenarioRedirect />,
      },
      {
        path: 'scenarios/:scenarioId/results',
        element: <ScenarioRedirect suffix="results" />,
      },
      // Settings
      {
        path: 'settings',
        element: <Lazy><SettingsPage /></Lazy>,
      },
      // Mindset routes (lazy-loaded)
      {
        path: 'mindset/historical-mapping',
        element: <Lazy><HistoricalContext /></Lazy>,
      },
      {
        path: 'mindset/ai-mapping',
        element: <Lazy><AiMapping /></Lazy>,
      },
      {
        path: 'mindset/grip-framework',
        element: <Lazy><GripFramework /></Lazy>,
      },
      {
        path: 'mindset/individual-audit',
        element: <Lazy><IndividualAudit /></Lazy>,
      },
      {
        path: 'mindset/organisational-audit',
        element: <Lazy><OrganisationalAudit /></Lazy>,
      },
      {
        path: 'mindset/ai-misconceptions',
        element: <Lazy><AiMisconceptions /></Lazy>,
      },
      {
        path: 'mindset/grip-compass',
        element: <Lazy><GripCompass /></Lazy>,
      },
      {
        path: 'mindset/grip-limitations',
        element: <Lazy><GripLimitations /></Lazy>,
      },
      // Case Studies routes
      {
        path: 'mindset/case-studies',
        element: <Lazy><CaseStudiesIndex /></Lazy>,
      },
      {
        path: 'mindset/case-studies/wei-zhongxian-tianqi',
        element: <Lazy><WeiZhongxianTianqi /></Lazy>,
      },
      {
        path: 'mindset/case-studies/sejanus-tiberius',
        element: <Lazy><SejanustTiberius /></Lazy>,
      },
      {
        path: 'mindset/case-studies/qin-hui-gaozong',
        element: <Lazy><QinHuiGaozong /></Lazy>,
      },
      {
        path: 'mindset/case-studies/rasputin-romanovs',
        element: <Lazy><RasputinRomanovs /></Lazy>,
      },
      {
        path: 'mindset/case-studies/al-mansur-hisham',
        element: <Lazy><AlMansurHisham /></Lazy>,
      },
      {
        path: 'mindset/case-studies/fouche-napoleon',
        element: <Lazy><FoucheNapoleon /></Lazy>,
      },
      {
        path: 'mindset/case-studies/zhou-mao',
        element: <Lazy><ZhouMao /></Lazy>,
      },
      {
        path: 'mindset/case-studies/cecil-elizabeth',
        element: <Lazy><CecilElizabeth /></Lazy>,
      },
      {
        path: 'mindset/case-studies/wei-zheng-taizong',
        element: <Lazy><WeiZhengTaizong /></Lazy>,
      },
      {
        path: 'mindset/case-studies/seward-lincoln',
        element: <Lazy><SewardLincoln /></Lazy>,
      },
      {
        path: 'mindset/case-studies/lennon-mccartney',
        element: <Lazy><LennonMcCartney /></Lazy>,
      },
      {
        path: 'mindset/case-studies/wozniak-jobs',
        element: <Lazy><WozniakJobs /></Lazy>,
      },
      {
        path: 'mindset/case-studies/aobai-kangxi',
        element: <Lazy><AobaiKangxi /></Lazy>,
      },
    ],
  },
])
