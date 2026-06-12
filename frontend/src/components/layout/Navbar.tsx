import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import BrandLogo from '../ui/BrandLogo'

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

function LogoLink() {
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
    <a href="/" onClick={handleClick} style={{ textDecoration: 'none' }}>
      <BrandLogo />
    </a>
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
  const panelRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    document.body.style.overflowX = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
      document.body.style.overflowX = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const handleOutside = (e: Event) => {
      const target = e.target as Node | null
      if (!target) return
      if (panelRef.current?.contains(target)) return
      if (menuButtonRef.current?.contains(target)) return
      setMobileOpen(false)
    }
    document.addEventListener('pointerdown', handleOutside)
    document.addEventListener('touchstart', handleOutside, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', handleOutside)
      document.removeEventListener('touchstart', handleOutside)
    }
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
          zIndex: 60,
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
          borderBottom: scrolled ? '1px solid rgba(196,188,255,0.60)' : '1px solid rgba(196,188,255,0.40)',
          boxShadow: scrolled ? '0 4px 28px rgba(83,58,253,0.08), 0 1px 0 rgba(196,188,255,0.2)' : 'none',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '0 2rem',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease',
        }}
      >
        <LogoLink />

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="dp-desktop-only">
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

        <div className="dp-desktop-only" style={{ alignItems: 'center', gap: '0.625rem' }}>
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
          ref={menuButtonRef}
          className="dp-mobile-only"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'rgba(83,58,253,0.06)', border: '1px solid rgba(196,188,255,0.5)',
            borderRadius: 10, width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--dp-primary)',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(83,58,253,0.1)'; e.currentTarget.style.borderColor = 'rgba(83,58,253,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(83,58,253,0.06)'; e.currentTarget.style.borderColor = 'rgba(196,188,255,0.5)' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
                width: '100vw', height: '100vh',
                zIndex: 40,
                background: 'rgba(13,37,61,0.35)', backdropFilter: 'blur(4px)',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                pointerEvents: 'auto',
              }}
              onClick={() => setMobileOpen(false)}
              onPointerDown={() => setMobileOpen(false)}
            />
            <motion.div
              ref={panelRef}
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
                width: 'min(82vw, 320px)',
                background: '#ffffff', borderLeft: '1px solid rgba(196,188,255,0.50)',
                display: 'flex', flexDirection: 'column',
                boxShadow: '-12px 0 48px rgba(83,58,253,0.12)',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1.125rem 1.5rem',
                borderBottom: '1px solid rgba(196,188,255,0.38)',
                background: 'rgba(238,240,255,0.35)',
              }}>
                <LogoLink />
                <button
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: 'rgba(83,58,253,0.06)', border: '1px solid rgba(196,188,255,0.45)',
                    borderRadius: 8, width: 34, height: 34,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'var(--dp-ink-muted)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(83,58,253,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(83,58,253,0.06)' }}
                >
                  <X size={16} />
                </button>
              </div>

              <nav style={{ flex: 1, padding: '1rem 1rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navLinks.map((link) =>
                  link.href.startsWith('/#') ? (
                    <button
                      key={link.label}
                      onClick={() => { handleAnchorClick(link.href); setMobileOpen(false) }}
                      className="mobile-nav-item"
                      style={{ padding: '0.875rem 1.125rem', borderRadius: 12, border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem', fontFamily: 'inherit', textAlign: 'left', fontWeight: 500 }}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="mobile-nav-item"
                      style={{ padding: '0.875rem 1.125rem', borderRadius: 12, textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>

              <div style={{
                padding: '1.25rem 1.5rem',
                borderTop: '1px solid rgba(196,188,255,0.38)',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                background: 'rgba(248,250,252,0.8)',
              }}>
                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="dp-btn-ghost" style={{ justifyContent: 'center', width: '100%', fontSize: '0.9375rem' }}>
                    Sign in
                  </Link>
                )}
                <Link to={ctaHref} onClick={() => setMobileOpen(false)} className="dp-btn-primary" style={{ justifyContent: 'center', width: '100%', fontSize: '0.9375rem', padding: '0.75rem 1.5rem' }}>
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
