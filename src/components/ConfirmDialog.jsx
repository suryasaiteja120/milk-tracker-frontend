import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} labelledBy="confirm-title">
      <div className="dialog-icon">
        <Trash2 size={26} strokeWidth={1.6} />
      </div>
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <div className="dialog-actions">
        <button type="button" className="btn btn-quiet" onClick={onClose} disabled={busy} data-autofocus>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={confirm} disabled={busy}>
          {busy ? <span className="spinner" /> : null}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
