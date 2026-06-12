import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

const EASE = [0.21, 0.47, 0.32, 0.98] as const

export default function HeroSection() {
  const prefersReduced = useReducedMotion()
  const scrollToDemo = () => {
    document.getElementById('audit-demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ paddingTop: '4rem' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full hero-bg-orb"
          style={{
            width: '1200px', height: '1200px',
            top: '-500px', left: '-350px',
            background: 'radial-gradient(circle, rgba(83,58,253,0.14) 0%, rgba(106,85,254,0.05) 40%, transparent 65%)',
            filter: 'blur(90px)',
          }}
        />
        <div
          className="absolute rounded-full hero-bg-orb"
          style={{
            width: '850px', height: '850px',
            top: '-180px', right: '-220px',
            background: 'radial-gradient(circle, rgba(196,188,255,0.28) 0%, transparent 65%)',
            filter: 'blur(75px)',
          }}
        />
        <div
          className="absolute rounded-full hero-bg-orb"
          style={{
            width: '600px', height: '600px',
            bottom: '60px', left: '22%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute rounded-full hero-bg-orb"
          style={{
            width: '420px', height: '420px',
            top: '18%', right: '4%',
            background: 'radial-gradient(circle, rgba(83,58,253,0.07) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse 115% 62% at 50% -10%, rgba(83,58,253,0.13) 0%, transparent 58%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse 85% 48% at 50% 115%, rgba(238,240,255,0.95) 0%, transparent 52%)' }}
        />
      </div>

      <div className="container-xl relative z-10 py-16">
        <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>

          <motion.h1
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.75, delay: 0.12, ease: EASE }}
            style={{
              fontWeight: 900,
              letterSpacing: '-0.042em',
              lineHeight: '1.02',
              marginBottom: '1.75rem',
              fontSize: 'clamp(2.625rem, 5.5vw, 5.5rem)',
            }}
          >
            <span style={{ display: 'block', color: 'var(--dp-ink)' }}>
              Average listings<br />don't look average.
            </span>
            <span style={{ display: 'block', paddingTop: '0.16em', color: 'var(--dp-ink)' }}>
              They look{' '}
              <span className="gradient-text">invisible.</span>
            </span>
          </motion.h1>

          <motion.p
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.65, delay: 0.24, ease: EASE }}
            style={{
              color: 'var(--dp-ink-muted)',
              fontSize: '1.1875rem',
              lineHeight: '1.68',
              maxWidth: '580px',
              margin: '0 auto 2.75rem',
            }}
          >
            Sellio finds what your listing is missing — then improves your copy, buyer signals, and Amazon-ready visuals.
          </motion.p>

          <motion.div
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.6, delay: 0.34, ease: EASE }}
            style={{
              display: 'flex', gap: '0.875rem', flexWrap: 'wrap',
              justifyContent: 'center', marginBottom: '2.5rem',
            }}
          >
            <Link
              to="/dashboard/new-audit"
              className="dp-btn-primary"
              style={{ fontSize: '1.0625rem', padding: '0.8125rem 2.25rem' }}
            >
              Start Free Audit <ArrowRight size={17} />
            </Link>
            <button
              className="dp-btn-ghost"
              onClick={scrollToDemo}
              style={{ fontSize: '1.0625rem', padding: '0.8125rem 1.5rem' }}
            >
              View Sample Report
            </button>
          </motion.div>

          <motion.div
            initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.6, delay: 0.44, ease: EASE }}
            style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {['Amazon-ready copy', 'AI image pack', 'Score in 60s'].map(item => (
              <span key={item} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.875rem', borderRadius: '99px',
                background: 'rgba(83,58,253,0.05)', border: '1px solid rgba(196,188,255,0.55)',
                fontSize: '0.875rem', color: 'var(--dp-ink-secondary)', fontWeight: 500,
              }}>
                <Check size={12} color="#533AFD" strokeWidth={2.5} />
                {item}
              </span>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  )
}
