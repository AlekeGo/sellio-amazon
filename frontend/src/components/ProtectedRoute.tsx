import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070e0a' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '2px solid rgba(163,230,53,0.12)',
              borderTopColor: '#a3e635',
              animation: 'spin 0.75s linear infinite',
            }}
          />
          <span style={{ color: '#475569', fontSize: '0.8125rem' }}>Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
