import { ImageIcon, Sparkles, ArrowRight, Zap, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'

const IMAGE_CATEGORIES = [
  {
    title: 'Main Image Refresh',
    desc: 'Clean, high-converting hero image with white background optimization.',
    goal: 'Drive click-through with a conversion-optimized main image.',
    gradient: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
  },
  {
    title: 'Benefit Infographic',
    desc: "Visual breakdown of your product's top features and benefits.",
    goal: 'Communicate value without requiring the shopper to read.',
    gradient: 'linear-gradient(135deg, #533AFD 0%, #7C6FFF 100%)',
  },
  {
    title: 'Comparison Graphic',
    desc: 'Side-by-side comparison showing why your product wins.',
    goal: 'Disqualify alternatives and position as the obvious choice.',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #533AFD 100%)',
  },
  {
    title: 'How It Works Visual',
    desc: 'Step-by-step visual walkthrough for complex or multi-use products.',
    goal: 'Remove purchase hesitation by showing simplicity.',
    gradient: 'linear-gradient(135deg, #4B35F0 0%, #6A55FE 100%)',
  },
  {
    title: 'Lifestyle Visual',
    desc: 'Product in real-world context to build emotional connection.',
    goal: 'Build emotional connection with your target buyer persona.',
    gradient: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
  },
  {
    title: 'A+ Banner Concept',
    desc: 'Premium Amazon A+ content banner with your brand positioning.',
    goal: 'Elevate brand trust and cross-sell potential at the bottom.',
    gradient: 'linear-gradient(135deg, #533AFD 0%, #7C6FFF 100%)',
  },
]

const WORKFLOW = [
  {
    num: '01',
    label: 'Run an Audit',
    desc: 'Sellio AI analyzes your listing and auto-generates a creative brief for all 6 image types.',
  },
  {
    num: '02',
    label: 'Open Image Studio',
    desc: 'Your audit data pre-fills goal, headline, and visual direction for each image.',
  },
  {
    num: '03',
    label: 'Generate Images',
    desc: 'One-click generation using your brief — powered by fal.ai. Preview, download, or regenerate from your gallery.',
  },
  {
    num: '04',
    label: 'Download & Upload',
    desc: 'Download your images directly and upload them to your Amazon listing.',
  },
]

function SL({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem', marginBottom: '1rem' }}>
      <div style={{
        width: 3, height: 14, borderRadius: 2,
        background: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)', flexShrink: 0,
      }} />
      <span style={{
        fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280',
        textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {children}
      </span>
    </div>
  )
}

export default function ImageStudioPage() {
  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="section-badge" style={{ marginBottom: '0.875rem', display: 'inline-flex' }}>
          <Sparkles size={12} />
          Image Studio
        </div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 900, color: '#f1f5f9',
          letterSpacing: '-0.04em', margin: '0 0 0.75rem', lineHeight: 1.15,
        }}>
          Turn your audit insights into
          <br />
          <span className="gradient-text">Amazon-ready image packs.</span>
        </h1>
        <p style={{
          fontSize: '0.9375rem', color: '#64748b',
          margin: '0 0 1.5rem', maxWidth: 540, lineHeight: 1.75,
        }}>
          Select an audit report to generate Amazon-ready visuals. Sellio Image Studio prepares creative briefs for all 6 image types — generate, preview, download, and manage your image pack.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            to="/dashboard/audits"
            className="btn-primary glow-button"
            style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
          >
            <Layers size={14} />
            Choose an Audit
          </Link>
          <Link
            to="/dashboard/new-audit"
            className="btn-secondary"
            style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
          >
            <Zap size={14} />
            Start New Audit
          </Link>
        </div>
      </div>

      <div style={{
        borderRadius: '0.875rem', padding: '1.375rem 1.5rem',
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        marginBottom: '2rem',
      }}>
        <SL>How it works</SL>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
          gap: '1.25rem',
        }}>
          {WORKFLOW.map(step => (
            <div key={step.num}>
              <div style={{
                fontSize: '1.625rem', fontWeight: 900,
                color: 'rgba(83,58,253,0.2)', letterSpacing: '-0.04em',
                lineHeight: 1, marginBottom: '0.5rem',
              }}>
                {step.num}
              </div>
              <div style={{
                fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9',
                marginBottom: '0.375rem', letterSpacing: '-0.01em',
              }}>
                {step.label}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <SL>Image pack categories — 6 types</SL>
        <div className="image-studio-grid">
          {IMAGE_CATEGORIES.map(cat => (
            <div
              key={cat.title}
              style={{
                borderRadius: '0.75rem', padding: '1.125rem 1.25rem',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', gap: '0.875rem',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(83,58,253,0.2)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '0.5rem',
                background: cat.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ImageIcon size={16} color="white" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9',
                  marginBottom: '0.25rem', letterSpacing: '-0.01em',
                }}>
                  {cat.title}
                </div>
                <div style={{
                  fontSize: '0.75rem', color: '#64748b', lineHeight: 1.55, marginBottom: '0.375rem',
                }}>
                  {cat.desc}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b', lineHeight: 1.5 }}>
                  <span style={{ color: 'rgba(83,58,253,0.6)', fontWeight: 600 }}>Goal: </span>
                  {cat.goal}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        borderRadius: '0.875rem', padding: '1.5rem 1.75rem',
        background: 'linear-gradient(135deg, rgba(83,58,253,0.05), rgba(83,58,253,0.04))',
        border: '1px solid rgba(83,58,253,0.14)',
        display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <h3 style={{
            fontSize: '1rem', fontWeight: 800, color: '#f1f5f9',
            margin: '0 0 0.25rem', letterSpacing: '-0.025em',
          }}>
            Ready to build your image pack?
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
            Open any audit report and click Image Studio to start generating your pack.
          </p>
        </div>
        <Link
          to="/dashboard/audits"
          className="btn-primary glow-button"
          style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}
        >
          <ArrowRight size={14} />
          View My Audits
        </Link>
      </div>
    </div>
  )
}
