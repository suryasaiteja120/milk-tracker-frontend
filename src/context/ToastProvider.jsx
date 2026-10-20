import { useCallback, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { ToastContext } from './contexts'

const ICONS = { success: CheckCircle2, error: TriangleAlert, info: Info }

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message, type = 'success') => {
      const id = nextId.current++
      setToasts((list) => [...list.slice(-2), { id, message, type }])
      window.setTimeout(() => dismiss(id), 4000)
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" role="status">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] ?? Info
          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              <span>{toast.message}</span>
              <button type="button" className="toast-close" onClick={() => dismiss(toast.id)} aria-label="Dismiss message">
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
