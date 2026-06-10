import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

/* ─── per-card mini layout previews ─── */

function PreviewMainImage() {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 10, height: 100, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: 56, height: 56, borderRadius: 10, background: 'white', boxShadow: '0 6px 20px rgba(83,58,253,0.13), 0 1px 4px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EEF0FF' }}>
        <div style={{ width: 30, height: 36, background: 'linear-gradient(150deg, #C4BEFF 0%, #9B90FF 100%)', borderRadius: 5 }} />
      </div>
      <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: '0.6rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>Clean white BG</div>
      <AspectBadge label="1:1" />
    </div>
  )
}

function PreviewBenefitInfographic() {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 10, height: 100, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: 40, height: 44, borderRadius: 7, background: 'linear-gradient(150deg, #C4BEFF 0%, #9B90FF 100%)', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {[['✓', '68%', 'Softer hold'], ['✓', 'Natural', 'Ingredients'], ['✓', '4.8★', 'Reviews']].map(([icon, val, _lbl], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 13, height: 13, borderRadius: 3, background: '#EEF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: '#533AFD', fontWeight: 700, flexShrink: 0 }}>{icon}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#533AFD', width: 28, flexShrink: 0 }}>{val}</div>
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#E2E8F0' }}>
              <div style={{ width: `${[70, 55, 85][i]}%`, height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #C4BEFF, #9B90FF)' }} />
            </div>
          </div>
        ))}
      </div>
      <AspectBadge label="1:1" />
    </div>
  )
}

function PreviewComparisonGraphic() {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 10, height: 100, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'stretch', overflow: 'hidden', position: 'relative' }}>
      <div style={{ flex: 1, background: '#EEF0FF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 6px' }}>
        <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#533AFD', letterSpacing: '0.05em' }}>YOURS</div>
        {['✓ Ergonomic', '✓ BPA-free', '✓ 500ml'].map((t, i) => (
          <div key={i} style={{ fontSize: '0.52rem', color: '#533AFD', fontWeight: 600 }}>{t}</div>
        ))}
      </div>
      <div style={{ width: 1, background: '#C7C2FF', flexShrink: 0 }} />
      <div style={{ flex: 1, background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 6px' }}>
        <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.05em' }}>THEIRS</div>
        {['✗ Bulky grip', '✗ Plastic lid', '✗ 350ml'].map((t, i) => (
          <div key={i} style={{ fontSize: '0.52rem', color: '#94A3B8', fontWeight: 600 }}>{t}</div>
        ))}
      </div>
      <AspectBadge label="4:3" />
    </div>
  )
}

function PreviewHowItWorks() {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 10, height: 100, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '0 14px', position: 'relative', overflow: 'hidden' }}>
      {[['1', 'Apply'], ['2', 'Wait'], ['3', 'Done']].map(([n, lbl], i) => (
        <>
          <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg, #533AFD, #7C6FFF)' : '#EEF0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: i === 0 ? 'white' : '#533AFD', boxShadow: i === 0 ? '0 3px 10px rgba(83,58,253,0.3)' : 'none' }}>{n}</div>
            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: '#64748B' }}>{lbl}</div>
          </div>
          {i < 2 && <div key={`line-${i}`} style={{ flex: 1, height: 1, background: '#C7C2FF', margin: '0 4px', marginBottom: 14 }} />}
        </>
      ))}
      <AspectBadge label="16:9" />
    </div>
  )
}

function PreviewLifestyleVisual() {
  return (
    <div style={{ background: 'linear-gradient(140deg, #F1F0FF 0%, #E8F4FD 100%)', borderRadius: 10, height: 100, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -18, right: -18, width: 70, height: 70, borderRadius: '50%', background: 'rgba(196,190,255,0.25)' }} />
      <div style={{ position: 'absolute', bottom: -10, left: -10, width: 50, height: 50, borderRadius: '50%', background: 'rgba(155,144,255,0.18)' }} />
      <div style={{ width: 48, height: 52, borderRadius: 10, background: 'white', boxShadow: '0 8px 24px rgba(83,58,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EEF0FF', position: 'relative' }}>
        <div style={{ width: 26, height: 32, background: 'linear-gradient(150deg, #C4BEFF 0%, #9B90FF 100%)', borderRadius: 4 }} />
      </div>
      <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: '0.55rem', color: '#7C6FFF', fontWeight: 600, fontStyle: 'italic' }}>In-scene product</div>
      <AspectBadge label="4:3" />
    </div>
  )
}

