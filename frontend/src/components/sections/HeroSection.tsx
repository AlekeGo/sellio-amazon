import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Check } from 'lucide-react'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

const scoreItems = [
  { label: 'Title', score: 44, color: '#dc2626' },
  { label: 'Keywords', score: 61, color: '#f97316' },
  { label: 'Images', score: 55, color: '#f97316' },
  { label: 'Bullets', score: 58, color: '#b45309' },
]

const imgPreviews = [
  { label: 'Main', bg: 'linear-gradient(135deg, #533AFD 0%, #6A55FE 100%)' },
  { label: 'Info', bg: 'linear-gradient(135deg, #6A55FE 0%, #7C6FFF 100%)' },
  { label: 'Comp', bg: 'linear-gradient(135deg, #7C6FFF 0%, #9B8FFF 100%)' },
  { label: 'Life', bg: 'linear-gradient(135deg, #533AFD 0%, #8B7FFF 100%)' },
  { label: 'HiW', bg: 'linear-gradient(135deg, #6A55FE 0%, #C4BCFF 100%)' },
  { label: 'A+', bg: 'linear-gradient(135deg, #7C6FFF 0%, #E8E4FF 100%)' },
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
        background: '#ffffff',
        border: '1px solid rgba(196,188,255,0.55)',
        boxShadow: '0 32px 80px rgba(83,58,253,0.15), 0 0 0 1px rgba(196,188,255,0.2) inset',
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ background: 'rgba(83,58,253,0.04)', borderBottom: '1px solid rgba(196,188,255,0.38)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #533AFD, #6A55FE)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="6.5" width="1.8" height="3" rx="0.45" fill="white" opacity="0.65"/>
              <rect x="4.1" y="4" width="1.8" height="5.5" rx="0.45" fill="white" opacity="0.82"/>
              <rect x="7.2" y="1.5" width="1.8" height="8" rx="0.45" fill="white"/>
            </svg>
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--dp-ink-muted)' }}>
            Sellio Audit
          </span>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: 'rgba(83,58,253,0.1)', color: 'var(--dp-primary)', border: '1px solid rgba(83,58,253,0.22)' }}
        >
          ● Score Ready
        </span>
      </div>

      <div
        className="flex items-center gap-4 px-5 py-4"
        style={{ borderBottom: '1px solid rgba(196,188,255,0.30)' }}
      >
        <div style={{ flexShrink: 0 }}>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r={r} fill="none" stroke="rgba(196,188,255,0.30)" strokeWidth="5" />
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
                <stop offset="0%" stopColor="#533AFD" />
                <stop offset="100%" stopColor="#6A55FE" />
              </linearGradient>
            </defs>
            <text x="34" y="39" textAnchor="middle" fill="#0D253D" fontSize="15" fontWeight="700">67</text>
          </svg>
          <div className="flex items-center gap-1 mt-1.5">
            <TrendingUp size={10} style={{ color: 'var(--dp-primary)' }} />
            <span style={{ fontSize: '10px', color: 'var(--dp-primary)', fontWeight: 600 }}>→ 94</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--dp-ink)' }}>
            ProGlow Vitamin C Serum
          </p>
          <p className="text-xs mb-3" style={{ color: 'var(--dp-ink-muted)' }}>
            Listing Score <strong style={{ color: 'var(--dp-ink)' }}>67/100</strong>
          </p>
          <div className="space-y-1.5">
            {scoreItems.map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span style={{ width: '3.75rem', fontSize: '11px', color: 'var(--dp-ink-muted)', flexShrink: 0 }}>
                  {item.label}
                </span>
                <div style={{ flex: 1, height: '4px', borderRadius: '3px', background: 'rgba(196,188,255,0.30)' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid rgba(196,188,255,0.30)' }}>
        <div className="px-4 py-4" style={{ borderRight: '1px solid rgba(196,188,255,0.30)' }}>
          <div className="flex items-center gap-1.5 mb-2.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(83,58,253,0.12)', flexShrink: 0 }}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4L3 5.5L6.5 2" stroke="var(--dp-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--dp-primary)' }}>Title Upgraded</span>
          </div>
          <div
            className="p-2 rounded-lg mb-1.5"
            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)' }}
          >
            <p style={{ fontSize: '10px', color: 'var(--dp-ink-muted)', lineHeight: '1.45' }}>
              "Vitamin C Serum for Face…"
            </p>
          </div>
          <div
            className="p-2 rounded-lg"
            style={{ background: 'rgba(83,58,253,0.07)', border: '1px solid rgba(83,58,253,0.18)' }}
          >
            <p style={{ fontSize: '10px', color: 'var(--dp-ink)', lineHeight: '1.45' }}>
              "ProGlow 20% Vit C + Hyaluronic…"
            </p>
          </div>
          <p style={{ fontSize: '10px', color: 'var(--dp-primary)', marginTop: '7px', fontWeight: 600 }}>
            ↑ +34% CTR projected
          </p>
        </div>

        <div className="px-4 py-4">
          <span className="text-xs font-semibold block mb-2.5" style={{ color: 'var(--dp-ink-muted)' }}>
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
          <p style={{ fontSize: '10px', color: 'var(--dp-ink-muted)' }}>6 Amazon-ready visuals</p>
        </div>
      </div>

      <div className="px-5 py-3 flex items-center gap-3" style={{ background: 'rgba(83,58,253,0.03)' }}>
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(180,83,9,0.12)', flexShrink: 0 }}
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="#b45309">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--dp-ink-muted)', flex: 1 }}>
          "Ships fast" · <strong style={{ color: '#b45309' }}>84%</strong> of 5★ reviews
        </p>
        <div style={{ width: '56px', height: '4px', borderRadius: '3px', background: 'rgba(196,188,255,0.30)', flexShrink: 0 }}>
          <div style={{ width: '84%', height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #b45309, #f97316)' }} />
        </div>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#b45309', flexShrink: 0 }}>84%</span>
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById('audit-demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ paddingTop: '6rem' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: '900px', height: '900px',
            top: '-300px', left: '-200px',
            background: 'radial-gradient(circle, rgba(83,58,253,0.09) 0%, rgba(106,85,254,0.04) 40%, transparent 65%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '520px', height: '520px',
            top: '60px', right: '-80px',
            background: 'radial-gradient(circle, rgba(196,188,255,0.18) 0%, transparent 65%)',
            filter: 'blur(55px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '300px', height: '300px',
            bottom: '80px', right: '10%',
            background: 'radial-gradient(circle, rgba(83,58,253,0.07) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse 85% 48% at 50% 0%, rgba(83,58,253,0.08) 0%, transparent 58%)' }}
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
                style={{ background: 'rgba(83,58,253,0.08)', border: '1px solid rgba(83,58,253,0.22)', color: 'var(--dp-primary)' }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--dp-primary)', display: 'inline-block' }} />
                Amazon Listing Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
              className="font-black tracking-tight mb-5"
              style={{ fontSize: 'clamp(3rem, 5.5vw, 5.25rem)', letterSpacing: '-0.038em', lineHeight: '1.03' }}
            >
              <span style={{ display: 'block', color: 'var(--dp-ink)' }}>
                Average listings<br />
                don't look average.
              </span>
              <span style={{ display: 'block', paddingTop: '0.16em', color: 'var(--dp-ink)' }}>
                They look{' '}
                <span className="gradient-text">invisible.</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.24, ease: EASE }}
              className="leading-relaxed mb-7"
              style={{ color: 'var(--dp-ink-muted)', maxWidth: '380px', fontSize: '0.9375rem', lineHeight: '1.65' }}
            >
              Sellio finds what your listing is missing — then improves your copy, buyer signals, and Amazon-ready visuals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.34, ease: EASE }}
              className="hero-cta-row mb-8"
            >
              <Link to="/dashboard/new-audit" className="dp-btn-primary">
                Start Free Audit <ArrowRight size={16} />
              </Link>
              <button className="dp-btn-ghost" onClick={scrollToDemo}>
                View Sample Report
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.44, ease: EASE }}
              style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}
            >
              {['Amazon-ready copy', 'AI image pack', 'Score in 60s'].map(item => (
                <span key={item} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.3125rem 0.75rem', borderRadius: '99px',
                  background: 'rgba(83,58,253,0.05)', border: '1px solid rgba(196,188,255,0.45)',
                  fontSize: '0.8125rem', color: 'var(--dp-ink-secondary)', fontWeight: 500,
                }}>
                  <Check size={11} color="#2F9E6F" strokeWidth={2.5} />
                  {item}
                </span>
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
