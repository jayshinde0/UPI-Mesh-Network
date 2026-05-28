import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import PaymentPage from './pages/PaymentPage'
import TransactionsPage from './pages/TransactionsPage'
import EncryptionPage from './pages/EncryptionPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AdminPage from './pages/AdminPage'
import MeshTopologyPage from './pages/MeshTopologyPage'
import MeshSimulatorPage from './pages/MeshSimulatorPage'
import LiveLogsPage from './pages/LiveLogsPage'
import { Toaster } from './components/ui/toaster'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/payment"    element={<PaymentPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/mesh"       element={<MeshSimulatorPage />} />
          <Route path="/mesh-topology" element={<MeshTopologyPage />} />
          <Route path="/encryption" element={<EncryptionPage />} />
          <Route path="/analytics"  element={<AnalyticsPage />} />
          <Route path="/logs"       element={<LiveLogsPage />} />
          <Route path="/admin"      element={
            <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}
