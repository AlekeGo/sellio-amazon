import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

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
  padding: '0.875rem 1rem',
  fontSize: '1.5rem',
  fontWeight: 700,
  background: '#F6F9FC',
  border: '1.5px solid rgba(196,188,255,0.55)',
  color: 'var(--dp-ink)',
  outline: 'none',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.15s ease',
  textAlign: 'center' as const,
  letterSpacing: '0.4em',
}

export default function VerifyEmailPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendMsg, setResendMsg] = useState('')
  const { user, loading: authLoading, verifyEmail, resendVerification } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (user.email_verified) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = code.replace(/\s/g, '')
    if (trimmed.length !== 6) { setError('Please enter the 6-digit code.'); return }
    setLoading(true)
    setError('')
    try {
      await verifyEmail(trimmed)
      navigate('/dashboard')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError('')
    setResendMsg('')
    try {
      await resendVerification()
      setResendMsg('A new code has been sent to your email.')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setResendLoading(false)
    }
  }

  if (authLoading) return null

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

            <div style={{
              width: 52, height: 52, borderRadius: '0.875rem',
              background: 'rgba(83,58,253,0.07)',
              border: '1px solid rgba(83,58,253,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <Mail size={22} color="var(--dp-primary)" />
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dp-ink)', letterSpacing: '-0.03em', margin: '0 0 0.375rem' }}>
              Check your email
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0, lineHeight: 1.5 }}>
              We sent a 6-digit code to{' '}
              {user?.email ? (
                <strong style={{ color: 'var(--dp-ink)', fontWeight: 600 }}>{user.email}</strong>
              ) : 'your email address'}
              . Enter it below to verify your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-ink)', marginBottom: '0.375rem' }}>
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  autoFocus
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(83,58,253,0.6)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(196,188,255,0.55)')}
                />
              </div>

              {error && (
                <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)', fontSize: '0.8125rem', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              {resendMsg && (
                <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.22)', fontSize: '0.8125rem', color: '#16a34a' }}>
                  {resendMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="dp-btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </form>

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(196,188,255,0.38)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
              Didn&apos;t receive a code?{' '}
              <button
                onClick={handleResend}
                disabled={resendLoading}
                style={{ background: 'none', border: 'none', cursor: resendLoading ? 'default' : 'pointer', color: 'var(--dp-primary)', fontWeight: 600, fontSize: '0.8125rem', padding: 0, fontFamily: 'inherit', opacity: resendLoading ? 0.6 : 1 }}
              >
                {resendLoading ? 'Sending...' : 'Resend code'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
