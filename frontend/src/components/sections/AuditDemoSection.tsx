import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, AlertTriangle, CheckCircle, ArrowRight, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '../ui/AnimatedSection'

const TABS = ['Overview', 'Title', 'Bullets', 'Keywords', 'Reviews'] as const
type Tab = typeof TABS[number]

const issues = [
  { label: 'Title too generic — missing category triggers', score: 44, severity: 'high' },
  { label: '12 high-volume buyer signals not indexed', score: 55, severity: 'high' },
  { label: 'Bullet points feature-heavy, not benefit-focused', score: 58, severity: 'medium' },
  { label: 'Main image too similar to top competitor', score: 62, severity: 'medium' },
  { label: 'No brand story or social proof in description', score: 65, severity: 'low' },
  { label: 'Description structure solid but under-optimized', score: 74, severity: 'ok' },
]

const subScores = [
  { label: 'Title', value: 44, max: 100, color: '#f87171' },
  { label: 'Keywords', value: 55, max: 100, color: '#fb923c' },
  { label: 'Bullets', value: 58, max: 100, color: '#fb923c' },
  { label: 'Images', value: 62, max: 100, color: '#fbbf24' },
  { label: 'Description', value: 74, max: 100, color: '#4ade80' },
  { label: 'Reviews', value: 68, max: 100, color: '#fbbf24' },
]

const severityColors: Record<string, { color: string; bg: string; border: string }> = {
  high: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
  low: { color: '#94a3b8', bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)' },
  ok: { color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
}

function ScoreGauge({ score, potential }: { score: number; potential: number }) {
  const r = 56
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)
  const potOffset = circ * (1 - potential / 100)

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="144" height="144" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(163,230,53,0.1)" strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={potOffset}
            transform="rotate(-90 72 72)" />
          <circle cx="72" cy="72" r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 72 72)" />
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a3e635" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <text x="72" y="65" textAnchor="middle" fill="#f1f5f9" fontSize="28" fontWeight="800">{score}</text>
          <text x="72" y="82" textAnchor="middle" fill="#64748b" fontSize="11">/100</text>
        </svg>
      </div>
      <p className="text-xs mt-1" style={{ color: '#64748b' }}>Listing Score</p>
      <div className="flex items-center gap-1 mt-1">
        <TrendingUp size={12} style={{ color: '#a3e635' }} />
        <span className="text-xs font-semibold" style={{ color: '#a3e635' }}>Potential: {potential}/100</span>
      </div>
    </div>
  )
}

