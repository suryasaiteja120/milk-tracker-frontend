import { useMemo, useState } from 'react'
import { CircleAlert, Milk, Pencil, Plus, RefreshCw, Sunrise, Sunset, Trash2 } from 'lucide-react'
import Money from '../components/Money'
import { useData, useEditors } from '../context/contexts'
import { litres, matchesQuery, monthLabel, parseDate, purchaseSearchText, sessionOf } from '../lib/format'

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'MORNING', label: 'Morning' },
  { id: 'EVENING', label: 'Evening' },
]

export default function Purchases() {
  const { purchases, period, query, initialLoading, error, reload, fetching } = useData()
  const editors = useEditors()
  const [filter, setFilter] = useState('ALL')

  const rows = useMemo(
    () =>
      purchases.filter((p) => (filter === 'ALL' || sessionOf(p) === filter) && matchesQuery(query, purchaseSearchText(p))),
    [purchases, filter, query],
  )

  const totals = useMemo(
    () => ({
      count: rows.length,
      litres: rows.reduce((s, p) => s + (Number(p.quantity) || 0), 0),
      amount: rows.reduce((s, p) => s + (Number(p.totalAmount) || 0), 0),
    }),
    [rows],
  )

  if (initialLoading) {
    return <div className="skeleton" style={{ height: 420, borderRadius: 20 }} aria-busy="true" aria-label="Loading purchases" />
  }

  if (error) {
    return (
      <div className="card empty empty-page" role="alert">
        <span className="empty-icon tone-danger"><CircleAlert size={24} strokeWidth={1.6} /></span>
        <strong>We couldn't load your purchases</strong>
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={reload}>
          <RefreshCw size={17} strokeWidth={1.75} /> Try again
        </button>
      </div>
    )
  }

  const month = `${monthLabel(period.month, period.year)} ${period.year}`

  return (
    <div className={`list-page ${fetching ? 'is-fetching' : ''}`}>
      <div className="page-actions page-actions-split">
        <div className="segmented" role="group" aria-label="Filter by session">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className="segment" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => editors.addPurchase()}>
          <Plus size={18} strokeWidth={1.75} /> Add milk
        </button>
      </div>

      <div className="summary-strip">
        <div className="card summary"><span>Purchases</span><strong>{totals.count}</strong></div>
        <div className="card summary"><span>Milk</span><strong>{litres(totals.litres)} <small>L</small></strong></div>
        <div className="card summary"><span>Amount</span><strong><Money value={totals.amount} /></strong></div>
      </div>

      <section className="card table-card" aria-label={`Milk purchases for ${month}`}>
        {rows.length === 0 ? (
          <div className="empty">
            <span className="empty-icon"><Milk size={24} strokeWidth={1.6} /></span>
            <strong>{query || filter !== 'ALL' ? 'No purchases match' : `No milk recorded in ${month}`}</strong>
            <p>{query || filter !== 'ALL' ? 'Clear the search or filter to see everything this month.' : 'Add a purchase to start tracking this month.'}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Session</th>
                <th scope="col" className="num">Quantity</th>
                <th scope="col" className="num">Rate</th>
                <th scope="col" className="num">Amount</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const evening = sessionOf(p) === 'EVENING'
                return (
                  <tr key={p.id}>
                    <td data-label="Date">
                      {parseDate(p.purchaseDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td data-label="Session">
                      <span className={`chip ${evening ? 'chip-evening' : 'chip-morning'}`}>
                        {evening ? <Sunset size={14} strokeWidth={1.75} /> : <Sunrise size={14} strokeWidth={1.75} />}
                        {evening ? 'Evening' : 'Morning'}
                      </span>
                    </td>
                    <td data-label="Quantity" className="num">{litres(p.quantity)} L</td>
                    <td data-label="Rate" className="num"><Money value={p.pricePerLiter} />/L</td>
                    <td data-label="Amount" className="num amount"><Money value={p.totalAmount} /></td>
                    <td className="actions">
                      <span className="row-actions is-visible">
                        <button type="button" className="icon-btn icon-btn-sm" onClick={() => editors.editPurchase(p)} aria-label="Edit purchase">
                          <Pencil size={15} strokeWidth={1.75} />
                        </button>
                        <button type="button" className="icon-btn icon-btn-sm icon-btn-danger" onClick={() => editors.askDelete('purchase', p)} aria-label="Delete purchase">
                          <Trash2 size={15} strokeWidth={1.75} />
                        </button>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
