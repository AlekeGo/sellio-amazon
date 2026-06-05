import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp } from 'lucide-react'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

const scoreItems = [
  { label: 'Title', score: 44, color: '#f87171' },
  { label: 'Keywords', score: 61, color: '#fb923c' },
  { label: 'Images', score: 55, color: '#fb923c' },
  { label: 'Bullets', score: 58, color: '#fbbf24' },
]

const imgPreviews = [
  { label: 'Main', bg: 'linear-gradient(135deg, #14532d, #4ade80)' },
  { label: 'Info', bg: 'linear-gradient(135deg, #065f46, #34d399)' },
  { label: 'Comp', bg: 'linear-gradient(135deg, #064e3b, #6ee7b7)' },
  { label: 'Life', bg: 'linear-gradient(135deg, #166534, #86efac)' },
  { label: 'HiW', bg: 'linear-gradient(135deg, #15803d, #a3e635)' },
  { label: 'A+', bg: 'linear-gradient(135deg, #3f6212, #d9f99d)' },
]

function HeroProductPanel() {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - 67 / 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.85, delay: 0.3, ease: EASE }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(10, 21, 14, 0.96)',
        border: '1px solid rgba(163,230,53,0.16)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03) inset',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          background: 'rgba(255,255,255,0.025)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #166534, #4ade80)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="6.5" width="1.8" height="3" rx="0.45" fill="white" opacity="0.65"/>
              <rect x="4.1" y="4" width="1.8" height="5.5" rx="0.45" fill="white" opacity="0.82"/>
              <rect x="7.2" y="1.5" width="1.8" height="8" rx="0.45" fill="white"/>
            </svg>
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#64748b' }}>
            Sellio Audit
          </span>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{
            background: 'rgba(163,230,53,0.1)',
            color: '#a3e635',
            border: '1px solid rgba(163,230,53,0.22)',
          }}
        >
          ● Score Ready
        </span>
      </div>

      <div
        className="flex items-center gap-4 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div style={{ flexShrink: 0 }}>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="34" cy="34" r={r}
              fill="none"
              stroke="url(#heroScoreGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 34 34)"
            />
            <defs>
              <linearGradient id="heroScoreGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a3e635" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <text x="34" y="39" textAnchor="middle" fill="#f1f5f9" fontSize="15" fontWeight="700">67</text>
          </svg>
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp size={10} style={{ color: '#a3e635' }} />
            <span style={{ fontSize: '10px', color: '#a3e635', fontWeight: 600 }}>→ 94</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="text-sm font-semibold mb-0.5" style={{ color: '#f1f5f9' }}>
            ProGlow Vitamin C Serum
          </p>
          <p className="text-xs mb-3" style={{ color: '#475569' }}>
            Listing Score <strong style={{ color: '#94a3b8' }}>67/100</strong>
          </p>
          <div className="space-y-1.5">
            {scoreItems.map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span style={{ width: '3.75rem', fontSize: '11px', color: '#6b7280', flexShrink: 0 }}>
                  {item.label}
                </span>
                <div style={{ flex: 1, height: '4px', borderRadius: '3px', background: 'rgba(255,255,255,0.07)' }}>
                  <div style={{ width: `${item.score}%`, height: '100%', borderRadius: '3px', background: item.color }} />
                </div>
                <span style={{ width: '1.5rem', fontSize: '11px', fontWeight: 600, color: item.color, textAlign: 'right', flexShrink: 0 }}>
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-4 py-4" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(163,230,53,0.15)', flexShrink: 0 }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3 5.5L6.5 2" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs font-semibold" style={{ color: '#a3e635' }}>Title Upgraded</span>
          </div>
          <div
            className="p-2 rounded-lg mb-1.5"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}
          >
            <p style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.45' }}>
              "Vitamin C Serum for Face…"
            </p>
          </div>
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(163,230,53,0.07)', border: '1px solid rgba(163,230,53,0.18)' }}
          >
            <p style={{ fontSize: '10px', color: '#f1f5f9', lineHeight: '1.45' }}>
              "ProGlow 20% Vit C + Hyaluronic…"
            </p>
          </div>
          <p style={{ fontSize: '10px', color: '#a3e635', marginTop: '7px', fontWeight: 600 }}>
            ↑ +34% CTR projected
          </p>
        </div>

        <div className="px-4 py-4">
          <span
            className="text-xs font-semibold block mb-2.5"
            style={{ color: '#94a3b8' }}
          >
            Image Pack Ready
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', marginBottom: '8px' }}>
            {imgPreviews.map(img => (
              <div
                key={img.label}
                className="rounded-md flex items-center justify-center"
                style={{ background: img.bg, aspectRatio: '1/1' }}
              >
                <span style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
                  {img.label}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '10px', color: '#6b7280' }}>6 Amazon-ready visuals</p>
        </div>
      </div>

      <div
        className="px-5 py-3 flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.015)' }}
      >
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(251,191,36,0.15)', flexShrink: 0 }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="#fbbf24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <p style={{ fontSize: '11px', color: '#94a3b8', flex: 1 }}>
          "Ships fast" · <strong style={{ color: '#fbbf24' }}>84%</strong> of 5★ reviews
        </p>
        <div style={{ width: '56px', height: '4px', borderRadius: '3px', background: 'rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ width: '84%', height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #fbbf24, #f97316)' }} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#fbbf24', flexShrink: 0 }}>84%</span>
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById('audit-demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ paddingTop: '5.5rem' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: '900px', height: '900px',
            top: '-300px', left: '-200px',
            background: 'radial-gradient(circle, rgba(52,211,153,0.09) 0%, rgba(34,197,94,0.04) 40%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '520px', height: '520px',
            top: '60px', right: '-80px',
            background: 'radial-gradient(circle, rgba(163,230,53,0.07) 0%, transparent 65%)',
            filter: 'blur(55px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '300px', height: '300px',
            bottom: '80px', right: '10%',
            background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 85% 48% at 50% 0%, rgba(52,211,153,0.07) 0%, transparent 58%)',
          }}
        />
      </div>

      <div className="container-xl relative z-10 py-8">
        <div className="hero-grid">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
              className="mb-6"
            >
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{
                  background: 'rgba(163,230,53,0.08)',
                  border: '1px solid rgba(163,230,53,0.22)',
                  color: '#a3e635',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                Amazon Listing Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
              className="font-black tracking-tight mb-5"
              style={{
                fontSize: 'clamp(3rem, 5.5vw, 5.25rem)',
                letterSpacing: '-0.038em',
                lineHeight: '1.03',
              }}
            >
              <span style={{ display: 'block', color: '#f1f5f9' }}>
                Average listings<br />
                don't look average.
              </span>
              <span style={{ display: 'block', paddingTop: '0.16em', color: '#f1f5f9' }}>
                They look{' '}
                <span className="gradient-text">invisible.</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.24, ease: EASE }}
              className="leading-relaxed mb-7"
              style={{ color: '#7a8c9e', maxWidth: '380px', fontSize: '0.9375rem', lineHeight: '1.65' }}
            >
              Sellio finds what your listing is missing — then improves your copy, buyer signals, and Amazon-ready visuals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease: EASE }}
              className="hero-cta-row mb-8"
            >
              <Link to="/dashboard/new-audit" className="btn-primary glow-button">
                Start Free Audit <ArrowRight size={16} />
              </Link>
              <button className="btn-secondary" onClick={scrollToDemo}>
                View Sample Report
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.44, ease: EASE }}
              className="hero-stats"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1rem' }}
            >
              {[
                { value: '2,400+', label: 'Listings Audited' },
                { value: '94%', label: 'Score Improvement' },
                { value: '< 60s', label: 'To First Insight' },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-4">
                  {i > 0 && (
                    <div style={{ width: '1px', height: '2rem', background: 'rgba(255,255,255,0.07)' }} />
                  )}
                  <div>
                    <div
                      className="text-2xl font-black leading-none mb-0.5"
                      style={{
                        background: 'linear-gradient(135deg, #a3e635, #34d399)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs" style={{ color: '#64748b' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="hero-visual-panel">
            <HeroProductPanel />
          </div>
        </div>
      </div>
    </section>
  )
}
