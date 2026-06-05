import { Zap, FileText, Key, MessageSquare, Layout, ImageIcon } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const features = [
  {
    icon: Zap,
    title: 'Listing Audit',
    body: 'Full AI scan of your title, bullets, description, images, and keyword strategy with actionable scores.',
    gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    glow: 'rgba(14,165,233,0.2)',
  },
  {
    icon: FileText,
    title: 'Title & Copy Upgrade',
    body: 'AI-powered rewrites using high-converting language, proven Amazon patterns, and keyword integration.',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    glow: 'rgba(124,58,237,0.2)',
  },
  {
    icon: Key,
    title: 'Keyword Intelligence',
    body: 'Discover missed search terms and high-opportunity keywords your competitors are already ranking for.',
    gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)',
    glow: 'rgba(8,145,178,0.2)',
  },
  {
    icon: MessageSquare,
    title: 'Review Signal Extraction',
    body: 'Turn buyer feedback into conversion insights. Resolve hidden objections before they cost you sales.',
    gradient: 'linear-gradient(135deg, #059669, #34d399)',
    glow: 'rgba(5,150,105,0.2)',
  },
  {
    icon: Layout,
    title: 'A+ Content Strategy',
    body: 'AI guidance on module layout, copy angles, and visual storytelling for Amazon A+ Content pages.',
    gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
    glow: 'rgba(217,119,6,0.2)',
  },
  {
    icon: ImageIcon,
    title: 'Premium Image Studio',
    body: 'Generate main images, infographics, comparison charts, lifestyle visuals, and more — AI-powered.',
    gradient: 'linear-gradient(135deg, #be185d, #f472b6)',
    glow: 'rgba(190,24,93,0.2)',
  },
]

export default function SolutionSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 70% 50% at 20% 50%, rgba(14,165,233,0.06) 0%, transparent 60%)',
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
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
            Sellio is an AI Amazon Conversion Studio that audits, improves, and helps you generate visuals for every element that drives sales.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <AnimatedSection key={feature.title} delay={0.07 * i}>
                <div
                  className="glass-card glass-card-hover rounded-2xl p-6 h-full group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: feature.gradient,
                      boxShadow: `0 8px 24px ${feature.glow}`,
                    }}
                  >
                    <Icon size={20} color="white" />
                  </div>
                  <h3 className="text-base font-bold mb-2.5" style={{ color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
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
