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
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%)',
        boxShadow: '0 0 20px rgba(14, 165, 233, 0.4)',
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
          <path d="M6.5 9.5L8 11L11.5 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="text-[1.125rem] font-bold tracking-tight" style={{ color: '#f1f5f9', letterSpacing: '-0.03em' }}>
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
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(3, 8, 18, 0.92)'
            : 'rgba(3, 8, 18, 0.5)',
          borderBottom: scrolled
            ? '1px solid rgba(255, 255, 255, 0.07)'
            : '1px solid transparent',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="container-xl">
          <div className="flex items-center justify-between h-16">
            <SelliöLogo />

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                link.href.startsWith('/#') ? (
                  <button
                    key={link.label}
                    onClick={() => handleAnchorClick(link.href)}
                    className="nav-link-item px-4 py-2 text-sm font-medium rounded-md cursor-pointer"
                    style={{ background: 'none', border: 'none' }}
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="nav-link-item px-4 py-2 text-sm font-medium rounded-md"
                    style={{ textDecoration: 'none' }}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link to="/dashboard/new-audit" className="btn-primary text-sm px-5 py-2.5">
                Start Free Audit
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-md transition-colors"
              style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
              style={{ background: 'rgba(3, 8, 18, 0.7)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col"
              style={{
                background: 'rgba(6, 14, 30, 0.98)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div className="flex items-center justify-between px-6 h-16">
                <SelliöLogo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-md"
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
                      className="mobile-nav-item px-4 py-3 rounded-lg text-sm font-medium text-left cursor-pointer"
                      style={{ border: 'none', background: 'none' }}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="mobile-nav-item px-4 py-3 rounded-lg text-sm font-medium"
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