function TabOverview() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#64748b' }}>Issues Found</h4>
        <div className="space-y-2.5">
          {issues.map((issue) => {
            const { color, bg, border } = severityColors[issue.severity]
            return (
              <div key={issue.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: bg, border: `1px solid ${border}` }}>
                {issue.severity === 'ok'
                  ? <CheckCircle size={14} style={{ color, flexShrink: 0 }} />
                  : <AlertTriangle size={14} style={{ color, flexShrink: 0 }} />
                }
                <span className="text-xs flex-1 leading-snug" style={{ color: issue.severity === 'ok' ? '#94a3b8' : '#f1f5f9' }}>
                  {issue.label}
                </span>
                <span className="text-xs font-bold tabular-nums shrink-0" style={{ color }}>{issue.score}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#64748b' }}>Score Breakdown</h4>
        <div className="space-y-3.5">
          {subScores.map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: '#94a3b8' }}>{s.label}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
              </div>
              <div className="score-bar-track">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: s.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.value}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabTitle() {
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f87171' }}>Current Title</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}>44/100</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
          "Vitamin C Serum for Face - Anti-Aging Serum with Vitamin E"
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Too short (52 chars)', 'Missing category', 'No size/quantity', 'Weak keyword triggers'].map(tag => (
            <span key={tag} className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>⚠ {tag}</span>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: 'rgba(163,230,53,0.05)', border: '1px solid rgba(163,230,53,0.18)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#a3e635' }}>AI-Upgraded Title</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(163,230,53,0.1)', color: '#a3e635' }}>94/100</span>
        </div>
        <p className="text-sm leading-relaxed font-medium" style={{ color: '#f1f5f9' }}>
          "ProGlow Vitamin C Serum 30ml | 20% L-Ascorbic Acid + Hyaluronic Acid | Brightening Anti-Aging Face Serum for Glowing Skin | Dermatologist-Tested, Fragrance-Free"
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Category anchor added', 'Size included', '5 high-volume keywords', 'Trust signals'].map(tag => (
            <span key={tag} className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(163,230,53,0.08)', color: '#a3e635' }}>✓ {tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabBullets() {
  const bullets = [
    {
      before: 'Contains 20% Vitamin C concentration',
      after: 'Clinical-Grade 20% L-Ascorbic Acid — The highest stable form of Vitamin C for visible brightening in 14 days, even on sensitive skin',
      impact: 'Adds urgency, specificity, and audience targeting',
    },
    {
      before: 'Made with Hyaluronic Acid for hydration',
      after: 'Triple-Action Hydration Lock — Micro and macro Hyaluronic Acid molecules penetrate every skin layer, leaving your skin visibly plumped and dewy all day',
      impact: 'Replaces generic claim with vivid benefit language',
    },
  ]
  return (
    <div className="space-y-5">
      {bullets.map((b, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="p-4" style={{ background: 'rgba(248,113,113,0.06)' }}>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f87171' }}>Before</span>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: '#94a3b8' }}>• {b.before}</p>
          </div>
          <div className="p-4" style={{ background: 'rgba(163,230,53,0.05)' }}>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#a3e635' }}>After</span>
            <p className="text-sm mt-2 leading-relaxed font-medium" style={{ color: '#f1f5f9' }}>• {b.after}</p>
            <p className="text-xs mt-2" style={{ color: '#64748b' }}>↑ {b.impact}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function TabKeywords() {
  const keywords = [
    { kw: 'vitamin c serum for brightening', volume: '+2,400/mo', difficulty: 'Medium', opportunity: 'High' },
    { kw: 'vitamin c hyaluronic acid serum', volume: '+1,800/mo', difficulty: 'Medium', opportunity: 'High' },
    { kw: 'fragrance free vitamin c serum', volume: '+1,200/mo', difficulty: 'Low', opportunity: 'Very High' },
    { kw: 'vitamin c serum sensitive skin', volume: '+960/mo', difficulty: 'Low', opportunity: 'High' },
    { kw: 'vitamin c serum dermatologist tested', volume: '+560/mo', difficulty: 'Low', opportunity: 'Very High' },
    { kw: '20 percent vitamin c serum', volume: '+440/mo', difficulty: 'Medium', opportunity: 'Medium' },
  ]
  return (
    <div>
      <p className="text-xs mb-4" style={{ color: '#64748b' }}>
        12 high-volume buyer search terms currently missing from your listing. Adding these could capture an estimated +9,800 additional searches/month.
      </p>
      <div className="space-y-2">
        {keywords.map(k => (
          <div key={k.kw} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#f1f5f9' }}>{k.kw}</p>
            </div>
            <span className="text-xs shrink-0 font-semibold tabular-nums" style={{ color: '#a3e635' }}>{k.volume}</span>
            <span className="text-xs shrink-0 px-2 py-0.5 rounded-full"
              style={{
                color: k.opportunity === 'Very High' ? '#4ade80' : '#fbbf24',
                background: k.opportunity === 'Very High' ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
              }}
            >
              {k.opportunity}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabReviews() {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <h4 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#fbbf24' }}>Top Buyer Objection Detected</h4>
        <p className="text-sm font-medium mb-1" style={{ color: '#f1f5f9' }}>"Results took longer than expected"</p>
        <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>Found in 23% of 1-3 star reviews. Buyers expected results within a few days — the listing sets no clear timeline.</p>
      </div>

      <div className="p-4 rounded-xl" style={{ background: 'rgba(163,230,53,0.05)', border: '1px solid rgba(163,230,53,0.18)' }}>
        <h4 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#a3e635' }}>Recommended Fix</h4>
        <p className="text-sm leading-relaxed" style={{ color: '#f1f5f9' }}>Add "visible results in 14 days" to bullet 2 and "noticeable improvement within 2–4 weeks of daily use" to the description. Set expectations before the objection forms.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Positive Signals', value: '73%', color: '#4ade80' },
          { label: 'Recurring Objections', value: '4', color: '#fbbf24' },
          { label: 'Unmet Needs', value: '2', color: '#f87171' },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xl font-black mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const tabContent: Record<Tab, React.ReactNode> = {
  Overview: <TabOverview />,
  Title: <TabTitle />,
  Bullets: <TabBullets />,
  Keywords: <TabKeywords />,
  Reviews: <TabReviews />,
}

export default function AuditDemoSection() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  return (
    <section id="audit-demo" className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(52,211,153,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-14">
          <div className="section-badge mx-auto w-fit mb-5">Sample Audit</div>
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            See what a real{' '}
            <span className="gradient-text">Sellio audit</span> looks like.
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
            A real sample for a skincare product — the kind of insight your listing could be getting today.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(10,21,14,0.94)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#f87171' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#fbbf24' }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: '#4ade80' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>Audit Report — ProGlow Vitamin C Serum 30ml</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(163,230,53,0.09)', color: '#a3e635', border: '1px solid rgba(163,230,53,0.22)' }}>
                  ● Audit Complete
                </span>
              </div>
            </div>

            <div className="audit-grid">
              <div
                className="p-6 flex flex-col items-center justify-start gap-6"
                style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
              >
                <ScoreGauge score={67} potential={94} />

                <div className="w-full">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: '#475569' }}>Jump to</p>
                  <div className="space-y-1">
                    {TABS.map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between"
                        style={{
                          background: activeTab === tab ? 'rgba(163,230,53,0.09)' : 'transparent',
                          color: activeTab === tab ? '#a3e635' : '#64748b',
                          border: activeTab === tab ? '1px solid rgba(163,230,53,0.22)' : '1px solid transparent',
                          cursor: 'pointer',
                        }}
                      >
                        {tab}
                        {activeTab === tab && <ChevronDown size={12} style={{ transform: 'rotate(-90deg)' }} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 min-h-\[400px\]" style={{ padding: 'clamp(1.5rem, 2vw, 2rem)' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <h3 className="text-lg font-bold mb-5" style={{ color: '#f1f5f9' }}>{activeTab}</h3>
                    {tabContent[activeTab]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="text-center mt-10">
          <Link to="/dashboard/new-audit" className="btn-primary">
            Run Your Free Audit <ArrowRight size={16} />
          </Link>
          <p className="text-xs mt-3" style={{ color: '#475569' }}>No credit card · No Amazon API needed · Results in seconds</p>
        </AnimatedSection>
      </div>
    </section>
  )
}
