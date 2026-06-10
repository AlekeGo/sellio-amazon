import { motion } from 'framer-motion'
import { BarChart2, Zap, Image, Star, CheckCircle, ArrowRight, Lock, TrendingUp, AlertTriangle, ShoppingCart, FileText, Package, Play } from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration: 0.52, delay, ease: 'easeOut' as const },
})

const sectionReveal = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.04 },
  transition: { duration: 0.65, ease: 'easeOut' as const },
}

function ScoreBar({ label, value, tier }: { label: string; value: number; tier: 'hi' | 'mid' | 'lo' }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span className="dp-caption">{label}</span>
        <span className="dp-caption dp-tabular" style={{ color: tier === 'hi' ? 'var(--dp-score-hi)' : tier === 'mid' ? 'var(--dp-score-mid)' : 'var(--dp-score-low)', fontWeight: 600 }}>{value}</span>
      </div>
      <div className="dp-score-bar-track">
        <div className={`dp-score-bar-fill dp-score-bar-fill-${tier}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function NavbarPreview() {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>1 — Navbar</span>
      </div>
      <div className="dp-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
        <nav className="dp-nav" style={{ position: 'static', borderBottom: 'none', borderRadius: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--dp-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart2 size={15} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dp-ink)', letterSpacing: '-0.02em' }}>Sellio</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button className="dp-btn-ghost" style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}>Features</button>
            <button className="dp-btn-ghost" style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}>Pricing</button>
            <button className="dp-btn-ghost" style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}>Docs</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <button className="dp-btn-ghost" style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}>Sign in</button>
            <button className="dp-btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1.125rem' }}>Start free</button>
          </div>
        </nav>
      </div>
    </div>
  )
}

function HeroPreview() {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>2 — Landing Hero</span>
      </div>
      <motion.div {...fadeUp(0)} className="dp-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="dp-mesh-hero" style={{ padding: '4rem 2rem 3rem', borderRadius: 16, position: 'relative' }}>
          <div className="dp-orb dp-orb-float" style={{ width: 400, height: 400, background: 'rgba(83,58,253,0.18)', top: -140, left: -100 }} />
          <div className="dp-orb dp-orb-float-slow" style={{ width: 300, height: 300, background: 'rgba(122,102,255,0.16)', top: -80, right: -80 }} />
          <div className="dp-orb dp-orb-float" style={{ width: 260, height: 260, background: 'rgba(167,139,250,0.18)', bottom: -80, left: '35%', animationDelay: '4s' }} />
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <motion.div {...fadeUp(0.05)} style={{ marginBottom: '1.25rem' }}>
              <span className="dp-eyebrow">
                <Zap size={11} />
                AI Amazon Conversion Studio
              </span>
            </motion.div>
            <motion.h1 {...fadeUp(0.1)} className="dp-display-xxl" style={{ marginBottom: '1.25rem' }}>
              Fix what stops buyers.<br />
              <span style={{ color: 'var(--dp-primary)' }}>Improve every listing.</span>
            </motion.h1>
            <motion.p {...fadeUp(0.18)} className="dp-body-lead" style={{ maxWidth: 480, margin: '0 auto 2rem' }}>
              Sellio scores your listing against top sellers, spots every conversion blocker, and gives you an exact fix list — in under 60 seconds.
            </motion.p>
            <motion.div {...fadeUp(0.25)} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button className="dp-btn-primary">
                Audit my listing <ArrowRight size={15} />
              </button>
              <button className="dp-btn-secondary">See a sample report</button>
            </motion.div>
            <motion.div {...fadeUp(0.32)} style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: <Star size={13} />, text: '4.9 rating from sellers' },
                { icon: <CheckCircle size={13} />, text: 'No credit card required' },
                { icon: <BarChart2 size={13} />, text: '3,000+ audits run' },
              ].map(({ icon, text }) => (
                <span key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--dp-ink-muted)' }}>
                  <span style={{ color: 'var(--dp-primary)' }}>{icon}</span>
                  {text}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function AuditScoreCardPreview() {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>3 — Audit Score Card</span>
      </div>
      <div className="dp-preview-grid-2">
        <motion.div {...fadeUp(0)} className="dp-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span className="dp-caption" style={{ display: 'block', marginBottom: '0.25rem' }}>Overall Listing Score</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span className="dp-display-lg dp-tabular" style={{ color: 'var(--dp-primary)', fontWeight: 600 }}>64</span>
                <span className="dp-caption">/100</span>
              </div>
            </div>
            <span className="dp-badge dp-badge-warning">Needs Work</span>
          </div>
          <hr className="dp-divider" style={{ margin: '0 0 1.25rem' }} />
          <ScoreBar label="Title Clarity" value={72} tier="mid" />
          <ScoreBar label="Bullet Points" value={55} tier="lo" />
          <ScoreBar label="Images" value={80} tier="hi" />
          <ScoreBar label="A+ Content" value={40} tier="lo" />
          <ScoreBar label="Review Signals" value={88} tier="hi" />
          <div className="dp-card-soft" style={{ marginTop: '1.25rem' }}>
            <span className="dp-micro-cap" style={{ display: 'block', marginBottom: '0.5rem' }}>Diagnosis</span>
            <p className="dp-body" style={{ margin: 0, fontSize: '0.875rem' }}>
              Bullet points lack specific features. A+ content is missing — this alone can cost 8–15% in conversions on high-intent queries.
            </p>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.08)} className="dp-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <span className="dp-caption" style={{ display: 'block', marginBottom: '0.25rem' }}>Overall Listing Score</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span className="dp-display-lg dp-tabular" style={{ color: 'var(--dp-primary)', fontWeight: 600 }}>91</span>
                <span className="dp-caption">/100</span>
              </div>
            </div>
            <span className="dp-badge dp-badge-success">Strong</span>
          </div>
          <hr className="dp-divider" style={{ margin: '0 0 1.25rem' }} />
          <ScoreBar label="Title Clarity" value={94} tier="hi" />
          <ScoreBar label="Bullet Points" value={88} tier="hi" />
          <ScoreBar label="Images" value={96} tier="hi" />
          <ScoreBar label="A+ Content" value={85} tier="hi" />
          <ScoreBar label="Review Signals" value={92} tier="hi" />
          <div className="dp-card-soft" style={{ marginTop: '1.25rem' }}>
            <span className="dp-micro-cap" style={{ display: 'block', marginBottom: '0.5rem' }}>Diagnosis</span>
            <p className="dp-body" style={{ margin: 0, fontSize: '0.875rem' }}>
              Listing is well-optimised. Minor opportunity: add customer-driven language from recent reviews into bullets.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function FixFirstTablePreview() {
  const rows = [
    { priority: 1, issue: 'Bullet 3 missing material specification', impact: 'High', fix: 'Add fabric weight, thread count or material type in the first 5 words of bullet 3.' },
    { priority: 2, issue: 'Title exceeds 200 characters on mobile', impact: 'High', fix: 'Trim title to ≤ 180 characters. Front-load the primary keyword + brand name.' },
    { priority: 3, issue: 'No A+ content / Enhanced Brand Content', impact: 'Medium', fix: 'Create an A+ module with comparison table + lifestyle image. Estimated +12% CVR.' },
    { priority: 4, issue: 'Main image background is off-white (not pure white)', impact: 'Medium', fix: 'Re-export main image on #FFFFFF background to meet Amazon image requirements.' },
    { priority: 5, issue: 'No backend keywords for common misspellings', impact: 'Low', fix: 'Add "coffe maker", "cofee" and brand misspellings to backend search terms.' },
  ]

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>4 — Fix First Table</span>
      </div>
      <motion.div {...fadeUp(0)} className="dp-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid var(--dp-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="dp-heading">Fix First</span>
            <span className="dp-badge dp-badge-danger">5 issues</span>
          </div>
          <span className="dp-caption">Sorted by conversion impact</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dp-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Issue</th>
                <th style={{ width: 90 }}>Impact</th>
                <th>Suggested Fix</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.priority}>
                  <td>
                    <span className="dp-badge" style={{ background: 'var(--dp-surface-soft)', color: 'var(--dp-ink-muted)', fontWeight: 700, minWidth: 26, justifyContent: 'center' }}>
                      {row.priority}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--dp-ink)' }}>{row.issue}</td>
                  <td>
                    <span className={`dp-badge ${row.impact === 'High' ? 'dp-badge-danger' : row.impact === 'Medium' ? 'dp-badge-warning' : 'dp-badge-primary'}`}>
                      {row.impact}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{row.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

function ImageStudioCardPreview() {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>5 — Image Studio Card</span>
      </div>
      <div className="dp-preview-grid-3">
        {[
          { locked: true, label: 'Main Product Shot', style: 'Studio White', mode: 'product_locked' },
          { locked: true, label: 'Lifestyle Context', style: 'Natural Light', mode: 'product_locked' },
          { locked: false, label: 'Infographic Overlay', style: 'Brand Flat', mode: 'template' },
        ].map((card, i) => (
          <motion.div key={card.label} {...fadeUp(i * 0.08)} className="dp-card" style={{ padding: '1rem' }}>
            <div style={{
              aspectRatio: '1/1',
              borderRadius: 12,
              background: card.locked
                ? 'linear-gradient(135deg, #F4F2FF 0%, #EEEAFF 100%)'
                : 'linear-gradient(135deg, var(--dp-surface-indigo) 0%, rgba(196,188,255,0.25) 100%)',
              border: `1.5px dashed ${card.locked ? 'rgba(196,188,255,0.7)' : 'var(--dp-primary)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '0.875rem',
            }}>
              {card.locked ? (
                <>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--dp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image size={18} color="var(--dp-ink-muted)" />
                  </div>
                  <span className="dp-caption">Image slot {i + 1}</span>
                </>
              ) : (
                <>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--dp-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={18} color="var(--dp-primary)" />
                  </div>
                  <span className="dp-caption" style={{ color: 'var(--dp-primary)' }}>Ready to generate</span>
                </>
              )}
            </div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--dp-ink)' }}>{card.label}</span>
              {card.mode === 'product_locked' && (
                <span className="dp-badge dp-badge-success" style={{ gap: '0.2rem' }}>
                  <Lock size={9} /> Locked
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="dp-badge dp-badge-primary">{card.style}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.div {...fadeUp(0.2)} style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="dp-btn-primary" style={{ gap: '0.5rem' }}>
          <Zap size={15} /> Generate Images — 2 credits
        </button>
      </motion.div>
    </div>
  )
}

