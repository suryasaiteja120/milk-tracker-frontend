import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Accessible dialog / side drawer: portal, Esc to close, focus trap,
 * scroll lock and focus restore. Click on the dim backdrop closes it.
 */
export default function Modal({ open, onClose, labelledBy, label, variant = 'dialog', children }) {
  const panelRef = useRef(null)
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return undefined
    const panel = panelRef.current
    const previouslyFocused = document.activeElement
    const items = () => [...panel.querySelectorAll(FOCUSABLE)].filter((el) => !el.disabled && el.offsetParent !== null)

    const first = panel.querySelector('[data-autofocus]') ?? items()[0] ?? panel
    first.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const list = items()
      if (!list.length) return
      const head = list[0]
      const tail = list[list.length - 1]
      if (event.shiftKey && document.activeElement === head) {
        event.preventDefault()
        tail.focus()
      } else if (!event.shiftKey && document.activeElement === tail) {
        event.preventDefault()
        head.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={`overlay ${variant === 'drawer' ? 'overlay-drawer' : 'overlay-center'}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={variant === 'drawer' ? 'drawer' : 'dialog'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={label}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
