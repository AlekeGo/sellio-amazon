import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, BarChart2, Lock } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response: { data: Record<string, unknown> } }).response?.data
    if (typeof data?.detail === 'string') return data.detail
    if (Array.isArray(data?.non_field_errors)) return String(data.non_field_errors[0])
    const first = Object.values(data ?? {})[0]
    if (Array.isArray(first)) return String(first[0])
  }
  return 'Something went wrong. Please try again.'
}

const inputStyle = {
  width: '100%',
  borderRadius: '0.625rem',
  padding: '0.6875rem 1rem',
  fontSize: '0.875rem',
  background: '#F6F9FC',
  border: '1.5px solid rgba(196,188,255,0.55)',
  color: 'var(--dp-ink)',
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.15s ease',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleHovered, setGoogleHovered] = useState(false)
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const next = new URLSearchParams(location.search).get('next') || '/dashboard'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate(next)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (resp: { credential?: string }) => {
    if (!resp.credential) return
    setLoading(true)
    setError('')
    try {
      await googleLogin(resp.credential)
      navigate(next)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="auth-page-outer"
      style={{
        background: 'linear-gradient(145deg, #F0EDFF 0%, #F6F9FC 50%, #EDF3FF 100%)',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(83,58,253,0.07) 0%, transparent 65%)',
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--dp-ink-muted)', textDecoration: 'none', marginBottom: '1.5rem', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--dp-ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--dp-ink-muted)')}
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div style={{
          borderRadius: '1.25rem',
          padding: '2rem',
          background: '#ffffff',
          border: '1px solid rgba(196,188,255,0.45)',
          boxShadow: '0 8px 40px rgba(83,58,253,0.10)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={16} color="#fff" />
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--dp-ink)', letterSpacing: '-0.03em' }}>
                Sellio
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dp-ink)', letterSpacing: '-0.03em', margin: '0 0 0.375rem' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
              Sign in to your Sellio account
            </p>
          </div>

          {GOOGLE_CLIENT_ID && (
            <>
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{ position: 'relative', width: '100%', height: 48, borderRadius: 12, cursor: 'pointer' }}
                  onMouseEnter={() => setGoogleHovered(true)}
                  onMouseLeave={() => setGoogleHovered(false)}
                >
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    borderRadius: 12,
                    background: googleHovered ? 'rgba(83,58,253,0.06)' : '#F6F9FC',
                    border: googleHovered ? '1.5px solid rgba(83,58,253,0.35)' : '1.5px solid rgba(196,188,255,0.55)',
                    color: 'var(--dp-ink)',
                    fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.01em',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                    pointerEvents: 'none', userSelect: 'none',
                  }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #eee' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    Continue with Google
                  </div>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0, overflow: 'hidden', cursor: 'pointer' }}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError('Google Sign-In failed. Please try again.')}
                      width={500}
                      size="large"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(196,188,255,0.45)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)', whiteSpace: 'nowrap' }}>or continue with email</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(196,188,255,0.45)' }} />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-ink)', marginBottom: '0.375rem' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(83,58,253,0.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(196,188,255,0.55)')}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-ink)' }}>
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '0.75rem', color: 'var(--dp-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <Lock size={11} />
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: '2.75rem' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(83,58,253,0.6)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(196,188,255,0.55)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dp-ink-muted)', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', fontSize: '0.8125rem', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="dp-btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(196,188,255,0.38)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
              Don&apos;t have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--dp-primary)', textDecoration: 'none', fontWeight: 600 }}>
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
