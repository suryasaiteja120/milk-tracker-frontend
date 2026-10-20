import { CalendarCheck2, Droplets, ReceiptIndianRupee, Wallet } from 'lucide-react'
import AnimatedNumber from './AnimatedNumber'
import { litres } from '../lib/format'

function Stat({ icon: Icon, tone, label, children, foot }) {
  return (
    <div className="card stat">
      <div className="stat-top">
        <span className={`stat-icon tone-${tone}`}>
          <Icon size={20} strokeWidth={1.6} />
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">{children}</div>
      <p className="stat-foot">{foot}</p>
    </div>
  )
}

export default function StatCards({ dashboard, days }) {
  const totalLitres = Number(dashboard.totalLitres) || 0
  const spending = Number(dashboard.totalSpending) || 0
  const paid = Number(dashboard.totalPaid) || 0
  const delivered = Number(dashboard.daysPurchased) || 0
  const missed = days.filter((d) => d.status === 'missed').length
  const left = days.filter((d) => d.status === 'future' || d.status === 'pending').length

  return (
    <div className="stats">
      <Stat
        icon={Droplets}
        tone="accent"
        label="Total milk"
        foot={delivered ? `${litres(totalLitres / delivered)} L on an average day` : 'No milk recorded yet'}
      >
        <AnimatedNumber value={totalLitres} kind="litres" />
        <small>L</small>
      </Stat>

      <Stat
        icon={CalendarCheck2}
        tone="morning"
        label="Days with milk"
        foot={missed ? `${missed} ${missed === 1 ? 'day' : 'days'} missed so far` : left ? `${left} ${left === 1 ? 'day' : 'days'} still to go` : 'Every day covered'}
      >
        <AnimatedNumber value={delivered} />
        <small>of {days.length}</small>
      </Stat>

      <Stat
        icon={ReceiptIndianRupee}
        tone="evening"
        label="Total spending"
        foot={totalLitres ? `₹${(spending / totalLitres).toLocaleString('en-IN', { maximumFractionDigits: 2 })} per litre on average` : 'Nothing spent yet'}
      >
        <AnimatedNumber value={spending} kind="money" />
      </Stat>

      <Stat
        icon={Wallet}
        tone="ok"
        label="Total paid"
        foot={spending ? `${Math.min(100, Math.round((paid / spending) * 100))}% of this month's spending` : 'No spending to pay yet'}
      >
        <AnimatedNumber value={paid} kind="money" />
      </Stat>
    </div>
  )
}
