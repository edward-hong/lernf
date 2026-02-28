// src/routes.tsx (or app/routes.tsx)
import { createBrowserRouter } from 'react-router-dom'
import CodeComparison from './pages/tools/CodeComparison'
import PRReview from './pages/tools/PRReview'
import { HomePage } from './pages/HomePage'
import { Layout } from './components/Layout'
import { HistoricalContext } from './pages/mindset/HistoricalContext'
import { AiMapping } from './pages/mindset/AiMapping'
import { GripFramework } from './pages/mindset/GripFramework'
import { IndividualAudit } from './pages/mindset/IndividualAudit'
import { OrganisationalAudit } from './pages/mindset/OrganisationalAudit'
import { CaseStudiesIndex } from './pages/mindset/case-studies/CaseStudiesIndex'
import { WeiZhongxianTianqi } from './pages/mindset/case-studies/WeiZhongxianTianqi'
import { SejanustTiberius } from './pages/mindset/case-studies/SejanustTiberius'
import { QinHuiGaozong } from './pages/mindset/case-studies/QinHuiGaozong'
import { RasputinRomanovs } from './pages/mindset/case-studies/RasputinRomanovs'
import { AlMansurHisham } from './pages/mindset/case-studies/AlMansurHisham'
import { FoucheNapoleon } from './pages/mindset/case-studies/FoucheNapoleon'
import { ZhouMao } from './pages/mindset/case-studies/ZhouMao'
import { CecilElizabeth } from './pages/mindset/case-studies/CecilElizabeth'
import { WeiZhengTaizong } from './pages/mindset/case-studies/WeiZhengTaizong'
import { SewardLincoln } from './pages/mindset/case-studies/SewardLincoln'
import { LennonMcCartney } from './pages/mindset/case-studies/LennonMcCartney'
import { WozniakJobs } from './pages/mindset/case-studies/WozniakJobs'
import { AobaiKangxi } from './pages/mindset/case-studies/AobaiKangxi'

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
      {
        path: 'mindset/individual-audit',
        element: <IndividualAudit />,
      },
      {
        path: 'mindset/organisational-audit',
        element: <OrganisationalAudit />,
      },
      // Case Studies routes
      {
        path: 'mindset/case-studies',
        element: <CaseStudiesIndex />,
      },
      {
        path: 'mindset/case-studies/wei-zhongxian-tianqi',
        element: <WeiZhongxianTianqi />,
      },
      {
        path: 'mindset/case-studies/sejanus-tiberius',
        element: <SejanustTiberius />,
      },
      {
        path: 'mindset/case-studies/qin-hui-gaozong',
        element: <QinHuiGaozong />,
      },
      {
        path: 'mindset/case-studies/rasputin-romanovs',
        element: <RasputinRomanovs />,
      },
      {
        path: 'mindset/case-studies/al-mansur-hisham',
        element: <AlMansurHisham />,
      },
      {
        path: 'mindset/case-studies/fouche-napoleon',
        element: <FoucheNapoleon />,
      },
      {
        path: 'mindset/case-studies/zhou-mao',
        element: <ZhouMao />,
      },
      {
        path: 'mindset/case-studies/cecil-elizabeth',
        element: <CecilElizabeth />,
      },
      {
        path: 'mindset/case-studies/wei-zheng-taizong',
        element: <WeiZhengTaizong />,
      },
      {
        path: 'mindset/case-studies/seward-lincoln',
        element: <SewardLincoln />,
      },
      {
        path: 'mindset/case-studies/lennon-mccartney',
        element: <LennonMcCartney />,
      },
      {
        path: 'mindset/case-studies/wozniak-jobs',
        element: <WozniakJobs />,
      },
      {
        path: 'mindset/case-studies/aobai-kangxi',
        element: <AobaiKangxi />,
      },
    ],
  },
])
