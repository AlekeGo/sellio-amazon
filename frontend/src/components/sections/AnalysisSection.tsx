import { Type, List, AlignLeft, Key, Star, Layout, ImageIcon, BarChart2, Camera } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const analyses = [
  {
    icon: Type,
    title: 'Title',
    body: 'Keyword density, character count, hook effectiveness, and mobile preview scoring.',
    iconBg: 'linear-gradient(135deg, rgba(83,58,253,0.15) 0%, rgba(122,102,255,0.08) 100%)',
    iconColor: '#533AFD',
  },
  {
    icon: List,
    title: 'Bullet Points',
    body: 'Benefit clarity, pain point alignment, and feature-vs-benefit ratio analysis.',
    iconBg: 'linear-gradient(135deg, rgba(124,58,237,0.14) 0%, rgba(106,85,254,0.08) 100%)',
    iconColor: '#7C3AED',
  },
  {
    icon: AlignLeft,
    title: 'Description',
    body: 'Storytelling structure, SEO integration, and brand voice consistency.',
    iconBg: 'linear-gradient(135deg, rgba(83,58,253,0.14) 0%, rgba(122,102,255,0.07) 100%)',
    iconColor: '#533AFD',
  },
  {
    icon: Key,
    title: 'Keywords',
    body: 'Search volume scoring, relevance analysis, and gap discovery vs. competitors.',
    iconBg: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(83,58,253,0.08) 100%)',
    iconColor: '#7C3AED',
  },
  {
    icon: Star,
    title: 'Reviews & Objections',
    body: 'Buyer sentiment analysis, recurring objections, and unmet need identification.',
    iconBg: 'linear-gradient(135deg, rgba(106,85,254,0.15) 0%, rgba(155,143,255,0.08) 100%)',
    iconColor: '#6A55FE',
  },
  {
    icon: Layout,
    title: 'A+ Content Strategy',
    body: 'Module recommendations, visual hierarchy mapping, and copy framework guidance.',
    iconBg: 'linear-gradient(135deg, rgba(83,58,253,0.14) 0%, rgba(106,85,254,0.08) 100%)',
    iconColor: '#533AFD',
  },
  {
    icon: ImageIcon,
    title: 'Main Image',
    body: 'Visual impact score, white space usage, and first-impression click-through analysis.',
    iconBg: 'linear-gradient(135deg, rgba(124,58,237,0.14) 0%, rgba(155,143,255,0.08) 100%)',
    iconColor: '#7C3AED',
  },
  {
    icon: BarChart2,
    title: 'Infographic Slides',
    body: 'Information density, readability scoring, and benefit communication clarity.',
    iconBg: 'linear-gradient(135deg, rgba(83,58,253,0.15) 0%, rgba(122,102,255,0.08) 100%)',
    iconColor: '#533AFD',
  },
  {
    icon: Camera,
    title: 'Lifestyle Visuals',
    body: 'Emotional resonance, audience alignment, and brand consistency assessment.',
    iconBg: 'linear-gradient(135deg, rgba(106,85,254,0.15) 0%, rgba(124,58,237,0.08) 100%)',
    iconColor: '#6A55FE',
  },
]

export default function AnalysisSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 65% 55% at 80% 50%, rgba(83,58,253,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-16">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {analyses.map((item, i) => {
            const Icon = item.icon
            return (
              <AnimatedSection key={item.title} delay={0.05 * i}>
                <div className="analysis-card">
                  <div style={{
                    width: '52px', height: '52px',
                    borderRadius: '14px',
                    background: item.iconBg,
                    border: '1px solid rgba(196,188,255,0.65)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.25rem',
                    flexShrink: 0,
                  }}>
                    <Icon size={22} style={{ color: item.iconColor }} />
                  </div>
                  <h3 style={{
                    fontSize: '1rem', fontWeight: 700,
                    color: '#0F172A', marginBottom: '0.5rem',
                    letterSpacing: '-0.012em',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem', lineHeight: '1.65',
                    color: '#475569', margin: 0,
                  }}>
                    {item.body}
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
