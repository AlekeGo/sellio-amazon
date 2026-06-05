import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Login', href: '/login' },
]

function SelliöLogo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 no-underline select-none">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #4ade80 100%)',
          boxShadow: '0 0 16px rgba(74,222,128,0.3)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="10" width="2.5" height="4" rx="0.75" fill="white" opacity="0.65"/>
          <rect x="6.75" y="6.5" width="2.5" height="7.5" rx="0.75" fill="white" opacity="0.82"/>
          <rect x="11.5" y="2.5" width="2.5" height="11.5" rx="0.75" fill="white"/>
        </svg>
      </div>
      <span
        className="font-bold tracking-tight"
        style={{ color: '#e8f4e8', letterSpacing: '-0.04em', fontSize: '1.1rem' }}
      >
        sell<span className="gradient-text">io</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleAnchorClick = (href: string) => {
    if (href.startsWith('/#')) {
      const id = href.slice(2)
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ padding: '1rem 1rem 0' }}
      >
        <div
          style={{
            maxWidth: '960px',
            width: '100%',
            background: scrolled
              ? 'rgba(7, 14, 10, 0.95)'
              : 'rgba(7, 14, 10, 0.72)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '9999px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
            boxShadow: scrolled
              ? '0 8px 32px rgba(0,0,0,0.35), 0 1px 0 rgba(163,230,53,0.06) inset'
              : '0 2px 16px rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex items-center justify-between" style={{ padding: '0.5rem 0.75rem 0.5rem 1.25rem' }}>
            <SelliöLogo />

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                link.href.startsWith('/#') ? (
                  <button
                    key={link.label}
                    onClick={() => handleAnchorClick(link.href)}
                    className="nav-link-item px-4 py-2 text-sm font-medium rounded-full cursor-pointer"
                    style={{ background: 'none', border: 'none' }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="nav-link-item px-4 py-2 text-sm font-medium rounded-full"
                    style={{ textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/dashboard/new-audit"
                className="btn-primary text-sm"
                style={{ padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.875rem' }}
              >
                Start Free Audit
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-full"
              style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(3, 8, 5, 0.75)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col"
              style={{
                background: 'rgba(8, 16, 11, 0.98)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div className="flex items-center justify-between px-6 h-16">
                <SelliöLogo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-full"
                  style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col px-4 pt-4 gap-1 flex-1">
                {navLinks.map((link) => (
                  link.href.startsWith('/#') ? (
                    <button
                      key={link.label}
                      onClick={() => { handleAnchorClick(link.href); setMobileOpen(false) }}
                      className="mobile-nav-item px-4 py-3 rounded-xl text-sm font-medium text-left cursor-pointer"
                      style={{ border: 'none', background: 'none' }}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="mobile-nav-item px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ textDecoration: 'none' }}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </nav>

              <div className="p-6">
                <Link
                  to="/dashboard/new-audit"
                  className="btn-primary w-full justify-center"
                  style={{ borderRadius: '9999px' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Start Free Audit
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
