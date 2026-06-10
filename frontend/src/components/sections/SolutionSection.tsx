import { Zap, FileText, Key, MessageSquare, Layout, ImageIcon } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const features = [
  {
    icon: Zap,
    title: 'Listing Audit',
    body: 'Full scan of your title, bullets, description, images, and keyword strategy with actionable scores.',
    gradient: 'linear-gradient(135deg, #166534, #4ade80)',
    glow: 'rgba(74,222,128,0.22)',
  },
  {
    icon: FileText,
    title: 'Title & Copy Upgrade',
    body: 'Rewrites using high-converting language, proven Amazon patterns, and keyword integration.',
    gradient: 'linear-gradient(135deg, #065f46, #34d399)',
    glow: 'rgba(52,211,153,0.22)',
  },
  {
    icon: Key,
    title: 'Keyword Intelligence',
    body: 'Discover missed search terms and high-opportunity keywords your competitors are already ranking for.',
    gradient: 'linear-gradient(135deg, #14532d, #22c55e)',
    glow: 'rgba(34,197,94,0.2)',
  },
  {
    icon: MessageSquare,
    title: 'Review Signal Extraction',
    body: 'Turn buyer feedback into conversion insights. Resolve hidden objections before they cost you sales.',
    gradient: 'linear-gradient(135deg, #3f6212, #a3e635)',
    glow: 'rgba(83,58,253,0.22)',
  },
  {
    icon: Layout,
    title: 'A+ Content Strategy',
    body: 'Guidance on module layout, copy angles, and visual storytelling for Amazon A+ Content pages.',
    gradient: 'linear-gradient(135deg, #065f46, #6ee7b7)',
    glow: 'rgba(110,231,183,0.18)',
  },
  {
    icon: ImageIcon,
    title: 'Premium Image Studio',
    body: 'Generate main images, infographics, comparison charts, and lifestyle visuals for your product.',
    gradient: 'linear-gradient(135deg, #166534, #86efac)',
    glow: 'rgba(134,239,172,0.18)',
  },
]

export default function SolutionSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 70% 50% at 20% 50%, rgba(52,211,153,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-16">
          <div className="section-badge mx-auto w-fit mb-5">The Solution</div>
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            One AI platform.{' '}
            <span className="gradient-text">Every part of your listing.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>
            Sellio audits, upgrades, and helps you generate visuals for every element that drives Amazon sales.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <AnimatedSection key={feature.title} delay={0.07 * i}>
                <div className="glass-card glass-card-hover rounded-2xl p-6 h-full group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: feature.gradient,
                      boxShadow: `0 8px 24px ${feature.glow}`,
                    }}
                  >
                    <Icon size={20} color="white" />
                  </div>
                  <h3 className="text-base font-bold mb-2.5" style={{ color: 'var(--dp-ink)', letterSpacing: '-0.01em' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>
                    {feature.body}
                  </p>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
