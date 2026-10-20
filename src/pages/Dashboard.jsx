import { useMemo } from 'react'
import { CircleAlert, Plus, RefreshCw, Wallet } from 'lucide-react'
import StatCards from '../components/StatCards'
import RouteMap from '../components/RouteMap'
import DailyChart from '../components/DailyChart'
import BalanceCard from '../components/BalanceCard'
import PurchaseTimeline from '../components/PurchaseTimeline'
import PaymentList from '../components/PaymentList'
import { useData, useEditors } from '../context/contexts'
import { matchesQuery, paymentSearchText, purchaseSearchText, todayParts } from '../lib/format'
import { buildDays } from '../lib/stats'

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading your dashboard">
      <div className="stats">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 150, borderRadius: 20 }} />
        ))}
      </div>
      <div className="dash-grid">
        <div className="dash-main">
          <div className="skeleton" style={{ height: 560, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
        </div>
        <div className="dash-side">
          <div className="skeleton" style={{ height: 250, borderRadius: 20 }} />
          <div className="skeleton" style={{ height: 380, borderRadius: 20 }} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { period, dashboard, purchases, payments, initialLoading, error, reload, fetching, query } = useData()
  const editors = useEditors()
  const { year: ty, month: tm, day: td } = todayParts()

  const days = useMemo(
    () => buildDays(purchases, period.month, period.year, { year: ty, month: tm, day: td }),
    [purchases, period.month, period.year, ty, tm, td],
  )

  const searching = query.trim().length > 0
  const visiblePurchases = useMemo(() => purchases.filter((p) => matchesQuery(query, purchaseSearchText(p))), [purchases, query])
  const visiblePayments = useMemo(() => payments.filter((p) => matchesQuery(query, paymentSearchText(p))), [payments, query])

  if (initialLoading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="card empty empty-page" role="alert">
        <span className="empty-icon tone-danger">
          <CircleAlert size={24} strokeWidth={1.6} />
        </span>
        <strong>We couldn't load your dashboard</strong>
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={reload}>
          <RefreshCw size={17} strokeWidth={1.75} /> Try again
        </button>
      </div>
    )
  }

  return (
    <div className={`dash ${fetching ? 'is-fetching' : ''}`}>
      <div className="page-actions">
        <button type="button" className="btn btn-quiet" onClick={() => editors.addPayment()}>
          <Wallet size={18} strokeWidth={1.6} /> Record payment
        </button>
        <button type="button" className="btn btn-primary" onClick={() => editors.addPurchase()}>
          <Plus size={18} strokeWidth={1.75} /> Add milk
        </button>
      </div>

      <StatCards dashboard={dashboard} days={days} />

      <div className="dash-grid">
        <div className="dash-main">
          <RouteMap
            key={`${period.year}-${period.month}`}
            days={days}
            month={period.month}
            year={period.year}
            onAdd={editors.addPurchase}
            onEdit={editors.editPurchase}
          />
          <DailyChart days={days} />
        </div>

        <div className="dash-side">
          <BalanceCard dashboard={dashboard} month={period.month} year={period.year} />
          <PurchaseTimeline purchases={visiblePurchases} total={visiblePurchases.length} searching={searching} />
          <PaymentList payments={visiblePayments} searching={searching} />
        </div>
      </div>
    </div>
  )
}
