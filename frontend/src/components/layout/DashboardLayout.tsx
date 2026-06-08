import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Zap,
  ClipboardList,
  ImageIcon,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/', end: true },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', end: true },
  { icon: Zap, label: 'New Audit', path: '/dashboard/new-audit', end: false },
  { icon: ClipboardList, label: 'Audits', path: '/dashboard/audits', end: false },
  { icon: ImageIcon, label: 'Image Studio', path: '/image-studio', end: false },
  { icon: CreditCard, label: 'Billing', path: '/dashboard/billing', end: false },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', end: false },
]

function NavItem({
  icon: Icon,
  label,
  path,
  end,
  onClick,
}: {
  icon: typeof LayoutDashboard
  label: string
  path: string
  end: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <NavLink
      to={path}
      end={end}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.5625rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 400,
        color: isActive ? '#f1f5f9' : hovered ? '#94a3b8' : '#64748b',
        background: isActive
          ? 'rgba(163,230,53,0.09)'
          : hovered
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
        border: isActive ? '1px solid rgba(163,230,53,0.18)' : '1px solid transparent',
        textDecoration: 'none',
        transition: 'all 0.15s ease',
      })}
    >
      <Icon size={16} />
      {label}
    </NavLink>
  )
}

function SellioLogo({ small }: { small?: boolean }) {
  const wh = small ? 26 : 28
  const r = small ? 7 : 8
  const ic = small ? 13 : 14
  const fs = small ? '0.9375rem' : '1rem'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
      <div
        style={{
          width: wh,
          height: wh,
          borderRadius: r,
          background: 'linear-gradient(135deg, #166534, #4ade80)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={ic} height={ic} viewBox="0 0 18 18" fill="none">
          <path
            d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M6.5 9.5L8 11L11.5 7"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span style={{ fontSize: fs, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
        sell<span className="gradient-text">io</span>
      </span>
    </div>
  )
}

function SidebarContent({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [logoutHovered, setLogoutHovered] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '1.125rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <SellioLogo />
        <button
          onClick={onClose}
          className="dashboard-topbar-only"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#475569',
            padding: 4,
            borderRadius: 6,
            alignItems: 'center',
          }}
        >
          <X size={15} />
        </button>
      </div>

      <nav style={{ flex: 1, padding: '0.5rem 0.75rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.path} {...item} onClick={onClose} />
          ))}
        </div>
      </nav>

      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {user && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              marginBottom: '0.375rem',
              borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            {user.full_name && (
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.full_name}
              </div>
            )}
            <div
              style={{
                fontSize: '0.6875rem',
                color: '#475569',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: user.full_name ? 1 : 0,
              }}
            >
              {user.email}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            background: logoutHovered ? 'rgba(239,68,68,0.08)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: logoutHovered ? '#f87171' : '#64748b',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ background: '#070e0a', minHeight: '100vh' }}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="dashboard-topbar"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 45,
          }}
        />
      )}

      <aside className={`dashboard-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>

      <div className="dashboard-main">
        <header
          className="dashboard-topbar"
          style={{
            justifyContent: 'space-between',
            padding: '0.875rem 1.125rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: '#0a1510',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <SellioLogo small />
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94a3b8',
            }}
          >
            <Menu size={18} />
          </button>
        </header>

        <main className="dashboard-content-inner">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
