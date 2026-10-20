import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, CircleAlert, Eye, EyeOff, Lock, Mail, UserPlus } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/contexts'
import { api } from '../lib/api'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registeredEmail = location.state?.registeredEmail
  const [email, setEmail] = useState(registeredEmail ?? '')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to={location.state?.from ?? '/'} replace />

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const data = await api('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
        errorMessage: 'Invalid email or password.',
      })
      login(data)
      navigate(location.state?.from ?? '/', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={submit} noValidate>
        <div className="auth-head">
          <h1>Welcome back</h1>
          <p>Sign in to see this month's milk.</p>
        </div>

        {registeredEmail && !error && (
          <div className="form-success" role="status">
            <CheckCircle2 size={18} strokeWidth={1.75} />
            <span>Account created. Sign in to get started.</span>
          </div>
        )}

        {error && (
          <div className="form-error" role="alert">
            <CircleAlert size={18} strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email</label>
          <div className="input-wrap">
            <Mail className="input-icon" size={19} strokeWidth={1.6} />
            <input id="email" type="email" className="input" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <Lock className="input-icon" size={19} strokeWidth={1.6} />
            <input
              id="password"
              type={show ? 'text' : 'password'}
              className="input"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="input-action" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={19} strokeWidth={1.6} /> : <Eye size={19} strokeWidth={1.6} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight size={18} strokeWidth={1.75} />}
        </button>

        <Link to="/forgot-password" className="auth-link">
          Forgot your password?
        </Link>

        <div className="auth-divider"><span>New to MilkTracker?</span></div>

        <Link to="/register" className="btn btn-quiet btn-block btn-lg">
          <UserPlus size={18} strokeWidth={1.75} /> Sign up
        </Link>
      </form>
    </AuthLayout>
  )
}
