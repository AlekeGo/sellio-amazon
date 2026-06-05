import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: '#070e0a' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(52,211,153,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: '#64748b', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(10,21,14,0.92)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          }}
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #166534, #4ade80)' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
                  <path d="M6.5 9.5L8 11L11.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>
                sell<span className="gradient-text">io</span>
              </span>
            </div>
            <h1 className="text-2xl font-black mb-2" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: '#64748b' }}>Sign in to your Sellio account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.border = '1px solid rgba(163,230,53,0.4)')}
                onBlur={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.border = '1px solid rgba(163,230,53,0.4)')}
                onBlur={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
              />
            </div>

            <button
              className="btn-primary w-full justify-center mt-2"
              onClick={() => alert('Auth coming in a future build.')}
            >
              Sign In
            </button>
          </div>

          <div
            className="mt-6 pt-6 text-center"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-xs" style={{ color: '#475569' }}>
              Don't have an account?{' '}
              <Link
                to="/dashboard/new-audit"
                style={{ color: '#a3e635', textDecoration: 'none' }}
              >
                Start for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
