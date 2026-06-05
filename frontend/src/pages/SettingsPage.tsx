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

  const inputStyle = {
    width: '100%',
    borderRadius: '0.625rem',
    padding: '0.6875rem 1rem',
    fontSize: '0.875rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const disabledInputStyle = {
    ...inputStyle,
    background: 'rgba(255,255,255,0.02)',
    color: '#475569',
    cursor: 'not-allowed',
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1
          style={{
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            fontWeight: 900,
            color: '#f1f5f9',
            letterSpacing: '-0.03em',
            margin: '0 0 0.375rem',
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Manage your profile and account preferences.
        </p>
      </div>

      <div
        style={{
          borderRadius: '0.875rem',
          padding: '1.5rem',
          background: 'rgba(10,21,14,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '1.25rem',
        }}
      >
        <h2
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#94a3b8',
            margin: '0 0 1.25rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Profile
        </h2>

        <form onSubmit={handleSave} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#94a3b8',
                  marginBottom: '0.375rem',
                }}
              >
                Email address
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                style={disabledInputStyle}
              />
              <p style={{ fontSize: '0.75rem', color: '#334155', margin: '0.375rem 0 0' }}>
                Email cannot be changed.
              </p>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#94a3b8',
                  marginBottom: '0.375rem',
                }}
              >
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.border = '1px solid rgba(163,230,53,0.4)')}
                onBlur={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  fontSize: '0.8125rem',
                  color: '#fca5a5',
                }}
              >
                {error}
              </div>
            )}

            {saved && (
              <div
                style={{
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(163,230,53,0.08)',
                  border: '1px solid rgba(163,230,53,0.2)',
                  fontSize: '0.8125rem',
                  color: '#a3e635',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <Check size={13} />
                Changes saved successfully.
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div
        style={{
          borderRadius: '0.875rem',
          padding: '1.5rem',
          background: 'rgba(10,21,14,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h2
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: '#94a3b8',
            margin: '0 0 0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Account
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 1rem' }}>
          Sign out of your Sellio account on this device.
        </p>
        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  )
}
