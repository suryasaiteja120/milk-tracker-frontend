import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellRing, ChevronRight, Database, KeyRound, Milk, Moon, ShieldCheck } from 'lucide-react'
import { useToast } from '../context/contexts'
import { setDark, useDark } from '../lib/theme'

function Row({ icon: Icon, title, text, children }) {
  return (
    <div className="setting-row">
      <span className="setting-icon">
        <Icon size={19} strokeWidth={1.6} />
      </span>
      <div className="setting-text">
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)} />
}

export default function Settings() {
  const { notify } = useToast()
  const navigate = useNavigate()
  const dark = useDark()
  const [notifications, setNotifications] = useState(() => localStorage.getItem('milkTrackerNotifications') !== 'false')
  const [reminders, setReminders] = useState(() => localStorage.getItem('milkTrackerReminders') !== 'false')
  const [quantity, setQuantity] = useState(() => localStorage.getItem('milkTrackerDefaultQuantity') || '1')
  const [price, setPrice] = useState(() => localStorage.getItem('milkTrackerDefaultPrice') || '')

  const toggle = (key, setter) => (value) => {
    setter(value)
    localStorage.setItem(key, String(value))
    notify('Setting saved.')
  }

  const saveDefaults = (event) => {
    event.preventDefault()
    localStorage.setItem('milkTrackerDefaultQuantity', quantity)
    localStorage.setItem('milkTrackerDefaultPrice', price)
    notify('Milk defaults saved.')
  }

  return (
    <div className="settings-grid">
      <section className="card settings-card" aria-labelledby="set-appearance">
        <h2 className="card-title" id="set-appearance">Appearance</h2>
        <Row icon={Moon} title="Dark mode" text="Use a darker theme that is easier on the eyes at night.">
          <Toggle checked={dark} onChange={setDark} label="Dark mode" />
        </Row>
      </section>

      <section className="card settings-card" aria-labelledby="set-notify">
        <h2 className="card-title" id="set-notify">Notifications</h2>
        <Row icon={Bell} title="Notifications" text="Get updates when purchases and payments change.">
          <Toggle checked={notifications} onChange={toggle('milkTrackerNotifications', setNotifications)} label="Notifications" />
        </Row>
        <Row icon={BellRing} title="Milk reminders" text="A nudge to record your daily milk.">
          <Toggle checked={reminders} onChange={toggle('milkTrackerReminders', setReminders)} label="Milk reminders" />
        </Row>
      </section>

      <section className="card settings-card" aria-labelledby="set-defaults">
        <h2 className="card-title" id="set-defaults">Milk defaults</h2>
        <p className="card-sub">These fill in the Add milk form so you can save a purchase in seconds.</p>
        <form className="defaults-form" onSubmit={saveDefaults}>
          <div className="field">
            <label htmlFor="def-qty">Default quantity (litres)</label>
            <input id="def-qty" type="number" min="0" step="0.25" className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="def-price">Default price per litre</label>
            <input id="def-price" type="number" min="0" step="0.5" className="input" placeholder="e.g. 60" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">
            <Milk size={17} strokeWidth={1.6} /> Save defaults
          </button>
        </form>
      </section>

      <section className="card settings-card" aria-labelledby="set-security">
        <h2 className="card-title" id="set-security">Security & data</h2>
        <button type="button" className="setting-link" onClick={() => navigate('/forgot-password')}>
          <span className="setting-icon"><KeyRound size={19} strokeWidth={1.6} /></span>
          <span className="setting-text">
            <strong>Change password</strong>
            <p>Request a reset token to set a new password.</p>
          </span>
          <ChevronRight size={19} strokeWidth={1.6} />
        </button>
        <Row icon={ShieldCheck} title="Your session" text="You stay signed in on this device until you sign out." />
        <Row icon={Database} title="Your data" text="Purchases and payments are stored with your MilkTracker account." />
      </section>
    </div>
  )
}
