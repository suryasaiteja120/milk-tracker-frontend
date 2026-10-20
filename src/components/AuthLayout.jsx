import Logo, { LogoMark } from './Logo'

/** Decorative route used on the brand panel: a winding path with milk stops. */
function RouteArt() {
  const stops = [
    { x: 70, y: 70, c: 'morning' },
    { x: 190, y: 70, c: 'both' },
    { x: 310, y: 70, c: 'evening' },
    { x: 430, y: 70, c: 'morning' },
    { x: 430, y: 200, c: 'both' },
    { x: 310, y: 200, c: 'evening' },
    { x: 190, y: 200, c: 'morning' },
    { x: 70, y: 200, c: 'miss' },
    { x: 70, y: 330, c: 'evening' },
    { x: 190, y: 330, c: 'both' },
    { x: 310, y: 330, c: 'morning' },
  ]
  return (
    <svg className="auth-art" viewBox="0 0 500 400" aria-hidden="true">
      <path
        className="art-line"
        pathLength="100"
        d="M70 70H430C490 70 490 200 430 200H70C10 200 10 330 70 330H310"
        fill="none"
        stroke="rgba(255,255,255,.28)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {stops.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`}>
          <g className="node-pop" style={{ '--i': i }}>
          {s.c === 'both' ? (
            <>
              <path d="M0 -17A17 17 0 0 0 0 17Z" fill="#4FD08A" />
              <path d="M0 -17A17 17 0 0 1 0 17Z" fill="#FF8A78" />
            </>
          ) : s.c === 'miss' ? (
            <circle r="16" fill="none" stroke="#D9B38C" strokeWidth="2.5" strokeDasharray="4 4" />
          ) : (
            <circle r="17" fill={s.c === 'morning' ? '#4FD08A' : '#FF8A78'} />
          )}
          {s.c !== 'miss' && <circle r="9" fill="#10222F" />}
          </g>
        </g>
      ))}
    </svg>
  )
}

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <aside className="auth-brand">
        <Logo />
        <div className="auth-copy">
          <h2>Every litre, every day, accounted for.</h2>
          <p>Record morning and evening milk, log payments, and see your balance for the month at a glance.</p>
        </div>
        <RouteArt />
      </aside>

      <main className="auth-panel">
        <div className="auth-mobile-logo">
          <LogoMark />
        </div>
        {children}
      </main>
    </div>
  )
}
