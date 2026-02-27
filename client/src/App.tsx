import { useState } from 'react'
import CodeComparison from './components/Abby/CodeComparison'
import PRReview from './components/Actice/PRReview'
import './App.css'

function App() {
  const [activeFeature, setActiveFeature] = useState<'comparison' | 'pr'>(
    'comparison'
  )

  return (
    <div className="App">
      <nav className="feature-nav">
        <button
          className={activeFeature === 'comparison' ? 'active' : ''}
          onClick={() => setActiveFeature('comparison')}
        >
          Feature 1: Code Comparison
        </button>
        <button
          className={activeFeature === 'pr' ? 'active' : ''}
          onClick={() => setActiveFeature('pr')}
        >
          Feature 2: PR Review
        </button>
      </nav>

      {activeFeature === 'comparison' && <CodeComparison />}
      {activeFeature === 'pr' && <PRReview />}
    </div>
  )
}

export default App
