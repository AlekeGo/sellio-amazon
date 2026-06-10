import { Type, List, AlignLeft, Key, Star, Layout, ImageIcon, BarChart2, Camera } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const analyses = [
  {
    icon: Type,
    title: 'Title',
    body: 'Keyword density, character count, hook effectiveness, and mobile preview scoring.',
    color: 'var(--dp-primary)',
  },
  {
    icon: List,
    title: 'Bullet Points',
    body: 'Benefit clarity, pain point alignment, and feature-vs-benefit ratio analysis.',
    color: '#34d399',
  },
  {
    icon: AlignLeft,
    title: 'Description',
    body: 'Storytelling structure, SEO integration, and brand voice consistency.',
    color: '#4ade80',
  },
  {
    icon: Key,
    title: 'Keywords',
    body: 'Search volume scoring, relevance analysis, and gap discovery vs. competitors.',
    color: '#86efac',
  },
  {
    icon: Star,
    title: 'Reviews & Objections',
    body: 'Buyer sentiment analysis, recurring objections, and unmet need identification.',
    color: '#6ee7b7',
  },
  {
    icon: Layout,
    title: 'A+ Content Strategy',
    body: 'Module recommendations, visual hierarchy mapping, and copy framework guidance.',
    color: '#a7f3d0',
  },
  {
    icon: ImageIcon,
    title: 'Main Image',
    body: 'Visual impact score, white space usage, and first-impression click-through analysis.',
    color: '#22c55e',
  },
  {
    icon: BarChart2,
    title: 'Infographic Slides',
    body: 'Information density, readability scoring, and benefit communication clarity.',
    color: 'var(--dp-primary)',
  },
  {
    icon: Camera,
    title: 'Lifestyle Visuals',
    body: 'Emotional resonance, audience alignment, and brand consistency assessment.',
    color: '#34d399',
  },
]

export default function AnalysisSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(52,211,153,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-16">
          <div className="section-badge mx-auto w-fit mb-5">Deep Analysis</div>
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            Sellio looks at{' '}
            <span className="gradient-text">everything.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>
            From your title to your thumbnail, separate AI models examine each element with Amazon conversion data as the benchmark.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.map((item, i) => {
            const Icon = item.icon
            return (
              <AnimatedSection key={item.title} delay={0.05 * i}>
                <div className="glass-card glass-card-hover rounded-2xl p-5 flex gap-4 items-start h-full">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: `${item.color}18`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1.5" style={{ color: 'var(--dp-ink)' }}>{item.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>{item.body}</p>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
