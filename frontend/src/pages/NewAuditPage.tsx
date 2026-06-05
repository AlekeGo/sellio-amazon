import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Link2, Upload, ArrowLeft } from 'lucide-react'

function OptionCard({
  icon,
  title,
  description,
  detail,
}: {
  icon: ReactNode
  title: string
  description: string
  detail: string
}) {
  return (
    <div
      style={{
        borderRadius: '0.875rem',
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(163,230,53,0.2)'
        el.style.background = 'rgba(163,230,53,0.03)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.08)'
        el.style.background = 'rgba(255,255,255,0.025)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '0.625rem',
            background: 'linear-gradient(135deg, #166534, #4ade80)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#f1f5f9',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>{description}</p>
        </div>
      </div>

      <p
        style={{
          fontSize: '0.8125rem',
          color: '#475569',
          margin: 0,
          lineHeight: 1.6,
          paddingLeft: '3.5rem',
        }}
      >
        {detail}
      </p>

      <div style={{ paddingLeft: '3.5rem' }}>
        <button
          disabled
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5625rem 1rem',
            borderRadius: '0.5rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#475569',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'not-allowed',
          }}
        >
          Coming Day 4
        </button>
      </div>
    </div>
  )
}

export default function NewAuditPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          fontSize: '0.875rem',
          color: '#64748b',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
        onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <div className="section-badge" style={{ marginBottom: '0.875rem', display: 'inline-flex' }}>
          New Audit
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.375rem, 3vw, 1.75rem)',
            fontWeight: 900,
            color: '#f1f5f9',
            letterSpacing: '-0.03em',
            margin: '0 0 0.625rem',
          }}
        >
          Start with your Amazon listing
          <br />
          <span className="gradient-text">or product photos.</span>
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#64748b', margin: 0, maxWidth: 480 }}>
          Sellio will do the rest — audit your listing, score it, and generate premium visuals.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <OptionCard
          icon={<Link2 size={20} color="white" />}
          title="Paste Amazon URL"
          description="For sellers with an existing listing."
          detail="Sellio will auto-fill your title, images, category, price, and ratings directly from your Amazon product URL. No manual copy-pasting needed."
        />

        <OptionCard
          icon={<Upload size={20} color="white" />}
          title="Upload Product Photos"
          description="For sellers creating or improving a listing from scratch."
          detail="Upload your product photos and enter your product name, category, and main customer benefit. Sellio will analyze and build a complete audit from your assets."
        />
      </div>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '0.875rem 1.125rem',
          borderRadius: '0.625rem',
          background: 'rgba(163,230,53,0.04)',
          border: '1px solid rgba(163,230,53,0.12)',
          fontSize: '0.8125rem',
          color: '#64748b',
        }}
      >
        Full listing analysis and AI audit engine launches in Day 4. Check back soon.
      </div>
    </div>
  )
}
