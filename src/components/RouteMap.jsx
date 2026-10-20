import { useMemo, useState } from 'react'
import { Flame, Pencil, Plus, Route, Sunrise, Sunset } from 'lucide-react'
import Money from './Money'
import { litres, longDate, monthLabel, toISO } from '../lib/format'
import { routeSummary } from '../lib/stats'
import { useWidth } from '../lib/useSize'

/**
 * The "month route": every day of the month is a stop on a winding path.
 * Stops are coloured by session (morning / evening / both), missed days are
 * dashed, and the day you pick shows its details underneath.
 */
export default function RouteMap({ days, month, year, onAdd, onEdit }) {
  const [canvasRef, width] = useWidth(720)
  const [selected, setSelected] = useState(() => days.find((d) => d.isToday)?.day ?? null)

  const { longestStreak, missedDays } = useMemo(() => routeSummary(days), [days])

  const compact = width < 560
  const cols = compact ? 5 : 7
  const padX = compact ? 30 : 48
  const padY = 44
  const gapY = compact ? 68 : 82
  const gapX = (width - padX * 2) / (cols - 1)
  const radius = Math.min(19, gapX * 0.3)
  const rows = Math.ceil(days.length / cols)
  const height = padY * 2 + (rows - 1) * gapY

  const stops = days.map((d, i) => {
    const row = Math.floor(i / cols)
    const c = i % cols
    const col = row % 2 === 0 ? c : cols - 1 - c
    return { ...d, row, x: padX + col * gapX, y: padY + row * gapY }
  })

  const segments = stops.slice(0, -1).map((from, i) => {
    const to = stops[i + 1]
    let path
    if (from.row === to.row) {
      path = `M${from.x} ${from.y}L${to.x} ${to.y}`
    } else {
      const dir = from.row % 2 === 0 ? 1 : -1
      const bulge = Math.min(gapX * 0.5, 54) * dir
      path = `M${from.x} ${from.y}C${from.x + bulge} ${from.y} ${to.x + bulge} ${to.y} ${to.x} ${to.y}`
    }
    return { path, travelled: to.isPast, key: from.day, index: i }
  })

  const active = days.find((d) => d.day === selected) ?? null
  const dateISO = active ? toISO(year, month, active.day) : ''

  const nodeLabel = (d) => {
    const parts = [`${monthLabel(month, year)} ${d.day}`]
    if (d.status === 'delivered') parts.push(`${litres(d.litres)} litres`, `₹${d.amount}`)
    else if (d.status === 'missed') parts.push('no milk recorded')
    else if (d.status === 'pending') parts.push('today, nothing recorded yet')
    else parts.push('upcoming')
    return parts.join(', ')
  }

  const onKey = (event, day) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setSelected(day)
    }
  }

  return (
    <section className="card route-card" aria-labelledby="route-title">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="route-title">
            {monthLabel(month, year)} route
          </h2>
          <p className="card-sub">Each stop is a day. Select one to see or add its milk.</p>
        </div>
        <div className="route-facts">
          <span className="chip chip-ok" title="Longest run of consecutive days with milk">
            <Flame size={15} strokeWidth={1.75} /> {longestStreak}-day streak
          </span>
          <span className={`chip ${missedDays ? 'chip-missed' : 'chip-ok'}`}>
            <Route size={15} strokeWidth={1.75} /> {missedDays ? `${missedDays} missed` : 'No missed days'}
          </span>
        </div>
      </div>

      <ul className="legend" aria-label="Legend">
        <li><i className="dot dot-morning" /> Morning</li>
        <li><i className="dot dot-evening" /> Evening</li>
        <li><i className="dot dot-both" /> Both</li>
        <li><i className="dot dot-missed" /> Missed</li>
        <li><i className="dot dot-future" /> Upcoming</li>
      </ul>

      <div className="route-canvas" ref={canvasRef}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`Milk route for ${monthLabel(month, year)} ${year}`}>
          {segments.map((s) => (
            <path key={s.key} d={s.path} pathLength={s.travelled ? 100 : undefined} style={{ '--i': s.index }} className={`route-line ${s.travelled ? 'is-travelled' : ''}`} />
          ))}

          {stops.map((d, index) => {
            const hasMorning = d.morning.length > 0
            const hasEvening = d.evening.length > 0
            const isSelected = selected === d.day
            const r = radius
            const hub = r * 0.62
            return (
              <g
                key={d.day}
                className={`route-node status-${d.status} ${isSelected ? 'is-selected' : ''}`}
                transform={`translate(${d.x} ${d.y})`}
                role="button"
                tabIndex={0}
                aria-label={nodeLabel(d)}
                aria-pressed={isSelected}
                onClick={() => setSelected(d.day)}
                onKeyDown={(e) => onKey(e, d.day)}
              >
                <circle r={r + 8} className="node-hit" />
                {d.isToday && <circle r={r + 7} className="node-today" />}
                {isSelected && <circle r={r + 4} className="node-selected" />}

                <g className="node-pop" style={{ '--i': index }}>
                {d.status === 'delivered' ? (
                  hasMorning && hasEvening ? (
                    <>
                      <path d={`M0 ${-r}A${r} ${r} 0 0 0 0 ${r}Z`} className="fill-morning" />
                      <path d={`M0 ${-r}A${r} ${r} 0 0 1 0 ${r}Z`} className="fill-evening" />
                    </>
                  ) : (
                    <circle r={r} className={hasMorning ? 'fill-morning' : 'fill-evening'} />
                  )
                ) : (
                  <circle r={r} className="node-empty" />
                )}

                {d.status === 'delivered' && <circle r={hub} className="node-hub" />}
                <text className="node-text" y="0.5" textAnchor="middle" dominantBaseline="middle">
                  {d.day}
                </text>
                </g>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="day-detail" aria-live="polite">
        {!active ? (
          <p className="day-detail-hint">Select a stop on the route to see what was recorded that day.</p>
        ) : (
          <div className="day-detail-swap" key={active.day}>
            <div className="day-detail-head">
              <div>
                <strong>{longDate(dateISO)}</strong>
                <span className={`chip ${active.status === 'delivered' ? 'chip-ok' : active.status === 'missed' ? 'chip-missed' : ''}`}>
                  {{ delivered: 'Milk recorded', missed: 'Missed', pending: 'Today — nothing yet', future: 'Upcoming' }[active.status]}
                </span>
              </div>
              {active.status === 'delivered' && (
                <span className="day-detail-total">
                  {litres(active.litres)} L · <Money value={active.amount} />
                </span>
              )}
            </div>

            <div className="day-sessions">
              {[
                { key: 'MORNING', label: 'Morning', Icon: Sunrise, items: active.morning, tone: 'morning' },
                { key: 'EVENING', label: 'Evening', Icon: Sunset, items: active.evening, tone: 'evening' },
              ].map(({ key, label, Icon, items, tone }) => (
                <div key={key} className={`day-session tone-${tone}`}>
                  <span className="day-session-icon">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <div className="day-session-main">
                    <small>{label}</small>
                    {items.length === 0 ? (
                      <span className="muted">Not recorded</span>
                    ) : (
                      items.map((p) => (
                        <span key={p.id}>
                          {litres(p.quantity)} L × <Money value={p.pricePerLiter} /> = <Money value={p.totalAmount} />
                        </span>
                      ))
                    )}
                  </div>
                  {items.length === 0 ? (
                    <button type="button" className="btn btn-quiet btn-sm" onClick={() => onAdd({ date: dateISO, session: key })}>
                      <Plus size={16} strokeWidth={1.75} /> Add
                    </button>
                  ) : (
                    <button type="button" className="icon-btn icon-btn-sm" onClick={() => onEdit(items[0])} aria-label={`Edit ${label.toLowerCase()} purchase`}>
                      <Pencil size={15} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
