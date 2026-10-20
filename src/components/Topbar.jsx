import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, LogOut, Moon, Search, Settings, Sun, UserRound } from 'lucide-react'
import MonthSwitcher from './MonthSwitcher'
import NotificationPanel from './NotificationPanel'
import { useAuth, useData } from '../context/contexts'
import { greeting } from '../lib/format'
import { setDark, useDark } from '../lib/theme'

const TITLES = {
  '/': 'Overview',
  '/purchases': 'Milk purchases',
  '/payments': 'Payments',
  '/profile': 'Profile',
  '/settings': 'Settings',
}

/** Closes a popover on outside click / Escape. */
function usePopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return [open, setOpen, ref]
}

export default function Topbar() {
  const { user, logout } = useAuth()
  const { notifications, query, setQuery } = useData()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dark = useDark()
  const [bellOpen, setBellOpen, bellRef] = usePopover()
  const [menuOpen, setMenuOpen, menuRef] = usePopover()

  const unread = notifications?.filter((n) => !n.read).length ?? 0
  const title = TITLES[pathname] ?? 'MilkTracker'
  const showControls = ['/', '/purchases', '/payments'].includes(pathname)
  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{pathname === '/' ? `${greeting()}, ${firstName}` : title}</h1>
        <p>{pathname === '/' ? 'Here is how your milk month is going.' : 'MilkTracker'}</p>
      </div>

      {showControls && (
        <label className="topbar-search">
          <Search size={18} strokeWidth={1.6} aria-hidden="true" />
          <span className="sr-only">Search purchases and payments</span>
          <input
            type="search"
            placeholder="Search by date, session or amount"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      )}

      <div className="topbar-actions">
        {showControls && <MonthSwitcher />}

        <button type="button" className="icon-btn" onClick={() => setDark(!dark)} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? <Sun size={19} strokeWidth={1.6} /> : <Moon size={19} strokeWidth={1.6} />}
        </button>

        <div className="popover-anchor" ref={bellRef}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setBellOpen(!bellOpen)}
            aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
            aria-expanded={bellOpen}
          >
            <Bell size={19} strokeWidth={1.6} />
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {bellOpen && <NotificationPanel />}
        </div>

        <div className="popover-anchor" ref={menuRef}>
          <button type="button" className="avatar-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Account menu" aria-expanded={menuOpen}>
            <span className="avatar">{user?.name?.charAt(0) ?? '?'}</span>
          </button>
          {menuOpen && (
            <div className="popover menu" role="menu">
              <div className="menu-user">
                <strong>{user?.name}</strong>
                <small>{user?.email}</small>
              </div>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); navigate('/profile') }}>
                <UserRound size={18} strokeWidth={1.6} /> Profile
              </button>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); navigate('/settings') }}>
                <Settings size={18} strokeWidth={1.6} /> Settings
              </button>
              <button type="button" role="menuitem" className="menu-danger" onClick={logout}>
                <LogOut size={18} strokeWidth={1.6} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
