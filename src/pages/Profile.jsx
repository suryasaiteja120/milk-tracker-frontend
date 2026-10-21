import { useEffect, useState } from 'react'
import { CircleAlert, LogOut, Mail, Pencil, Phone, RefreshCw, UserRound } from 'lucide-react'
import { useAuth, useToast } from '../context/contexts'
import { api } from '../lib/api'

export default function Profile() {
  const { user, logout, updateUser } = useAuth()
  const { notify } = useToast()
  const [profile, setProfile] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    api(`/api/auth/profile/${user.id}`, { errorMessage: 'We could not load your profile.' })
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        setName(data.name ?? '')
        setPhone(data.phone ?? '')
        setLoadError('')
      })
      .catch((error) => !cancelled && setLoadError(error.message))
    return () => {
      cancelled = true
    }
  }, [user.id, attempt])

  const retry = () => {
    setLoadError('')
    setAttempt((n) => n + 1)
  }

  const save = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!name.trim() || !phone.trim() || !email.trim()) {
  setFormError('Name, email, and phone number are required.')
  return
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
  setFormError('Please enter a valid email address.')
  return
}
    setSaving(true)
    try {
      const data = await api(`/api/auth/profile/${user.id}`, {
        method: 'PUT',
        body: { name, email: email.trim(), phone },
        errorMessage: 'We could not update your profile.',
      })
      setProfile(data)
      setName(data.name)
      setPhone(data.phone)
      setEmail(data.email ?? '')
      updateUser(data)
      setEditing(false)
      notify('Profile updated.')
    } catch (error) {
      setFormError(error.message)
    }
    setSaving(false)
  }

  const cancel = () => {
    setEditing(false)
    setFormError('')
    setName(profile.name)
    setPhone(profile.phone)
    setEmail(profile.email ?? '')
  }

  if (loadError) {
    return (
      <div className="card empty empty-page" role="alert">
        <span className="empty-icon tone-danger"><CircleAlert size={24} strokeWidth={1.6} /></span>
        <strong>We couldn't load your profile</strong>
        <p>{loadError}</p>
        <button type="button" className="btn btn-primary" onClick={retry}>
          <RefreshCw size={17} strokeWidth={1.75} /> Try again
        </button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-grid" aria-busy="true" aria-label="Loading profile">
        <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
        <div className="skeleton" style={{ height: 380, borderRadius: 20 }} />
      </div>
    )
  }

  return (
    <div className="profile-grid">
      <section className="card profile-card" aria-label="Account summary">
        <span className="avatar avatar-xl">{profile.name?.charAt(0)}</span>
        <h2>{profile.name}</h2>
        <p className="muted">{profile.email}</p>
        <span className="chip chip-ok">Active member</span>
        <button type="button" className="btn btn-quiet btn-block" onClick={logout}>
          <LogOut size={18} strokeWidth={1.6} /> Sign out
        </button>
      </section>

      <section className="card form-card" aria-labelledby="personal-info">
        <div className="card-head">
          <div>
            <h2 className="card-title" id="personal-info">Personal information</h2>
            <p className="card-sub">The details linked to your MilkTracker account.</p>
          </div>
          {!editing && (
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setEditing(true)}>
              <Pencil size={15} strokeWidth={1.75} /> Edit
            </button>
          )}
        </div>

        <form className="settings-form" onSubmit={save} noValidate>
          {formError && (
            <div className="form-error" role="alert">
              <CircleAlert size={18} strokeWidth={1.75} />
              <span>{formError}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="pf-name">Full name</label>
            <div className="input-wrap">
              <UserRound className="input-icon" size={19} strokeWidth={1.6} />
              <input id="pf-name" className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={!editing} autoComplete="name" />
            </div>
          </div>

          <div className="field">
  <label htmlFor="pf-email">Email</label>
  <div className="input-wrap">
    <Mail className="input-icon" size={19} strokeWidth={1.6} />
    <input
      id="pf-email"
      type="email"
      className="input"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      disabled={!editing || saving}
      readOnly={!editing}
      autoComplete="email"
      required
    />
  </div>
  {!editing && (
    <span className="field-hint">Click Edit to change your email.</span>
  )}
</div>

          <div className="field">
            <label htmlFor="pf-phone">Phone number</label>
            <div className="input-wrap">
              <Phone className="input-icon" size={19} strokeWidth={1.6} />
              <input id="pf-phone" type="tel" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} autoComplete="tel" />
            </div>
          </div>

          {editing && (
            <div className="form-actions">
              <button type="button" className="btn btn-quiet" onClick={cancel} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving && <span className="spinner" />} Save changes
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  )
}
