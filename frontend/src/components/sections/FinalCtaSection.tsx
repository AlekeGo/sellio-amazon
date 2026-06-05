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
              background: 'linear-gradient(135deg, rgba(14,165,233,0.09) 0%, rgba(124,58,237,0.09) 100%)',
              border: '1px solid rgba(56,189,248,0.22)',
              boxShadow: '0 0 120px rgba(14,165,233,0.07), 0 0 60px rgba(124,58,237,0.06)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(14,165,233,0.14) 0%, transparent 65%)',
              }}
            />

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(56,189,248,0.04) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.5), rgba(167,139,250,0.5), transparent)' }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="section-badge mx-auto w-fit mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Start Today
              </div>

              <h2
                className="font-black tracking-tight mb-5"
                style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', letterSpacing: '-0.03em', color: '#f1f5f9' }}
              >
                Your next sale starts with a{' '}
                <span className="gradient-text">better listing.</span>
              </h2>

              <p className="text-lg leading-relaxed mb-10" style={{ color: '#94a3b8' }}>
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

              <p className="text-xs mt-6" style={{ color: '#475569' }}>
                No credit card required · Results in seconds · Cancel anytime
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
