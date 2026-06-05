import { Link } from 'react-router-dom'
import { BarChart2, Zap } from 'lucide-react'

export default function ResultsPage() {
  return (
    <div style={{ maxWidth: 600 }}>
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
          Results
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Your audit reports and analysis history.
        </p>
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: '0.875rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}
        >
          <BarChart2 size={22} color="#334155" />
        </div>
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#64748b',
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          No results yet
        </h2>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#475569',
            margin: '0 0 1.5rem',
            maxWidth: 320,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Run your first AI audit to see your listing score, keyword analysis, and improvement
          recommendations here.
        </p>
        <Link to="/dashboard/new-audit" className="btn-primary">
          <Zap size={15} />
          Start your first audit
        </Link>
      </div>
    </div>
  )
}
