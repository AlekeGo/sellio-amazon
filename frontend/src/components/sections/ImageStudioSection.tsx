import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

const imageTypes = [
  {
    label: 'Main Image Refresh',
    desc: 'High-clarity product shot on clean white, optimized for click-through rate.',
    gradient: 'linear-gradient(135deg, #166534, #4ade80)',
    tag: 'Always included',
    tagColor: '#4ade80',
    tagBg: 'rgba(74,222,128,0.1)',
    aspectLabel: '1:1',
    mockColors: ['#0a1f0d', '#166534', '#dcfce7', '#052e16'],
  },
  {
    label: 'Benefit Infographic',
    desc: '2-column layout highlighting your top benefits with icons and short copy.',
    gradient: 'linear-gradient(135deg, #065f46, #34d399)',
    tag: 'Most popular',
    tagColor: '#34d399',
    tagBg: 'rgba(52,211,153,0.1)',
    aspectLabel: '1:1',
    mockColors: ['#0d2018', '#065f46', '#d1fae5', '#022c22'],
  },
  {
    label: 'Comparison Graphic',
    desc: 'Side-by-side positioning vs. competitor to show your advantages clearly.',
    gradient: 'linear-gradient(135deg, #14532d, #22c55e)',
    tag: 'High impact',
    tagColor: '#22c55e',
    tagBg: 'rgba(34,197,94,0.1)',
    aspectLabel: '4:3',
    mockColors: ['#0e1f10', '#14532d', '#dcfce7', '#083317'],
  },
  {
    label: 'How It Works',
    desc: 'Step-by-step visual showing usage process with numbered callouts.',
    gradient: 'linear-gradient(135deg, #3f6212, #a3e635)',
    tag: 'Trust builder',
    tagColor: '#a3e635',
    tagBg: 'rgba(163,230,53,0.1)',
    aspectLabel: '16:9',
    mockColors: ['#111a07', '#3f6212', '#ecfccb', '#1a2e05'],
  },
  {
    label: 'Lifestyle Visual',
    desc: 'Product-in-context imagery with lifestyle appeal and emotional resonance.',
    gradient: 'linear-gradient(135deg, #166534, #86efac)',
    tag: 'Premium feel',
    tagColor: '#86efac',
    tagBg: 'rgba(134,239,172,0.1)',
    aspectLabel: '4:3',
    mockColors: ['#0a1a0e', '#15803d', '#dcfce7', '#052e16'],
  },
  {
    label: 'A+ Banner Concept',
    desc: 'Module-ready header for A+ Content pages with brand story visual.',
    gradient: 'linear-gradient(135deg, #4d7c0f, #d9f99d)',
    tag: 'A+ Content',
    tagColor: '#d9f99d',
    tagBg: 'rgba(217,249,157,0.08)',
    aspectLabel: '16:5',
    mockColors: ['#111a07', '#4d7c0f', '#f7fee7', '#1a2e05'],
  },
]

function MockImagePreview({ colors, aspect }: { colors: string[]; aspect: string }) {
  const isWide = aspect === '16:9' || aspect === '16:5'
  return (
    <div
      className="w-full overflow-hidden rounded-lg mb-4"
      style={{
        aspectRatio: isWide ? '16/6' : '4/3',
        background: colors[0],
        position: 'relative',
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1/2 h-2/3 rounded-lg opacity-70" style={{ background: colors[1] }} />
      </div>
      <div className="absolute inset-0 flex flex-wrap gap-1 opacity-20 p-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-1.5 rounded-full" style={{ background: colors[3], width: `${30 + i * 8}%` }} />
        ))}
      </div>
      <div
        className="absolute bottom-2 right-2 text-xs font-mono px-1.5 py-0.5 rounded"
        style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.55)' }}
      >
        {aspect}
      </div>
    </div>
  )
}

export default function ImageStudioSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(163,230,53,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-14">
          <div className="section-badge mx-auto w-fit mb-5">
            <Sparkles size={12} />
            Image Studio
          </div>
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            Premium visuals.{' '}
            <span className="gradient-text">Generated for your product.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
            Upload your product images. Sellio generates a full Amazon-ready visual pack tailored to your listing and brand.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {imageTypes.map((item, i) => (
            <AnimatedSection key={item.label} delay={0.06 * i}>
              <div className="glass-card glass-card-hover rounded-2xl p-5 h-full">
                <MockImagePreview colors={item.mockColors} aspect={item.aspectLabel} />
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-bold" style={{ color: '#f1f5f9' }}>{item.label}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: item.tagBg, color: item.tagColor, border: `1px solid ${item.tagColor}28` }}
                  >
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="text-center">
          <Link to="/image-studio" className="btn-primary glow-button">
            <Sparkles size={15} />
            Explore Image Studio
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs mt-3" style={{ color: '#475569' }}>Image generation available on paid plans</p>
        </AnimatedSection>
      </div>
    </section>
  )
}
