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
import BrandLogo from '../ui/BrandLogo'

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
        borderRadius: '0.625rem',
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 400,
        color: isActive ? 'var(--dp-primary)' : hovered ? 'var(--dp-ink)' : 'var(--dp-ink-muted)',
        background: isActive
          ? 'rgba(83,58,253,0.09)'
          : hovered
            ? 'rgba(83,58,253,0.04)'
            : 'transparent',
        border: isActive ? '1px solid rgba(83,58,253,0.18)' : '1px solid transparent',
        textDecoration: 'none',
        transition: 'all 0.15s ease',
      })}
    >
      <Icon size={16} />
      {label}
    </NavLink>
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
      <div style={{
        padding: '1.125rem 1rem',
        borderBottom: '1px solid rgba(196,188,255,0.38)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <BrandLogo />
        <button
          onClick={onClose}
          className="dashboard-topbar-only"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--dp-ink-muted)',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
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

      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(196,188,255,0.38)' }}>
        {user && (
          <div style={{
            padding: '0.5rem 0.75rem',
            marginBottom: '0.375rem',
            borderRadius: '0.625rem',
            background: 'rgba(83,58,253,0.04)',
          }}>
            {user.full_name && (
              <div style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--dp-ink)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.full_name}
              </div>
            )}
            <div style={{
              fontSize: '0.6875rem',
              color: 'var(--dp-ink-muted)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              marginTop: user.full_name ? 1 : 0,
            }}>
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
            borderRadius: '0.625rem',
            background: logoutHovered ? 'rgba(239,68,68,0.07)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: logoutHovered ? '#ef4444' : 'var(--dp-ink-muted)',
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
    <div style={{ background: '#F6F9FC', minHeight: '100vh' }}>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="dashboard-topbar"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13,37,61,0.35)',
            zIndex: 45,
            backdropFilter: 'blur(4px)',
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
            borderBottom: '1px solid rgba(196,188,255,0.40)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <BrandLogo small />
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'rgba(83,58,253,0.06)',
              border: '1px solid rgba(196,188,255,0.50)',
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--dp-primary)',
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
