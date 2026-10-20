import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '../context/contexts'
import { monthLabel, todayParts } from '../lib/format'

export default function MonthSwitcher() {
  const { period, shiftMonth, goToToday } = useData()
  const today = todayParts()
  const isCurrent = period.month === today.month && period.year === today.year

  return (
    <div className="month-switcher" role="group" aria-label="Choose month">
      <button type="button" className="icon-btn icon-btn-sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
        <ChevronLeft size={18} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className="month-switcher-label"
        onClick={goToToday}
        disabled={isCurrent}
        title={isCurrent ? 'Showing the current month' : 'Jump to this month'}
      >
        {monthLabel(period.month, period.year)} {period.year}
      </button>
      <button type="button" className="icon-btn icon-btn-sm" onClick={() => shiftMonth(1)} aria-label="Next month">
        <ChevronRight size={18} strokeWidth={1.75} />
      </button>
    </div>
  )
}
