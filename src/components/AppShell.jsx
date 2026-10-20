import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const KEY = 'milkTrackerSidebar'

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(KEY) === 'collapsed')

  const toggle = () => {
    setCollapsed((prev) => {
      localStorage.setItem(KEY, prev ? 'expanded' : 'collapsed')
      return !prev
    })
  }

  return (
    <div className={`shell ${collapsed ? 'shell-collapsed' : ''}`}>
      <a className="skip-link" href="#main">Skip to content</a>
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="shell-main">
        <Topbar />
        <main className="page" id="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
