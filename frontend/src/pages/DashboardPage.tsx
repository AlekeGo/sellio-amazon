import { Link } from 'react-router-dom'
import { Plus, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#030812' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(14,165,233,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 text-center max-w-md">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)', boxShadow: '0 0 40px rgba(14,165,233,0.3)' }}
        >
          <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <path d="M6.5 9.5L8 11L11.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1
          className="text-3xl font-black mb-3 tracking-tight"
          style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}
        >
          Your Dashboard
        </h1>
        <p className="text-base mb-8 leading-relaxed" style={{ color: '#64748b' }}>
          The full dashboard is coming soon. Start your first audit to get going.
        </p>

        <Link to="/dashboard/new-audit" className="btn-primary glow-button">
          <Plus size={16} />
          New Audit
          <ArrowRight size={16} />
        </Link>

        <div className="mt-6">
          <Link
            to="/"
            className="text-sm transition-colors"
            style={{ color: '#475569', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
