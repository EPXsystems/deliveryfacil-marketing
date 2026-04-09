import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Captacao from './pages/Captacao'
import Pipeline from './pages/Pipeline'
import Leads from './pages/Leads'
import Conversas from './pages/Conversas'
import Agente from './pages/Agente'
import Automacao from './pages/Automacao'
import Configuracoes from './pages/Configuracoes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="captacao"      element={<Captacao />} />
          <Route path="pipeline"      element={<Pipeline />} />
          <Route path="leads"         element={<Leads />} />
          <Route path="conversas"     element={<Conversas />} />
          <Route path="agente"        element={<Agente />} />
          <Route path="automacao"     element={<Automacao />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
