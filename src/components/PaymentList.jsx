import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2, Wallet } from 'lucide-react'
import Money from './Money'
import { useEditors } from '../context/contexts'
import { shortDate } from '../lib/format'

export function PaymentRow({ payment }) {
  const editors = useEditors()
  return (
    <li className="payment-row">
      <span className="payment-icon">
        <Wallet size={18} strokeWidth={1.6} />
      </span>
      <div className="stop-main">
        <strong>Payment received</strong>
        <span className="stop-meta">{shortDate(payment.paymentDate)}</span>
      </div>
      <div className="stop-side">
        <span className="stop-amount amount-ok">
          <Money value={payment.amount} />
        </span>
        <span className="row-actions">
          <button type="button" className="icon-btn icon-btn-sm" onClick={() => editors.editPayment(payment)} aria-label="Edit payment">
            <Pencil size={15} strokeWidth={1.75} />
          </button>
          <button type="button" className="icon-btn icon-btn-sm icon-btn-danger" onClick={() => editors.askDelete('payment', payment)} aria-label="Delete payment">
            <Trash2 size={15} strokeWidth={1.75} />
          </button>
        </span>
      </div>
    </li>
  )
}

export default function PaymentList({ payments, searching }) {
  const editors = useEditors()
  const shown = payments.slice(0, 4)

  return (
    <section className="card panel" aria-labelledby="recent-payments">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="recent-payments">Payments</h2>
          <p className="card-sub">Money paid this month</p>
        </div>
        <Link to="/payments" className="btn btn-quiet btn-sm">
          View all
        </Link>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">
            <Wallet size={24} strokeWidth={1.6} />
          </span>
          <strong>{searching ? 'No matching payments' : 'No payments yet'}</strong>
          <p>{searching ? 'Try a different date or amount.' : 'Record a payment when you settle up for your milk.'}</p>
          {!searching && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => editors.addPayment()}>
              <Plus size={16} strokeWidth={1.75} /> Record payment
            </button>
          )}
        </div>
      ) : (
        <ul className="payment-list">
          {shown.map((p) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </ul>
      )}
    </section>
  )
}
