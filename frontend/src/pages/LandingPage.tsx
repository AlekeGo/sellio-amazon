import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Zap, BarChart2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/sections/HeroSection'
import ProblemSection from '../components/sections/ProblemSection'
import SolutionSection from '../components/sections/SolutionSection'
import AnalysisSection from '../components/sections/AnalysisSection'
import AuditDemoSection from '../components/sections/AuditDemoSection'
import ImageStudioSection from '../components/sections/ImageStudioSection'
import HowItWorksSection from '../components/sections/HowItWorksSection'
import PricingSection from '../components/sections/PricingSection'
import FaqSection from '../components/sections/FaqSection'
import FinalCtaSection from '../components/sections/FinalCtaSection'

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

function SellioWordmark() {
  const navigate = useNavigate()
  const location = useLocation()
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }
  return (
    <a
      href="/"
      onClick={handleClick}
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(83,58,253,0.28)',
      }}>
        <BarChart2 size={16} color="#fff" />
      </div>
      <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--dp-ink)', letterSpacing: '-0.03em' }}>
        Sellio
      </span>
    </a>
  )
}

function AuthWorkspacePanel() {
  const { user } = useAuth()

  const chips: Array<{ label: string; to?: string; action?: () => void }> = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'New Audit', to: '/dashboard/new-audit' },
    { label: 'Image Studio', to: '/dashboard/image-studio' },
    { label: 'Pricing', action: () => scrollTo('pricing') },
    { label: 'How it works', action: () => scrollTo('how-it-works') },
  ]

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0.5rem 1.5rem' }}>
      <div style={{
        borderRadius: '1.75rem',
        padding: '1rem 1.75rem',
        minHeight: 72,
        background: 'linear-gradient(135deg, rgba(238,234,255,0.92) 0%, rgba(245,243,255,0.96) 50%, rgba(238,240,255,0.88) 100%)',
        border: '1px solid rgba(196,188,255,0.65)',
        boxShadow: '0 2px 20px rgba(83,58,253,0.09), 0 8px 32px rgba(83,58,253,0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <SellioWordmark />

        <div style={{ width: 1, height: 24, background: 'rgba(196,188,255,0.7)', flexShrink: 0 }} />

        <div style={{ minWidth: 120 }}>
          <div style={{
            fontSize: '0.5625rem', fontWeight: 700,
            color: 'rgba(83,58,253,0.55)', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: '0.125rem',
          }}>
            Your Sellio Workspace
          </div>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--dp-ink)', margin: 0, letterSpacing: '-0.02em' }}>
            {user?.full_name ? `Welcome back, ${user.full_name.split(' ')[0]}` : 'Welcome back'}
          </p>
        </div>

        <nav style={{ display: 'flex', gap: '0.125rem', flex: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          {chips.map(chip =>
            chip.to ? (
              <Link key={chip.label} to={chip.to} className="landing-chip">{chip.label}</Link>
            ) : (
              <button key={chip.label} onClick={chip.action} className="landing-chip">{chip.label}</button>
            )
          )}
        </nav>

        <Link
          to="/dashboard/new-audit"
          className="dp-btn-primary"
          style={{ padding: '0.5rem 1.125rem', fontSize: '0.8125rem', flexShrink: 0, gap: '0.375rem' }}
        >
          <Zap size={13} />
          New Audit
        </Link>
      </div>
    </div>
  )
}

function GuestTopBar() {
  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0.5rem 1.5rem' }}>
      <div style={{
        borderRadius: '1.75rem',
        padding: '1rem 1.75rem',
        minHeight: 72,
        background: 'rgba(255,255,255,0.94)',
        border: '1px solid rgba(196,188,255,0.5)',
        boxShadow: '0 2px 16px rgba(83,58,253,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', gap: '1.25rem',
      }}>
        <SellioWordmark />

        <nav style={{ display: 'flex', gap: '0.125rem', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => scrollTo('how-it-works')} className="landing-chip">How it works</button>
          <button onClick={() => scrollTo('features')} className="landing-chip">Features</button>
          <button onClick={() => scrollTo('pricing')} className="landing-chip">Pricing</button>
        </nav>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
          <Link to="/login" className="dp-btn-ghost" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}>
            Sign in
          </Link>
          <Link to="/dashboard/new-audit" className="dp-btn-primary" style={{ padding: '0.5rem 1.125rem', fontSize: '0.875rem' }}>
            Start Free
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(196,188,255,0.35)',
      }}>
        {isAuthenticated ? <AuthWorkspacePanel /> : <GuestTopBar />}
      </header>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <AnalysisSection />
      <AuditDemoSection />
      <ImageStudioSection />
      <HowItWorksSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
      <Footer />
    </div>
  )
}
