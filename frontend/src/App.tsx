import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import PricingPage from './pages/PricingPage'
import DashboardPage from './pages/DashboardPage'
import NewAuditPage from './pages/NewAuditPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/new-audit" element={<NewAuditPage />} />
      </Routes>
    </BrowserRouter>
  )
}