function DashboardWidgetsPreview() {
  const stats = [
    { label: 'Credits Remaining', value: '18', sub: 'of 25 monthly', icon: <Zap size={16} />, trend: null },
    { label: 'Audits Run', value: '7', sub: 'this month', icon: <FileText size={16} />, trend: '+3' },
    { label: 'Images Generated', value: '24', sub: 'across 4 audits', icon: <Image size={16} />, trend: '+8' },
    { label: 'Avg. Listing Score', value: '71', sub: '/100 across audits', icon: <BarChart2 size={16} />, trend: '+5' },
  ]

  const recentAudits = [
    { title: 'Stainless Steel Tumbler 20oz', score: 84, status: 'done' },
    { title: 'Bamboo Cutting Board Set', score: 62, status: 'done' },
    { title: 'Yoga Mat Non-Slip', score: 91, status: 'done' },
  ]

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>6 — Dashboard Widgets</span>
      </div>
      <div className="dp-preview-grid-4" style={{ marginBottom: '1.25rem' }}>
        {stats.map((stat, i) => (
          <motion.div key={stat.label} {...fadeUp(i * 0.06)} className="dp-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div className="dp-stat-icon">
                {stat.icon}
              </div>
              {stat.trend && (
                <span className="dp-badge dp-badge-success" style={{ fontSize: '0.7rem' }}>
                  <TrendingUp size={10} /> {stat.trend}
                </span>
              )}
            </div>
            <div className="dp-display-md dp-tabular" style={{ marginBottom: '0.2rem', fontWeight: 600 }}>{stat.value}</div>
            <div className="dp-caption">{stat.label}</div>
            <div className="dp-caption" style={{ marginTop: '0.15rem', color: 'var(--dp-ink-muted)' }}>{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      <motion.div {...fadeUp(0.2)} className="dp-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span className="dp-heading">Recent Audits</span>
          <button className="dp-btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}>View all</button>
        </div>
        {recentAudits.map((audit, i) => (
          <div key={audit.title} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 0',
            borderBottom: i < recentAudits.length - 1 ? '1px solid var(--dp-border)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--dp-surface-soft)', border: '1px solid var(--dp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={15} color="var(--dp-ink-muted)" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dp-ink)' }}>{audit.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="dp-badge dp-badge-primary" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                {audit.score}
              </span>
              <button className="dp-btn-ghost" style={{ fontSize: '0.8rem', padding: '0.3rem 0.625rem' }}>Open</button>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

function NewAuditFormPreview() {
  const steps = [
    { num: 1, label: 'Product URL', active: false, done: true },
    { num: 2, label: 'Product Details', active: true, done: false },
    { num: 3, label: 'Review & Submit', active: false, done: false },
  ]

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>7 — New Audit Form</span>
      </div>
      <motion.div {...fadeUp(0)} className="dp-card" style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '2rem' }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1' : undefined }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className={`dp-step-dot ${step.done ? 'dp-step-dot-done' : step.active ? 'dp-step-dot-active' : 'dp-step-dot-idle'}`}>
                  {step.done ? <CheckCircle size={14} /> : step.num}
                </div>
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: step.active ? 600 : 400,
                  color: step.active ? 'var(--dp-ink)' : 'var(--dp-ink-muted)',
                  whiteSpace: 'nowrap',
                }}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, background: 'var(--dp-border)', margin: '0 0.75rem' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="dp-label">Product Title</label>
          <input className="dp-input" defaultValue="Stainless Steel Insulated Tumbler 20oz" readOnly />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label className="dp-label">Category</label>
            <select className="dp-select">
              <option>Kitchen &amp; Dining</option>
            </select>
          </div>
          <div>
            <label className="dp-label">Seller Type</label>
            <select className="dp-select">
              <option>Private Label</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="dp-label">Target Buyer (optional)</label>
          <input className="dp-input" placeholder="e.g. office workers who commute daily" readOnly />
          <span className="dp-caption" style={{ display: 'block', marginTop: '0.35rem' }}>Helps Sellio personalise improvement suggestions.</span>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label className="dp-label">Main Competitors (optional)</label>
          <input className="dp-input" placeholder="Paste ASINs separated by commas" readOnly />
        </div>

        <hr className="dp-divider" style={{ margin: '1.25rem 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button className="dp-btn-ghost">← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <span className="dp-caption" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Zap size={12} color="var(--dp-primary)" /> Uses 1 credit
            </span>
            <button className="dp-btn-primary">Continue →</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function PricingCardsPreview() {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: 'Free forever',
      description: 'For sellers just getting started.',
      features: [
        '3 audits per month',
        '5 image generations',
        'Basic score report',
        'Fix First list',
      ],
      cta: 'Start free',
      featured: false,
    },
    {
      name: 'Pro',
      price: '29',
      period: 'per month',
      description: 'For sellers serious about conversion.',
      features: [
        '25 audits per month',
        '60 image generations',
        'Full score breakdown',
        'Buyer Objection Radar',
        'Competitor Analysis',
        'Pro Upgrade Pack',
        'Image Studio — product-locked',
      ],
      cta: 'Upgrade to Pro',
      featured: true,
    },
    {
      name: 'Business',
      price: '89',
      period: 'per month',
      description: 'For agencies and multi-brand sellers.',
      features: [
        '100 audits per month',
        '300 image generations',
        'Everything in Pro',
        'Team seats (up to 5)',
        'Priority support',
        'API access',
      ],
      cta: 'Contact us',
      featured: false,
    },
  ]

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>8 — Pricing Cards</span>
      </div>
      <div className="dp-preview-grid-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            {...fadeUp(i * 0.08)}
            className={plan.featured ? 'dp-card-featured dp-popular-ring' : 'dp-card'}
            style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
          >
            {plan.featured && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                <span className="dp-badge dp-badge-pro">Most popular</span>
              </div>
            )}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: plan.featured ? 'rgba(255,255,255,0.9)' : 'var(--dp-ink)',
                display: 'block',
                marginBottom: '0.5rem',
              }}>{plan.name}</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.875rem', color: plan.featured ? 'rgba(255,255,255,0.5)' : 'var(--dp-ink-muted)' }}>$</span>
                <span className="dp-display-md dp-tabular" style={{ color: plan.featured ? '#fff' : 'var(--dp-ink)', fontWeight: 700 }}>{plan.price}</span>
                <span style={{ fontSize: '0.8125rem', color: plan.featured ? 'rgba(255,255,255,0.5)' : 'var(--dp-ink-muted)' }}>/{plan.period}</span>
              </div>
              <span style={{ fontSize: '0.875rem', color: plan.featured ? 'rgba(255,255,255,0.6)' : 'var(--dp-ink-muted)' }}>{plan.description}</span>
            </div>

            <hr style={{ border: 'none', borderTop: `1px solid ${plan.featured ? 'rgba(255,255,255,0.12)' : 'var(--dp-border)'}`, margin: '0 0 1.25rem' }} />

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {plan.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: plan.featured ? 'rgba(255,255,255,0.8)' : 'var(--dp-ink-secondary)' }}>
                  <CheckCircle size={14} color={plan.featured ? '#6EE7B7' : 'var(--dp-score-hi)'} style={{ flexShrink: 0, marginTop: 2 }} />
                  {f}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '1.25rem' }}>
              <button
                className={plan.featured ? 'dp-btn-primary' : 'dp-btn-secondary'}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  ...(plan.featured ? { background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff' } : {}),
                }}
              >
                {plan.cta}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CtaSectionPreview() {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>9 — CTA Section</span>
      </div>
      <motion.div {...fadeUp(0)} style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 20,
        border: '1px solid rgba(196, 188, 255, 0.55)',
        textAlign: 'center',
        padding: '3rem 2rem',
        background: 'linear-gradient(145deg, #E8E4FF 0%, #EEEBFF 20%, #F2EFFF 45%, #F7F5FF 70%, #EEF0FF 100%)',
        boxShadow: '0 4px 24px rgba(83, 58, 253, 0.14), 0 16px 48px rgba(83, 58, 253, 0.09)',
      }}>
        <div className="dp-orb dp-orb-float" style={{ width: 360, height: 360, background: 'rgba(83,58,253,0.20)', top: -110, left: -80 }} />
        <div className="dp-orb dp-orb-float-slow" style={{ width: 280, height: 280, background: 'rgba(122,102,255,0.17)', bottom: -80, right: -50 }} />
        <div className="dp-orb dp-orb-float" style={{ width: 200, height: 200, background: 'rgba(167,139,250,0.18)', top: '40%', right: '15%', animationDelay: '6s' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="dp-eyebrow" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
            <ShoppingCart size={11} /> Start converting more buyers
          </span>
          <h2 className="dp-display-xl" style={{ marginBottom: '1rem', marginTop: '1rem' }}>
            Your next audit is <span style={{ color: 'var(--dp-primary)' }}>one click away.</span>
          </h2>
          <p className="dp-body-lead" style={{ maxWidth: 440, margin: '0 auto 2rem', color: 'var(--dp-ink-secondary)' }}>
            Paste your Amazon listing URL and get a full AI-powered score report in under 60 seconds.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="dp-btn-primary">
              Audit my listing <ArrowRight size={15} />
            </button>
            <button className="dp-btn-secondary">
              See pricing
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function SkeletonPreview() {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>10 — Loading / Skeleton State</span>
      </div>
      <div className="dp-preview-grid-2">
        <div className="dp-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div className="dp-skeleton" style={{ width: 40, height: 40, borderRadius: 10 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="dp-skeleton" style={{ height: 14, width: '70%' }} />
              <div className="dp-skeleton" style={{ height: 12, width: '50%' }} />
            </div>
          </div>
          <div className="dp-skeleton" style={{ height: 10, borderRadius: 4 }} />
          <div className="dp-skeleton" style={{ height: 10, width: '85%', borderRadius: 4 }} />
          <div className="dp-skeleton" style={{ height: 10, width: '60%', borderRadius: 4 }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <div className="dp-skeleton" style={{ height: 34, flex: 1, borderRadius: 9999 }} />
            <div className="dp-skeleton" style={{ height: 34, width: 100, borderRadius: 9999 }} />
          </div>
        </div>

        <div className="dp-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="dp-skeleton" style={{ height: 18, width: '55%', borderRadius: 6 }} />
          {[75, 60, 90, 45].map((_w, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="dp-skeleton" style={{ height: 12, width: '30%', borderRadius: 4, flexShrink: 0 }} />
              <div className="dp-skeleton" style={{ height: 5, flex: 1, borderRadius: 9999 }} />
              <div className="dp-skeleton" style={{ height: 12, width: 28, borderRadius: 4, flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DemoVideoPreview() {
  // To connect your real video: change VIDEO_SRC to '/videos/sellio-demo.mp4'
  const VIDEO_SRC: string | null = null

  const steps = [
    { icon: <BarChart2 size={12} />, label: 'Audit listing quality' },
    { icon: <AlertTriangle size={12} />, label: 'Find buyer objections' },
    { icon: <Image size={12} />, label: 'Generate better visuals' },
    { icon: <FileText size={12} />, label: 'Upgrade product copy' },
  ]

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>★ — Product Demo</span>
      </div>
      <motion.div {...fadeUp(0)} className="dp-card" style={{ padding: '2rem 2rem 1.75rem', overflow: 'hidden', position: 'relative' }}>
        <div className="dp-orb dp-orb-float" style={{ width: 280, height: 280, background: 'rgba(83,58,253,0.10)', top: -120, right: -80 }} />
        <div className="dp-orb dp-orb-float-slow" style={{ width: 200, height: 200, background: 'rgba(167,139,250,0.12)', bottom: -80, left: -50 }} />

        <div style={{ textAlign: 'center', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
          <motion.div {...fadeUp(0.04)} style={{ marginBottom: '1rem' }}>
            <span className="dp-eyebrow"><Play size={10} /> Product Walkthrough</span>
          </motion.div>
          <motion.h2 {...fadeUp(0.09)} className="dp-display-lg" style={{ marginBottom: '0.625rem', marginTop: '0.875rem' }}>
            See how Sellio improves an Amazon listing
          </motion.h2>
          <motion.p {...fadeUp(0.14)} className="dp-body-lead" style={{ maxWidth: 500, margin: '0 auto' }}>
            A short walkthrough — audit, fix list, competitor insights, and product image generation.
          </motion.p>
        </div>

        <motion.div {...fadeUp(0.19)} style={{ maxWidth: 760, margin: '0 auto 1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            borderRadius: 14,
            overflow: 'hidden',
            border: '1.5px solid rgba(196,188,255,0.60)',
            boxShadow: '0 8px 40px rgba(83,58,253,0.22), 0 20px 60px rgba(13,37,61,0.10)',
            aspectRatio: '16/9',
            position: 'relative',
          }}>
            {VIDEO_SRC ? (
              <video
                src={VIDEO_SRC}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#1E1248' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(145deg, #1A1048 0%, #271769 28%, #3220A0 58%, #4330D0 85%, #5040E0 100%)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
                <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(122,102,255,0.22)', filter: 'blur(70px)', top: -50, left: -30, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(196,188,255,0.14)', filter: 'blur(55px)', bottom: -30, right: -20, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.30)' }} />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sellio — Amazon Listing Audit</span>
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.875rem' }}>
                  <div className="dp-video-play-btn" style={{
                    width: 68, height: 68, borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(255,255,255,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}>
                    <Play size={24} color="rgba(255,255,255,0.88)" style={{ marginLeft: 3 }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '0.25rem' }}>Sellio Demo</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.40)' }}>Video coming soon · ~2:30</div>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(to top, rgba(10,8,40,0.55) 0%, transparent 100%)' }}>
                  <div style={{ flex: 1, height: 2, borderRadius: 9999, background: 'rgba(255,255,255,0.12)' }} />
                  <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.40)' }}>0:00 / 2:30</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.24)} style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {steps.map(({ icon, label }) => (
            <span key={label} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.875rem', borderRadius: 9999,
              background: 'var(--dp-primary-subtle)',
              border: '1px solid rgba(196,188,255,0.55)',
              fontSize: '0.8rem', fontWeight: 500, color: 'var(--dp-primary)',
            }}>
              {icon} {label}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}

function ComponentGlossaryPreview() {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <div style={{ marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
        <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>Bonus — Badge & Button Glossary</span>
      </div>
      <div className="dp-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <span className="dp-micro-cap" style={{ display: 'block', marginBottom: '0.75rem' }}>Buttons</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <button className="dp-btn-primary">Primary CTA</button>
            <button className="dp-btn-secondary">Secondary</button>
            <button className="dp-btn-ghost">Ghost</button>
            <button className="dp-btn-primary" disabled style={{ opacity: 0.45 }}>Disabled</button>
          </div>
        </div>
        <hr className="dp-divider" style={{ margin: 0 }} />
        <div>
          <span className="dp-micro-cap" style={{ display: 'block', marginBottom: '0.75rem' }}>Badges</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span className="dp-badge dp-badge-primary">Primary</span>
            <span className="dp-badge dp-badge-success">Success</span>
            <span className="dp-badge dp-badge-warning">Warning</span>
            <span className="dp-badge dp-badge-danger">Danger</span>
            <span className="dp-badge dp-badge-pro">Pro</span>
            <span className="dp-badge dp-badge-amber">Amber</span>
            <span className="dp-badge dp-badge-locked"><Lock size={9} /> Locked</span>
            <span className="dp-eyebrow">Section Eyebrow</span>
          </div>
        </div>
        <hr className="dp-divider" style={{ margin: 0 }} />
        <div>
          <span className="dp-micro-cap" style={{ display: 'block', marginBottom: '0.75rem' }}>Typography</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span className="dp-display-xxl" style={{ lineHeight: 1.1 }}>Display XXL — Fix what stops buyers</span>
            <span className="dp-display-xl">Display XL — Improve every listing</span>
            <span className="dp-display-lg">Display LG — Audit Score Report</span>
            <span className="dp-display-md">Display MD — Fix First</span>
            <span className="dp-heading">Heading — Buyer Objection Radar</span>
            <span className="dp-body-lead">Body Lead — Your listing has 5 conversion issues. Here is what to fix first.</span>
            <span className="dp-body">Body — Sellio analysed 120 similar listings and found that the top 10% share a clear title structure and at least 4 enriched bullet points.</span>
            <span className="dp-caption">Caption — Last analysed 2 hours ago</span>
            <span className="dp-micro-cap">Micro Cap — Section Label</span>
          </div>
        </div>
        <hr className="dp-divider" style={{ margin: 0 }} />
        <div>
          <span className="dp-micro-cap" style={{ display: 'block', marginBottom: '0.75rem' }}>Color Palette</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {[
              { label: 'Primary', bg: '#533AFD', light: false },
              { label: 'Primary Deep', bg: '#4327E0', light: false },
              { label: 'Primary Soft', bg: '#7A66FF', light: false },
              { label: 'Primary Subtle', bg: '#EEF0FF', light: true },
              { label: 'Deep Ink', bg: '#0D253D', light: false },
              { label: 'Ink Secondary', bg: '#2D4A6B', light: false },
              { label: 'Ink Muted', bg: '#7A8FA6', light: false },
              { label: 'Surface', bg: '#FFFFFF', light: true },
              { label: 'Soft Background', bg: '#F6F9FC', light: true },
              { label: 'Indigo Surface', bg: '#EEF0FF', light: true },
              { label: 'Score Hi', bg: '#16A34A', light: false },
              { label: 'Score Mid', bg: '#F59E0B', light: false },
              { label: 'Score Low', bg: '#DC2626', light: false },
            ].map(({ label, bg, light }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10, background: bg,
                  border: light ? '1px solid var(--dp-border)' : 'none',
                }} />
                <span style={{ fontSize: '0.625rem', color: 'var(--dp-ink-muted)', textAlign: 'center', maxWidth: 64 }}>{label}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--dp-ink-muted)', fontFamily: 'monospace' }}>{bg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DesignPreviewPage() {
  return (
    <div className="dp-page" style={{ minHeight: '100vh' }}>
      <NavbarPreview />

      <div style={{ background: 'linear-gradient(90deg, rgba(238,234,255,0.9) 0%, rgba(246,249,252,0.95) 100%)', borderBottom: '1px solid rgba(196,188,255,0.45)', padding: '0.875rem 1.5rem' }}>
        <div className="dp-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
            <span className="dp-badge dp-badge-warning">
              <AlertTriangle size={11} /> Design Preview Only
            </span>
            <span className="dp-body" style={{ fontSize: '0.875rem' }}>
              This page is isolated — no auth required, no backend calls. Shows the proposed Sellio new visual direction.
            </span>
            <a href="/" className="dp-btn-ghost" style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem', marginLeft: 'auto', color: 'var(--dp-primary)' }}>
              ← Back to app
            </a>
          </div>
        </div>
      </div>

      <div style={{ padding: '2.5rem 0 4rem' }}>
        <div className="dp-container">
          {/* Page title band */}
          <div style={{
            marginBottom: '2.5rem',
            padding: '2rem 2.25rem',
            borderRadius: 20,
            background: 'linear-gradient(145deg, #E4DFFF 0%, #EAE6FF 20%, #EEEAFF 45%, #F4F2FF 70%, #F7F5FF 100%)',
            border: '1px solid rgba(196, 188, 255, 0.55)',
            boxShadow: '0 4px 20px rgba(83,58,253,0.12), 0 12px 40px rgba(83,58,253,0.07)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div className="dp-orb dp-orb-float" style={{ width: 280, height: 280, background: 'rgba(83,58,253,0.14)', top: -120, right: -60, opacity: 0.6 }} />
            <div className="dp-orb dp-orb-float-slow" style={{ width: 180, height: 180, background: 'rgba(167,139,250,0.20)', bottom: -80, left: '10%', opacity: 0.55 }} />
            <motion.div {...fadeUp(0)} style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--dp-primary)' }} />
                <span className="dp-micro-cap" style={{ color: 'var(--dp-primary)' }}>Design Preview — Day 13.5</span>
              </div>
              <h1 className="dp-display-xl" style={{ marginBottom: '0.625rem' }}>Sellio Design Preview</h1>
              <p className="dp-body-lead" style={{ maxWidth: 560, marginBottom: '1rem' }}>
                Calm Premium Commerce SaaS direction. Isolated component previews — new color tokens, typography, and component system.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="dp-badge dp-badge-primary">Inter font</span>
                <span className="dp-badge dp-badge-primary">Framer Motion</span>
                <span className="dp-badge dp-badge-primary">dp- CSS prefix</span>
                <span className="dp-badge dp-badge-primary">#533AFD Indigo</span>
              </div>
            </motion.div>
          </div>

          {/* Section 1–2: Navbar + Hero */}
          <motion.div {...sectionReveal} className="dp-band-white">
            <NavbarPreview />
            <HeroPreview />
          </motion.div>

          {/* Section 3–4: Score + Fix First — indigo band */}
          <motion.div {...sectionReveal} className="dp-band-indigo">
            <AuditScoreCardPreview />
            <FixFirstTablePreview />
          </motion.div>

          {/* Section 5–6: Image Studio + Dashboard */}
          <motion.div {...sectionReveal} className="dp-band-lavender">
            <ImageStudioCardPreview />
            <DashboardWidgetsPreview />
          </motion.div>

          {/* Demo video — middle of page */}
          <motion.div {...sectionReveal} className="dp-band-white">
            <DemoVideoPreview />
          </motion.div>

          {/* Section 7: New Audit Form — indigo band */}
          <motion.div {...sectionReveal} className="dp-band-indigo">
            <NewAuditFormPreview />
          </motion.div>

          {/* Section 8–10: Pricing + CTA + Skeleton */}
          <motion.div {...sectionReveal} className="dp-band-white">
            <PricingCardsPreview />
            <CtaSectionPreview />
            <SkeletonPreview />
          </motion.div>

          {/* Glossary */}
          <motion.div {...sectionReveal} className="dp-band-lavender">
            <ComponentGlossaryPreview />
          </motion.div>
        </div>
      </div>

      <footer style={{ background: 'linear-gradient(135deg, #EDEAFF 0%, #F3F1FF 40%, #F6F9FC 100%)', borderTop: '1px solid rgba(196,188,255,0.45)', padding: '2rem 1.5rem' }}>
        <div className="dp-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--dp-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart2 size={11} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--dp-ink)', letterSpacing: '-0.02em' }}>Sellio</span>
            </div>
            <span className="dp-caption">Design Preview — Day 13.5 — Not production UI</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
