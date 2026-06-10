import { Play, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnimatedSection from '../ui/AnimatedSection'

const bullets = [
  'Audit listing quality',
  'Find buyer objections',
  'Improve product copy',
  'Generate better visuals',
]

export default function DemoVideoSection() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(83,58,253,0.05) 0%, transparent 65%)',
        }}
      />
      <div className="container-xl relative z-10">
        <AnimatedSection className="text-center mb-10">
          <div className="section-badge mx-auto w-fit mb-5">Demo</div>
          <h2
            className="font-black tracking-tight mb-4"
            style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', letterSpacing: '-0.03em' }}
          >
            See Sellio{' '}
            <span className="gradient-text">in action</span>
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--dp-ink-secondary)' }}
          >
            Watch how Sellio turns an Amazon listing into a clear audit, upgrade plan, and
            premium image pack.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.08}>
          <div
            className="rounded-3xl overflow-hidden mx-auto"
            style={{ maxWidth: 820, position: 'relative' }}
          >
            {/* Video card with gradient border effect */}
            <div
              style={{
                padding: 2,
                borderRadius: '1.5rem',
                background: 'linear-gradient(135deg, rgba(83,58,253,0.5) 0%, rgba(122,102,255,0.35) 50%, rgba(196,188,255,0.3) 100%)',
                boxShadow: '0 20px 80px rgba(83,58,253,0.15), 0 8px 32px rgba(83,58,253,0.10)',
              }}
            >
              <div
                style={{
                  borderRadius: 'calc(1.5rem - 2px)',
                  overflow: 'hidden',
                  background: 'linear-gradient(160deg, #EEF0FF 0%, #F2F0FF 35%, #F6F9FC 100%)',
                  aspectRatio: '16 / 9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {/* Video element (hidden until file exists) */}
                <video
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'none' }}
                  aria-hidden="true"
                >
                  <source src="/videos/sellio-demo.mp4" type="video/mp4" />
                </video>

                {/* Decorative bg orbs */}
                <div style={{
                  position: 'absolute', top: '10%', left: '8%',
                  width: 180, height: 180,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(83,58,253,0.18) 0%, transparent 70%)',
                  filter: 'blur(32px)',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute', bottom: '12%', right: '10%',
                  width: 140, height: 140,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(122,102,255,0.15) 0%, transparent 70%)',
                  filter: 'blur(24px)',
                  pointerEvents: 'none',
                }} />

                {/* Play button */}
                <div
                  className="dp-video-play-btn"
                  style={{
                    width: 72, height: 72,
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 2, position: 'relative',
                    background: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
                    boxShadow: '0 8px 32px rgba(83,58,253,0.45), 0 2px 8px rgba(83,58,253,0.28)',
                  }}
                >
                  <Play size={28} color="white" fill="white" style={{ marginLeft: 3 }} />
                </div>

                {/* Placeholder label */}
                <div style={{
                  position: 'absolute', bottom: '1rem', left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.75rem', fontWeight: 600,
                  color: 'var(--dp-ink-muted)',
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(8px)',
                  padding: '0.3125rem 0.875rem',
                  borderRadius: '99px',
                  border: '1px solid rgba(196,188,255,0.5)',
                  whiteSpace: 'nowrap',
                }}>
                  Demo video coming soon
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15} className="mt-10">
          <div
            style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
              justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem',
            }}
          >
            {bullets.map(b => (
              <div
                key={b}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.875rem', borderRadius: '99px',
                  background: 'rgba(83,58,253,0.05)',
                  border: '1px solid rgba(196,188,255,0.45)',
                }}
              >
                <CheckCircle2 size={13} color="#2F9E6F" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--dp-ink-secondary)' }}>
                  {b}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#pricing" className="btn-secondary" style={{ fontSize: '0.9375rem' }}>
              Watch demo
            </a>
            <Link to="/signup" className="btn-primary" style={{ fontSize: '0.9375rem' }}>
              Start free audit
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