function PreviewAplusBanner() {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 10, height: 100, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ flex: 1, padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 7, borderRadius: 4, width: '75%', background: 'linear-gradient(90deg, #9B90FF, #C4BEFF)' }} />
        <div style={{ height: 5, borderRadius: 3, width: '55%', background: '#E2E8F0' }} />
        <div style={{ height: 5, borderRadius: 3, width: '45%', background: '#E2E8F0' }} />
        <div style={{ marginTop: 3, height: 18, width: 48, borderRadius: 5, background: 'linear-gradient(135deg, #533AFD, #7C6FFF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.48rem', color: 'white', fontWeight: 700 }}>Shop now →</div>
        </div>
      </div>
      <div style={{ width: 64, height: '100%', background: 'linear-gradient(160deg, #EEF0FF 0%, #DDD8FF 100%)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 36, background: 'linear-gradient(150deg, #C4BEFF 0%, #9B90FF 100%)', borderRadius: 5, boxShadow: '0 4px 12px rgba(83,58,253,0.2)' }} />
      </div>
      <AspectBadge label="16:5" />
    </div>
  )
}

function AspectBadge({ label }: { label: string }) {
  return (
    <div style={{ position: 'absolute', bottom: 7, right: 8, background: 'rgba(83,58,253,0.08)', color: '#533AFD', fontSize: '0.57rem', fontWeight: 700, padding: '2px 6px', borderRadius: 99, border: '1px solid rgba(83,58,253,0.15)', letterSpacing: '0.03em' }}>
      {label}
    </div>
  )
}

/* ─── card data ─── */

const imageTypes = [
  {
    label: 'Main Image Refresh',
    desc: 'High-clarity product shot on clean white, optimized for click-through rate.',
    tag: 'Always included',
    Preview: PreviewMainImage,
  },
  {
    label: 'Benefit Infographic',
    desc: 'Key benefit callouts with icons and short copy, built around your product claims.',
    tag: 'Most popular',
    Preview: PreviewBenefitInfographic,
  },
  {
    label: 'Comparison Graphic',
    desc: 'Side-by-side positioning vs. a competitor to make your advantages obvious.',
    tag: 'High impact',
    Preview: PreviewComparisonGraphic,
  },
  {
    label: 'How It Works',
    desc: 'Step-by-step visual showing the usage process with numbered callouts.',
    tag: 'Trust builder',
    Preview: PreviewHowItWorks,
  },
  {
    label: 'Lifestyle Visual',
    desc: 'Product-in-context imagery with lifestyle appeal and emotional resonance.',
    tag: 'Premium feel',
    Preview: PreviewLifestyleVisual,
  },
  {
    label: 'A+ Banner Concept',
    desc: 'Module-ready header for A+ Content pages with brand story visuals.',
    tag: 'A+ Content',
    Preview: PreviewAplusBanner,
  },
]

export default function ImageStudioSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(83,58,253,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-14">
          <h2
            className="font-black tracking-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em' }}
          >
            Amazon-ready{' '}
            <span className="gradient-text">image pack.</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--dp-ink-muted)' }}>
            Generate the visuals your listing needs — from main image refresh to comparison graphics and A+ banners.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {imageTypes.map((item, i) => (
            <AnimatedSection key={item.label} delay={0.06 * i}>
              <div
                className="rounded-2xl p-4 h-full flex flex-col"
                style={{
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.04), 0 4px 16px rgba(83,58,253,0.04)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(83,58,253,0.12), 0 1px 4px rgba(15,23,42,0.06)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04), 0 4px 16px rgba(83,58,253,0.04)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                }}
              >
                <item.Preview />
                <div className="flex items-start justify-between gap-2 mt-3 mb-1.5">
                  <h3 className="text-sm font-bold" style={{ color: '#0F172A' }}>{item.label}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium"
                    style={{ background: '#EEF0FF', color: '#533AFD', border: '1px solid rgba(83,58,253,0.15)' }}
                  >
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="text-center">
          <Link to="/image-studio" className="dp-btn-primary">
            <Sparkles size={15} />
            Explore Image Studio
            <ArrowRight size={16} />
          </Link>
          <p className="text-xs mt-3" style={{ color: 'var(--dp-ink-muted)' }}>Image generation available on paid plans</p>
        </AnimatedSection>
      </div>
    </section>
  )
}
