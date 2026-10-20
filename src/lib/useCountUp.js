import { useEffect, useRef, useState } from 'react'

/**
 * Eases a number from its previous value to `target` (ease-out cubic).
 * Jumps straight to the target for people who prefer reduced motion.
 */
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    const start = from.current
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    let frame

    const tick = (now) => {
      const p = reduce ? 1 : Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const next = start + (target - start) * eased
      from.current = next
      setValue(next)
      if (p < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
