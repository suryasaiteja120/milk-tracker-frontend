import { Milk, Pencil, Plus, Sunrise, Sunset, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Money from './Money'
import { useEditors } from '../context/contexts'
import { litres, parseDate, sessionOf } from '../lib/format'

export function PurchaseStop({ purchase }) {
  const editors = useEditors()
  const evening = sessionOf(purchase) === 'EVENING'
  const date = parseDate(purchase.purchaseDate)
  const Icon = evening ? Sunset : Sunrise

  return (
    <li className={`stop ${evening ? 'tone-evening' : 'tone-morning'}`}>
      <span className="stop-dot">
        <Icon size={15} strokeWidth={1.75} />
      </span>
      <div className="stop-main">
        <strong>
          {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </strong>
        <span className="stop-meta">
          {evening ? 'Evening' : 'Morning'} · {litres(purchase.quantity)} L × <Money value={purchase.pricePerLiter} />
        </span>
      </div>
      <div className="stop-side">
        <span className="stop-amount">
          <Money value={purchase.totalAmount} />
        </span>
        <span className="row-actions">
          <button type="button" className="icon-btn icon-btn-sm" onClick={() => editors.editPurchase(purchase)} aria-label="Edit purchase">
            <Pencil size={15} strokeWidth={1.75} />
          </button>
          <button type="button" className="icon-btn icon-btn-sm icon-btn-danger" onClick={() => editors.askDelete('purchase', purchase)} aria-label="Delete purchase">
            <Trash2 size={15} strokeWidth={1.75} />
          </button>
        </span>
      </div>
    </li>
  )
}

export default function PurchaseTimeline({ purchases, total, searching }) {
  const editors = useEditors()
  const shown = purchases.slice(0, 5)

  return (
    <section className="card panel" aria-labelledby="recent-purchases">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="recent-purchases">Recent stops</h2>
          <p className="card-sub">Latest milk purchases</p>
        </div>
        <Link to="/purchases" className="btn btn-quiet btn-sm">
          View all
        </Link>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">
            <Milk size={24} strokeWidth={1.6} />
          </span>
          <strong>{searching ? 'No matching purchases' : 'No milk recorded this month'}</strong>
          <p>{searching ? 'Try a different date, session or amount.' : 'Add your first purchase and it will appear on the route.'}</p>
          {!searching && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => editors.addPurchase()}>
              <Plus size={16} strokeWidth={1.75} /> Add milk
            </button>
          )}
        </div>
      ) : (
        <>
          <ol className="stops">
            {shown.map((p) => (
              <PurchaseStop key={p.id} purchase={p} />
            ))}
          </ol>
          {total > shown.length && <p className="panel-foot">Showing {shown.length} of {total} purchases</p>}
        </>
      )}
    </section>
  )
}
