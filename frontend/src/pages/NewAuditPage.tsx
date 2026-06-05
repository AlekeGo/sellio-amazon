import { Link } from 'react-router-dom'
import { ClipboardPaste, ArrowRight, ArrowLeft } from 'lucide-react'

export default function NewAuditPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative"
      style={{ background: '#070e0a' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(52,211,153,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-xl">
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
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #166534, #4ade80)' }}
            >
              <ClipboardPaste size={18} color="white" />
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>New Audit</h1>
              <p className="text-xs" style={{ color: '#64748b' }}>Free · No account required</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                ASIN or Listing URL (optional)
              </label>
              <input
                type="text"
                placeholder="B09XG4MHTY or amazon.com/dp/..."
                className="w-full rounded-xl px-4 py-3 text-sm transition-all"
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
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#64748b' }}>
                Paste Your Listing Content
              </label>
              <textarea
                placeholder="Paste your product title, bullet points, and description here..."
                rows={7}
                className="w-full rounded-xl px-4 py-3 text-sm transition-all resize-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f1f5f9',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={e => (e.currentTarget.style.border = '1px solid rgba(163,230,53,0.4)')}
                onBlur={e => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)')}
              />
            </div>

            <button
              className="btn-primary w-full justify-center glow-button"
              onClick={() => alert('AI audit engine coming in a future build.')}
            >
              Run Free Audit <ArrowRight size={16} />
            </button>
          </div>

          <p className="text-xs text-center mt-5" style={{ color: '#334155' }}>
            Free audit · 1 per account · Results in under 60 seconds
          </p>
        </div>
      </div>
    </div>
  )
}
