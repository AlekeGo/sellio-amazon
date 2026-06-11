import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BarChart2, Eye, EyeOff, CheckCircle } from 'lucide-react'
import api from '../lib/api'

function extractError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response: { data: Record<string, unknown> } }).response?.data
    if (typeof data?.detail === 'string') return data.detail
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

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequestCode = async (e: FormEvent) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/request-password-reset/', { email })
      setStep(2)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault()
    if (!code) { setError('Please enter the 6-digit code.'); return }
    if (!newPassword) { setError('Please enter a new password.'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password/', { email, code, new_password: newPassword })
      setStep(3)
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'linear-gradient(145deg, #F0EDFF 0%, #F6F9FC 50%, #EDF3FF 100%)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(83,58,253,0.07) 0%, transparent 65%)',
      }} />

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 420 }}>
        <Link
          to="/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--dp-ink-muted)', textDecoration: 'none', marginBottom: '1.5rem', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--dp-ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--dp-ink-muted)')}
        >
          <ArrowLeft size={14} />
          Back to sign in
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

            {step === 3 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <CheckCircle size={40} color="#2F9E6F" strokeWidth={1.5} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dp-ink)', letterSpacing: '-0.03em', margin: '0 0 0.375rem' }}>
                  Password reset!
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dp-ink)', letterSpacing: '-0.03em', margin: '0 0 0.375rem' }}>
                  {step === 1 ? 'Forgot password?' : 'Enter reset code'}
                </h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
                  {step === 1
                    ? "Enter your email and we'll send you a 6-digit reset code."
                    : `We sent a 6-digit code to ${email}. Enter it below along with your new password.`}
                </p>
              </>
            )}
          </div>

          {step === 1 && (
            <form onSubmit={handleRequestCode} noValidate>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="dp-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Sending code...' : 'Send Reset Code'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-ink)', marginBottom: '0.375rem' }}>
                    6-digit reset code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    autoComplete="one-time-code"
                    autoFocus
                    inputMode="numeric"
                    style={{ ...inputStyle, letterSpacing: '0.25em', fontSize: '1.125rem', textAlign: 'center' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(83,58,253,0.6)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(196,188,255,0.55)')}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-ink)', marginBottom: '0.375rem' }}>
                    New password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
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
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setCode(''); setNewPassword(''); setError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--dp-ink-muted)', textAlign: 'center', padding: 0 }}
                >
                  Didn&apos;t receive a code? Go back
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <Link
              to="/login"
              className="dp-btn-primary"
              style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
