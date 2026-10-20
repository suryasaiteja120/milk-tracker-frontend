import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, CircleAlert, KeyRound, Mail } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { api } from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState('')
  const [busy, setBusy] = useState(false)

  const requestToken = async (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Enter the email address you registered with.')
      return
    }
    setBusy(true)
    try {
      const data = await api('/api/auth/forgot-password', {
        method: 'POST',
        auth: false,
        parse: 'text',
        body: { email },
        errorMessage: 'We could not start a password reset for that email.',
      })
      setToken(data)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    setError('')
    if (!newPassword || !confirm) {
      setError('Fill in both password fields.')
      return
    }
    if (newPassword.length < 6) {
      setError('Use at least 6 characters for the password.')
      return
    }
    if (newPassword !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const data = await api('/api/auth/reset-password', {
        method: 'POST',
        auth: false,
        parse: 'text',
        body: { token, newPassword },
        errorMessage: 'This reset token is invalid or has expired.',
      })
      setDone(data || 'Your password has been reset.')
      setNewPassword('')
      setConfirm('')
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <Link to="/login" className="auth-back">
          <ArrowLeft size={17} strokeWidth={1.75} /> Back to sign in
        </Link>

        <div className="auth-head">
          <h1>Reset your password</h1>
          <p>{token ? 'Choose a new password for your account.' : 'Enter your email and we will prepare a reset token.'}</p>
        </div>

        {error && (
          <div className="form-error" role="alert">
            <CircleAlert size={18} strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        {done ? (
          <>
            <div className="form-success" role="status">
              <CheckCircle2 size={18} strokeWidth={1.75} />
              <span>{done}</span>
            </div>
            <Link to="/login" className="btn btn-primary btn-block btn-lg">Sign in</Link>
          </>
        ) : !token ? (
          <form className="auth-form" onSubmit={requestToken} noValidate>
            <div className="field">
              <label htmlFor="fp-email">Email</label>
              <div className="input-wrap">
                <Mail className="input-icon" size={19} strokeWidth={1.6} />
                <input id="fp-email" type="email" className="input" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy && <span className="spinner" />} Get reset token
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={resetPassword} noValidate>
            <div className="token-box">
              <span className="field-label">Development reset token</span>
              <code>{token}</code>
              <p>Shown here only for local testing. In production this arrives by email.</p>
            </div>
            <div className="field">
              <label htmlFor="fp-new">New password</label>
              <div className="input-wrap">
                <KeyRound className="input-icon" size={19} strokeWidth={1.6} />
                <input id="fp-new" type="password" className="input" placeholder="At least 6 characters" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="fp-confirm">Confirm password</label>
              <div className="input-wrap">
                <KeyRound className="input-icon" size={19} strokeWidth={1.6} />
                <input id="fp-confirm" type="password" className="input" placeholder="Repeat the new password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy && <span className="spinner" />} Reset password
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}
