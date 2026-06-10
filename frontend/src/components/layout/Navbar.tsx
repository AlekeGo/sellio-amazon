import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, BarChart2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

const guestLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
]

const authLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'New Audit', href: '/dashboard/new-audit' },
  { label: 'Billing', href: '/dashboard/billing' },
]

function SellioLogo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'linear-gradient(135deg, #6A55FE 0%, #533AFD 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <BarChart2 size={15} color="#fff" />
      </div>
      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--dp-ink)', letterSpacing: '-0.02em' }}>
        Sellio
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const navLinks = isAuthenticated ? authLinks : guestLinks
  const ctaLabel = isAuthenticated ? 'New Audit' : 'Start Free'
  const ctaHref = '/dashboard/new-audit'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleAnchorClick = (href: string) => {
    if (href.startsWith('/#')) {
      const el = document.getElementById(href.slice(2))
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header
        className="dp-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.88)',
          borderBottom: scrolled ? '1px solid rgba(196,188,255,0.55)' : '1px solid rgba(196,188,255,0.38)',
          boxShadow: scrolled ? '0 4px 24px rgba(83,58,253,0.08)' : 'none',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '0 1.5rem',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
        }}
      >
        <SellioLogo />

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
          {navLinks.map((link) =>
            link.href.startsWith('/#') ? (
              <button
                key={link.label}
                onClick={() => handleAnchorClick(link.href)}
                className="nav-link-item"
                style={{
                  fontSize: '0.875rem', fontWeight: 500,
                  padding: '0.5rem 0.875rem', borderRadius: 9999,
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="nav-link-item"
                style={{
                  fontSize: '0.875rem', fontWeight: 500,
                  padding: '0.5rem 0.875rem', borderRadius: 9999,
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                }}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '0.625rem' }}>
          {!isAuthenticated && (
            <Link to="/login" className="dp-btn-ghost" style={{ fontSize: '0.875rem', padding: '0.5rem 0.875rem' }}>
              Sign in
            </Link>
          )}
          <Link to={ctaHref} className="dp-btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1.125rem' }}>
            {ctaLabel}
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'rgba(83,58,253,0.06)', border: '1px solid rgba(196,188,255,0.5)',
            borderRadius: 8, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--dp-primary)',
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(13,37,61,0.35)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50, width: 280,
                background: '#ffffff', borderLeft: '1px solid rgba(196,188,255,0.50)',
                display: 'flex', flexDirection: 'column',
                boxShadow: '-8px 0 40px rgba(83,58,253,0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid rgba(196,188,255,0.38)' }}>
                <SellioLogo />
                <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dp-ink-muted)', padding: 4 }}>
                  <X size={18} />
                </button>
              </div>

              <nav style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {navLinks.map((link) =>
                  link.href.startsWith('/#') ? (
                    <button
                      key={link.label}
                      onClick={() => { handleAnchorClick(link.href); setMobileOpen(false) }}
                      className="mobile-nav-item"
                      style={{ padding: '0.75rem 1rem', borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9375rem', fontFamily: 'inherit', textAlign: 'left' }}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="mobile-nav-item"
                      style={{ padding: '0.75rem 1rem', borderRadius: 10, textDecoration: 'none', fontSize: '0.9375rem' }}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>

              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(196,188,255,0.38)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="dp-btn-ghost" style={{ justifyContent: 'center', width: '100%' }}>
                    Sign in
                  </Link>
                )}
                <Link to={ctaHref} onClick={() => setMobileOpen(false)} className="dp-btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
                  {ctaLabel}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
