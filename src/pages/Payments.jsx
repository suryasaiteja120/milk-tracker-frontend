import { useMemo } from 'react'
import { CircleAlert, Pencil, Plus, RefreshCw, Trash2, Wallet } from 'lucide-react'
import Money from '../components/Money'
import { useData, useEditors } from '../context/contexts'
import { matchesQuery, monthLabel, paymentSearchText, parseDate } from '../lib/format'

export default function Payments() {
  const { payments, dashboard, period, query, initialLoading, error, reload, fetching } = useData()
  const editors = useEditors()

  const rows = useMemo(() => payments.filter((p) => matchesQuery(query, paymentSearchText(p))), [payments, query])

  if (initialLoading) {
    return <div className="skeleton" style={{ height: 420, borderRadius: 20 }} aria-busy="true" aria-label="Loading payments" />
  }

  if (error) {
    return (
      <div className="card empty empty-page" role="alert">
        <span className="empty-icon tone-danger"><CircleAlert size={24} strokeWidth={1.6} /></span>
        <strong>We couldn't load your payments</strong>
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={reload}>
          <RefreshCw size={17} strokeWidth={1.75} /> Try again
        </button>
      </div>
    )
  }

  const due = Number(dashboard?.balanceDue) || 0
  const advance = Number(dashboard?.advancePaid) || 0
  const month = `${monthLabel(period.month, period.year)} ${period.year}`

  return (
    <div className={`list-page ${fetching ? 'is-fetching' : ''}`}>
      <div className="page-actions">
        <button type="button" className="btn btn-primary" onClick={() => editors.addPayment()}>
          <Plus size={18} strokeWidth={1.75} /> Record payment
        </button>
      </div>

      <div className="summary-strip">
        <div className="card summary"><span>Spent</span><strong><Money value={dashboard?.totalSpending} /></strong></div>
        <div className="card summary"><span>Paid</span><strong><Money value={dashboard?.totalPaid} /></strong></div>
        <div className="card summary">
          <span>{due > 0 ? 'Balance due' : advance > 0 ? 'Advance paid' : 'All settled'}</span>
          <strong className={due > 0 ? 'amount-due' : 'amount-ok'}><Money value={due > 0 ? due : advance} /></strong>
        </div>
      </div>

      <section className="card table-card" aria-label={`Payments for ${month}`}>
        {rows.length === 0 ? (
          <div className="empty">
            <span className="empty-icon"><Wallet size={24} strokeWidth={1.6} /></span>
            <strong>{query ? 'No payments match' : `No payments in ${month}`}</strong>
            <p>{query ? 'Clear the search to see all payments this month.' : 'Record a payment when you settle up for your milk.'}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col" className="num">Amount</th>
                <th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td data-label="Date">
                    {parseDate(p.paymentDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td data-label="Amount" className="num amount amount-ok"><Money value={p.amount} /></td>
                  <td className="actions">
                    <span className="row-actions is-visible">
                      <button type="button" className="icon-btn icon-btn-sm" onClick={() => editors.editPayment(p)} aria-label="Edit payment">
                        <Pencil size={15} strokeWidth={1.75} />
                      </button>
                      <button type="button" className="icon-btn icon-btn-sm icon-btn-danger" onClick={() => editors.askDelete('payment', p)} aria-label="Delete payment">
                        <Trash2 size={15} strokeWidth={1.75} />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
