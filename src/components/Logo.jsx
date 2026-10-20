import { Link } from 'react-router-dom'

export function LogoMark({ className = 'logo-mark' }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#2F6BF0" />
      <path d="M32 13C32 13 19 28.5 19 38.5a13 13 0 0 0 26 0C45 28.5 32 13 32 13Z" fill="#fff" />
      <path d="M25.5 39c.4 3.6 3 6 6.5 6.4" stroke="#2F6BF0" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default function Logo({ to = '/', showWord = true }) {
  return (
    <Link to={to} className="logo" aria-label="MilkTracker home">
      <LogoMark />
      {showWord && <span className="logo-word">MilkTracker</span>}
    </Link>
  )
}
