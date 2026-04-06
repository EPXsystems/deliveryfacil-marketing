import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import Leads from './pages/Leads'
import Agents from './pages/Agents'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="leads" element={<Leads />} />
          <Route path="agents" element={<Agents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
