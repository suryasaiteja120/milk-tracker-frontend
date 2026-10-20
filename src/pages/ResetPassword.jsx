import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, CircleAlert, Eye, EyeOff, KeyRound } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { api } from '../lib/api'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!token) {
      setError('This reset link is missing its token. Request a new one.')
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
      await api('/api/auth/reset-password', {
        method: 'POST',
        auth: false,
        parse: 'text',
        body: { token, newPassword },
        errorMessage: 'This reset link is invalid or has expired.',
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <AuthLayout>
      {success ? (
        <div className="auth-card auth-center">
          <span className="auth-success-icon"><CheckCircle2 size={30} strokeWidth={1.6} /></span>
          <div className="auth-head">
            <h1>Password updated</h1>
            <p>You can now sign in with your new password.</p>
          </div>
          <Link to="/login" className="btn btn-primary btn-block btn-lg">Go to sign in</Link>
        </div>
      ) : (
        <form className="auth-card" onSubmit={submit} noValidate>
          <div className="auth-head">
            <h1>Choose a new password</h1>
            <p>Pick something you haven't used before.</p>
          </div>

          {error && (
            <div className="form-error" role="alert">
              <CircleAlert size={18} strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="rp-new">New password</label>
            <div className="input-wrap">
              <KeyRound className="input-icon" size={19} strokeWidth={1.6} />
              <input id="rp-new" type={show ? 'text' : 'password'} className="input" placeholder="At least 6 characters" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button type="button" className="input-action" onClick={() => setShow(!show)} aria-label={show ? 'Hide passwords' : 'Show passwords'}>
                {show ? <EyeOff size={19} strokeWidth={1.6} /> : <Eye size={19} strokeWidth={1.6} />}
              </button>
            </div>
          </div>

          <div className="field">
            <label htmlFor="rp-confirm">Confirm password</label>
            <div className="input-wrap">
              <KeyRound className="input-icon" size={19} strokeWidth={1.6} />
              <input id="rp-confirm" type={show ? 'text' : 'password'} className="input" placeholder="Repeat the new password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={busy}>
            {busy && <span className="spinner" />} Update password
          </button>
          <Link to="/login" className="auth-link">Back to sign in</Link>
        </form>
      )}
    </AuthLayout>
  )
}
