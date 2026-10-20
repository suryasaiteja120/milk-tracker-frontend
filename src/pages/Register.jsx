import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { CircleAlert, Eye, EyeOff, Lock, Mail, Phone, UserRound } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/contexts'
import { api } from '../lib/api'

// Change this one line if your backend uses a different registration endpoint.
const REGISTER_ENDPOINT = '/api/auth/register'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** 0–4 score used by the little strength meter under the password field. */
function passwordStrength(value) {
  let score = 0
  if (value.length >= 6) score += 1
  if (value.length >= 10) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1
  return score
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']

export default function Register() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const set = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const strength = values.password ? passwordStrength(values.password) : -1

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Enter your full name.'
    if (!values.email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_PATTERN.test(values.email.trim())) next.email = 'Enter a valid email address.'
    if (values.phone.replace(/\D/g, '').length < 10) next.phone = 'Enter a phone number with at least 10 digits.'
    if (values.password.length < 6) next.password = 'Use at least 6 characters.'
    if (values.confirm !== values.password) next.confirm = 'The two passwords do not match.'
    return next
  }

  const submit = async (event) => {
    event.preventDefault()
    setFormError('')
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      await api(REGISTER_ENDPOINT, {
        method: 'POST',
        auth: false,
        parse: 'text',
        body: {
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          password: values.password,
        },
      })
      navigate('/login', { replace: true, state: { registeredEmail: values.email.trim() } })
    } catch (error) {
      setFormError(
        error.status === 409 || /exist|already|taken|registered/i.test(error.message)
          ? 'An account with this email already exists. Try signing in instead.'
          : error.message,
      )
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-head">
          <h1>Create your account</h1>
          <p>Start tracking your daily milk in a minute.</p>
        </div>

        {formError && (
          <div className="form-error" role="alert">
            <CircleAlert size={18} strokeWidth={1.75} />
            <span>{formError}</span>
          </div>
        )}

        <div className="field">
          <label htmlFor="reg-name">Full name</label>
          <div className="input-wrap">
            <UserRound className="input-icon" size={19} strokeWidth={1.6} />
            <input id="reg-name" className="input" placeholder="e.g. Ravi Kumar" autoComplete="name" value={values.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} autoFocus />
          </div>
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <div className="input-wrap">
            <Mail className="input-icon" size={19} strokeWidth={1.6} />
            <input id="reg-email" type="email" className="input" placeholder="you@example.com" autoComplete="email" value={values.email} onChange={set('email')} aria-invalid={Boolean(errors.email)} />
          </div>
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="reg-phone">Phone number</label>
          <div className="input-wrap">
            <Phone className="input-icon" size={19} strokeWidth={1.6} />
            <input id="reg-phone" type="tel" inputMode="tel" className="input" placeholder="e.g. 98765 43210" autoComplete="tel" value={values.phone} onChange={set('phone')} aria-invalid={Boolean(errors.phone)} />
          </div>
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </div>

        <div className="field">
          <label htmlFor="reg-password">Password</label>
          <div className="input-wrap">
            <Lock className="input-icon" size={19} strokeWidth={1.6} />
            <input
              id="reg-password"
              type={show ? 'text' : 'password'}
              className="input"
              placeholder="At least 6 characters"
              autoComplete="new-password"
              value={values.password}
              onChange={set('password')}
              aria-invalid={Boolean(errors.password)}
            />
            <button type="button" className="input-action" onClick={() => setShow(!show)} aria-label={show ? 'Hide passwords' : 'Show passwords'}>
              {show ? <EyeOff size={19} strokeWidth={1.6} /> : <Eye size={19} strokeWidth={1.6} />}
            </button>
          </div>
          {strength >= 0 && (
            <div className="strength" data-level={Math.max(strength, 0)} aria-live="polite">
              <div className="strength-bars" aria-hidden="true">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={strength >= n ? 'on' : ''} />
                ))}
              </div>
              <small>{STRENGTH_LABELS[strength]}</small>
            </div>
          )}
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <div className="field">
          <label htmlFor="reg-confirm">Confirm password</label>
          <div className="input-wrap">
            <Lock className="input-icon" size={19} strokeWidth={1.6} />
            <input
              id="reg-confirm"
              type={show ? 'text' : 'password'}
              className="input"
              placeholder="Repeat your password"
              autoComplete="new-password"
              value={values.confirm}
              onChange={set('confirm')}
              aria-invalid={Boolean(errors.confirm)}
            />
          </div>
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
          {busy && <span className="spinner" />}
          {busy ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
