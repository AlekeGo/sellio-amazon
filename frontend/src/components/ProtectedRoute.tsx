import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070e0a' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px solid rgba(83,58,253,0.12)',
              borderTopColor: '#533AFD',
              animation: 'spin 0.75s linear infinite',
            }}
          />
          <span style={{ color: '#475569', fontSize: '0.8125rem' }}>Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    const next = location.pathname + location.search
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }
  return <Outlet />
}
