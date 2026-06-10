import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) { setError('Full name cannot be empty.'); return }
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      await updateProfile({ full_name: fullName.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const cardStyle = {
    borderRadius: '0.875rem',
    padding: '1.5rem',
    background: '#ffffff',
    border: '1px solid rgba(196,188,255,0.45)',
    boxShadow: '0 2px 12px rgba(83,58,253,0.06)',
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

  const disabledInputStyle = {
    ...inputStyle,
    background: 'rgba(196,188,255,0.08)',
    color: 'var(--dp-ink-muted)',
    cursor: 'not-allowed',
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, color: 'var(--dp-ink)', letterSpacing: '-0.03em', margin: '0 0 0.375rem' }}>
          Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: 0 }}>
          Manage your profile and account preferences.
        </p>
      </div>

      <div style={{ ...cardStyle, marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dp-ink-muted)', margin: '0 0 1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Profile
        </h2>

        <form onSubmit={handleSave} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-ink)', marginBottom: '0.375rem' }}>
                Email address
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                style={disabledInputStyle}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--dp-ink-muted)', margin: '0.375rem 0 0' }}>
                Email cannot be changed.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--dp-ink)', marginBottom: '0.375rem' }}>
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
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

            {saved && (
              <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.22)', fontSize: '0.8125rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Check size={13} />
                Changes saved successfully.
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="dp-btn-primary"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dp-ink-muted)', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Account
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--dp-ink-muted)', margin: '0 0 1rem' }}>
          Sign out of your Sellio account on this device.
        </p>
        <button
          onClick={handleLogout}
          className="dp-btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', borderColor: 'rgba(239,68,68,0.3)' }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  )
}
