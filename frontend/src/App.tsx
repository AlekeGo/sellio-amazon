import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import PricingPage from './pages/PricingPage'
import DashboardPage from './pages/DashboardPage'
import NewAuditPage from './pages/NewAuditPage'
import ResultsPage from './pages/ResultsPage'
import ImageStudioPage from './pages/ImageStudioPage'
import BillingPage from './pages/BillingPage'
import SettingsPage from './pages/SettingsPage'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/new-audit" element={<NewAuditPage />} />
              <Route path="/dashboard/results" element={<ResultsPage />} />
              <Route path="/dashboard/image-studio" element={<ImageStudioPage />} />
              <Route path="/dashboard/billing" element={<BillingPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/image-studio" element={<ImageStudioPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default function App() {
  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppRoutes />
      </GoogleOAuthProvider>
    )
  }
  return <AppRoutes />
}
