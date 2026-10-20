import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, LayoutDashboard, LogOut, Milk, Settings, UserRound, Wallet } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/contexts'

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/purchases', label: 'Milk purchases', icon: Milk },
  { to: '/payments', label: 'Payments', icon: Wallet },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="sidebar-top">
        <Logo showWord={!collapsed} />
      </div>

      <nav className="sidebar-nav" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="nav-link" title={collapsed ? label : undefined}>
            <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button type="button" className="nav-link sidebar-collapse" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronsRight size={20} strokeWidth={1.6} /> : <ChevronsLeft size={20} strokeWidth={1.6} />}
          <span className="nav-label">Collapse</span>
        </button>

        <div className="sidebar-user">
          <button type="button" className="sidebar-user-main" onClick={() => navigate('/profile')} title="Open profile">
            <span className="avatar">{user?.name?.charAt(0) ?? '?'}</span>
            <span className="sidebar-user-text">
              <strong>{user?.name}</strong>
              <small>Customer</small>
            </span>
          </button>
          <button type="button" className="icon-btn icon-btn-sm sidebar-logout" onClick={logout} aria-label="Sign out" title="Sign out">
            <LogOut size={17} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </aside>
  )
}
