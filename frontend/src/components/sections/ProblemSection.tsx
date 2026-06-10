import { Eye, Image, Type, Search } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const problems = [
  {
    icon: Type,
    title: 'Weak title = invisible listing',
    body: 'Buyers scan, not read. If your title misses key triggers and search terms, you lose the click before it ever begins.',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.08)',
    border: 'rgba(248,113,113,0.15)',
  },
  {
    icon: Image,
    title: 'Poor visuals = lost trust',
    body: 'Your main image is the single highest-impact element on any listing. A mediocre image costs you sales you will never see.',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.08)',
    border: 'rgba(251,146,60,0.15)',
  },
  {
    icon: Eye,
    title: 'Generic copy = easy to skip',
    body: 'Bullet points that describe features instead of solving problems fail to convert intent into purchases.',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    border: 'rgba(251,191,36,0.15)',
  },
  {
    icon: Search,
    title: 'Missed keywords = zero discovery',
    body: "If Amazon's algorithm can't clearly understand what you sell, it won't show your listing to the right buyers.",
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.15)',
  },
]

const stats = [
  { value: '70%', label: 'of buyers never look past the first page of results', color: 'var(--dp-primary)' },
  { value: '47%', label: 'of clicks go to the top 3 results — position and presentation are everything', color: '#34d399' },
  { value: '3 sec', label: 'is all it takes for a buyer to decide your listing is not worth their time', color: '#4ade80' },
]

export default function ProblemSection() {
  return (
    <section id="features" className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(52,211,153,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-16">
          <div className="section-badge mx-auto w-fit mb-5">The Problem</div>
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            Invisible listings cost you{' '}
            <span className="gradient-text">real sales.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>
            Your product might be excellent. But if your listing doesn't earn attention, trust, and clicks — buyers never find out.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div
                className="text-5xl font-black mb-3 leading-none"
                style={{
                  background: `linear-gradient(135deg, ${stat.color}, rgba(255,255,255,0.8))`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.value}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {problems.map((problem, i) => {
            const Icon = problem.icon
            return (
              <AnimatedSection key={problem.title} delay={0.05 * i}>
                <div
                  className="glass-card glass-card-hover rounded-2xl p-6 h-full"
                  style={{ border: `1px solid ${problem.border}` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: problem.bg, border: `1px solid ${problem.border}` }}
                  >
                    <Icon size={18} style={{ color: problem.color }} />
                  </div>
                  <h3 className="text-sm font-bold mb-2.5 leading-snug" style={{ color: 'var(--dp-ink)' }}>
                    {problem.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>
                    {problem.body}
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
