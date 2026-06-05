import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Star, Zap } from 'lucide-react'

function HeroVisualCard({
  children,
  style = {},
  delay = 0,
  floatDuration = 5,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  delay?: number
  floatDuration?: number
}) {
  return (
    <motion.div
      className="glass-card rounded-2xl absolute"
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.06) inset',
        ...style,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: [0, -12, 0] }}
      transition={{
        opacity: { duration: 0.5, delay },
        y: {
          duration: floatDuration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: delay + 0.5,
        },
      }}
    >
      {children}
    </motion.div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke="url(#scoreGrad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
      />
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <text x="36" y="40" textAnchor="middle" fill="#f1f5f9" fontSize="14" fontWeight="700">{score}</text>
    </svg>
  )
}

function AuditScoreCard() {
  return (
    <div className="p-5 w-72">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)' }}>
          <Zap size={13} color="white" />
        </div>
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#64748b' }}>Sellio Audit</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', marginLeft: 'auto' }}>Live</span>
      </div>

      <p className="text-sm font-semibold mb-1" style={{ color: '#f1f5f9' }}>ProGlow Vitamin C Serum</p>
      <p className="text-xs mb-4" style={{ color: '#475569' }}>30ml · ASIN: B09XG4MHTY</p>

      <div className="flex items-center gap-4 mb-4">
        <ScoreRing score={78} />
        <div>
          <p className="text-xs mb-1" style={{ color: '#64748b' }}>Current Score</p>
          <p className="text-2xl font-black" style={{ color: '#f1f5f9' }}>78<span className="text-sm font-normal" style={{ color: '#475569' }}>/100</span></p>
          <div className="flex items-center gap-1 mt-0.5">
            <TrendingUp size={11} style={{ color: '#4ade80' }} />
            <span className="text-xs font-medium" style={{ color: '#4ade80' }}>Potential: 94/100</span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          { label: 'Title', score: 41, color: '#f87171' },
          { label: 'Keywords', score: 52, color: '#fb923c' },
          { label: 'Images', score: 60, color: '#facc15' },
          { label: 'Bullets', score: 55, color: '#fb923c' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span className="text-xs shrink-0" style={{ color: '#64748b', width: '4rem' }}>{item.label}</span>
            <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ width: `${item.score}%`, height: '100%', borderRadius: '3px', background: item.color }} />
            </div>
            <span className="text-xs font-medium" style={{ color: item.color, width: '2rem', textAlign: 'right' }}>{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TitleUpgradeCard() {
  return (
    <div className="p-4" style={{ width: '224px' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.2)' }}>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3 5.5L6.5 2" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>Title Upgraded</span>
      </div>
      <div className="space-y-2">
        <div className="p-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
          <p className="text-xs leading-tight" style={{ color: '#94a3b8' }}>Before: "Vitamin C Serum for Face..."</p>
        </div>
        <div className="p-2 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)' }}>
          <p className="text-xs leading-tight" style={{ color: '#f1f5f9' }}>After: "ProGlow 20% Vitamin C + Hyaluronic..."</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1">
        <TrendingUp size={11} style={{ color: '#38bdf8' }} />
        <span className="text-xs" style={{ color: '#38bdf8' }}>+34% CTR projected</span>
      </div>
    </div>
  )
}

function ImagePackCard() {
  const images = [
    { label: 'Main', color: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' },
    { label: 'Info', color: 'linear-gradient(135deg,#7c3aed,#a78bfa)' },
    { label: 'B/A', color: 'linear-gradient(135deg,#059669,#34d399)' },
    { label: 'Life', color: 'linear-gradient(135deg,#d97706,#fbbf24)' },
  ]
  return (
    <div className="p-4" style={{ width: '240px' }}>
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(167,139,250,0.2)' }}>
          <Star size={10} fill="#a78bfa" color="#a78bfa" />
        </div>
        <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>Image Pack Ready</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {images.map(img => (
          <div key={img.label} className="rounded-lg flex items-end p-1" style={{ background: img.color, aspectRatio: '1/1' }}>
            <span style={{ fontSize: '9px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{img.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{ color: '#64748b' }}>6 premium Amazon visuals · AI-generated</p>
    </div>
  )
}

const EASE = [0.21, 0.47, 0.32, 0.98] as const

export default function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById('audit-demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            width: '600px', height: '600px',
            top: '-200px', left: '-100px',
            background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '500px', height: '500px',
            top: '0', right: '0',
            background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '300px', height: '300px',
            bottom: '100px', left: '40%',
            background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(14,165,233,0.07) 0%, transparent 60%)',
          }}
        />
      </div>

      <div className="container-xl relative z-10 py-20 lg:py-28">
        <div className="hero-grid">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
              className="mb-8"
            >
              <div className="section-badge w-fit">
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22d3ee', display: 'inline-block', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                AI Amazon Conversion Studio
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
              className="font-black leading-tight tracking-tight mb-7"
              style={{ fontSize: 'clamp(2.75rem, 6vw, 4.5rem)', letterSpacing: '-0.03em', lineHeight: '1.05' }}
            >
              Average listings<br />
              don't look average.
              <br /><br />
              They look{' '}
              <span className="gradient-text">invisible.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.25, ease: EASE }}
              className="text-lg leading-relaxed mb-10"
              style={{ color: '#94a3b8', maxWidth: '520px' }}
            >
              Sellio audits your Amazon listing, sharpens the copy, reveals missed buyer signals, and helps generate premium visuals that make your product impossible to ignore.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
              className="hero-cta-row mb-14"
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
              transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
              className="hero-stats"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.75rem' }}
            >
              {[
                { value: '2,400+', label: 'Listings Audited' },
                { value: '94%', label: 'Score Improvement' },
                { value: '< 60s', label: 'To First Insight' },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-4">
                  {i > 0 && <div style={{ width: '1px', height: '2rem', background: 'rgba(255,255,255,0.08)' }} />}
                  <div>
                    <div className="text-2xl font-black gradient-text-cyan leading-none mb-0.5">{stat.value}</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="hero-visual-panel"
            style={{ height: '520px', position: 'relative' }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          >
            <HeroVisualCard
              style={{ top: '20px', left: '0' }}
              delay={0.5}
              floatDuration={5}
            >
              <AuditScoreCard />
            </HeroVisualCard>

            <HeroVisualCard
              style={{ top: '10px', right: '0' }}
              delay={0.75}
              floatDuration={6}
            >
              <TitleUpgradeCard />
            </HeroVisualCard>

            <HeroVisualCard
              style={{ bottom: '30px', right: '20px' }}
              delay={1.0}
              floatDuration={5.5}
            >
              <ImagePackCard />
            </HeroVisualCard>

            <div
              className="absolute pointer-events-none"
              style={{
                bottom: '64px', left: '40px',
                width: '160px', height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
