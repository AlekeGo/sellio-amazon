import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection'

export default function FinalCtaSection() {
  const scrollToDemo = () => {
    document.getElementById('audit-demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-xl relative z-10">
        <AnimatedSection>
          <div
            className="relative rounded-3xl overflow-hidden text-center px-8 py-20"
            style={{
              background: 'linear-gradient(135deg, rgba(83,58,253,0.06) 0%, rgba(122,102,255,0.04) 50%, rgba(238,240,255,0.8) 100%)',
              border: '1px solid rgba(83,58,253,0.22)',
              boxShadow: '0 0 80px rgba(83,58,253,0.08), 0 0 40px rgba(83,58,253,0.05)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(83,58,253,0.08) 0%, transparent 65%)',
              }}
            />

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(83,58,253,0.035) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(83,58,253,0.5), rgba(122,102,255,0.4), transparent)' }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2
                className="font-black tracking-tight mb-5"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', color: 'var(--dp-ink)' }}
              >
                Your next sale starts with a{' '}
                <span className="gradient-text">better listing.</span>
              </h2>

              <p className="text-lg leading-relaxed mb-10" style={{ color: 'var(--dp-ink-muted)' }}>
                Run your first free audit in under 60 seconds. No credit card. No Amazon account needed.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/dashboard/new-audit" className="btn-primary glow-button text-base px-9 py-4">
                  Start Free Audit <ArrowRight size={17} />
                </Link>
                <button className="btn-secondary text-base px-8 py-4" onClick={scrollToDemo}>
                  View Sample Report
                </button>
              </div>

              <p className="text-xs mt-6" style={{ color: 'var(--dp-ink-muted)' }}>
                No credit card required · Results in seconds · Cancel anytime
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
