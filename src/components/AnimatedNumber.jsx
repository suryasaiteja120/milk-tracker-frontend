import { useCountUp } from '../lib/useCountUp'
import { litres, money } from '../lib/format'

/** A number that counts up. kind: 'money' | 'litres' | 'int'. */
export default function AnimatedNumber({ value, kind = 'int' }) {
  const target = Number(value) || 0
  const current = useCountUp(target)
  const done = Math.abs(current - target) < 0.005
  const shown = done ? target : current

  if (kind === 'money') {
    return (
      <>
        <span className="rupee">₹</span>
        {money(shown)}
      </>
    )
  }
  if (kind === 'litres') return <>{litres(shown)}</>
  return <>{Math.round(shown).toLocaleString('en-IN')}</>
}
