import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdvocateLanding from '../../components/DevilsAdvocate/AdvocateLanding'
import AdvocateSession from './DevilsAdvocateSession'

const DevilsAdvocate: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdvocateLanding />} />
      <Route path="/session" element={<AdvocateSession />} />
      <Route path="*" element={<Navigate to="/tools/devils-advocate" replace />} />
    </Routes>
  )
}

export default DevilsAdvocate
