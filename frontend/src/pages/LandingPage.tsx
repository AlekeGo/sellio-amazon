import { Link } from 'react-router-dom'
import { Zap, LayoutDashboard, CreditCard } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/layout/Navbar'
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

function AuthWorkspaceBlock() {
  const { user } = useAuth()
  return (
    <div
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '0 1rem',
        paddingTop: '5.5rem',
      }}
    >
      <div
        style={{
          borderRadius: '1rem',
          padding: '1.25rem 1.5rem',
          background: 'rgba(163,230,53,0.04)',
          border: '1px solid rgba(163,230,53,0.14)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 180 }}>
          <div
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              color: 'rgba(163,230,53,0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.25rem',
            }}
          >
            Your Sellio Workspace
          </div>
          <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9', margin: 0, letterSpacing: '-0.02em' }}>
            {user?.full_name ? `Welcome back, ${user.full_name.split(' ')[0]}` : 'Welcome back'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link
            to="/dashboard/new-audit"
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', borderRadius: '0.5rem' }}
          >
            <Zap size={13} />
            New Audit
          </Link>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <LayoutDashboard size={13} />
            Dashboard
          </Link>
          <Link
            to="/dashboard/billing"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            <CreditCard size={13} />
            Billing
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
      <Navbar />
      {isAuthenticated && (
        <div style={{ position: 'relative', zIndex: 1 }}>
          <AuthWorkspaceBlock />
        </div>
      )}
      <div style={isAuthenticated ? { marginTop: '-5.5rem' } : undefined}>
        <HeroSection />
      </div>
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
