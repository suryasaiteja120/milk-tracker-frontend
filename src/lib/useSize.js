import { useLayoutEffect, useRef, useState } from 'react'

/** Measures an element's width so SVG visuals can lay themselves out for it. */
export function useWidth(fallback = 720) {
  const ref = useRef(null)
  const [width, setWidth] = useState(fallback)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width) || fallback)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [fallback])

  return [ref, width]
}
