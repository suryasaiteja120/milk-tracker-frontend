import { Plus } from 'lucide-react'
import Money from './Money'
import AnimatedNumber from './AnimatedNumber'
import { useEditors } from '../context/contexts'
import { monthLabel } from '../lib/format'

export default function BalanceCard({ dashboard, month, year }) {
  const editors = useEditors()
  const due = Number(dashboard.balanceDue) || 0
  const advance = Number(dashboard.advancePaid) || 0
  const spending = Number(dashboard.totalSpending) || 0
  const paid = Number(dashboard.totalPaid) || 0
  const percent = spending ? Math.min(100, Math.round((paid / spending) * 100)) : 0

  const label = due > 0 ? 'Balance due' : advance > 0 ? 'Advance paid' : 'All settled'
  const amount = due > 0 ? due : advance

  return (
    <section className={`balance-card ${due > 0 ? 'is-due' : 'is-clear'}`} aria-label="Balance">
      <div className="balance-top">
        <span>{label}</span>
        <span className="balance-month">{monthLabel(month, year, 'short')} {year}</span>
      </div>

      <div className="balance-amount">
        <AnimatedNumber value={amount} kind="money" />
      </div>

      <div className="balance-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Share of this month's spending paid">
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="balance-meta">
        <span>
          Paid <Money value={paid} />
        </span>
        <span>
          of <Money value={spending} />
        </span>
      </div>

      <button type="button" className="btn btn-light btn-block" onClick={() => editors.addPayment()}>
        <Plus size={18} strokeWidth={1.75} /> Record payment
      </button>
    </section>
  )
}
