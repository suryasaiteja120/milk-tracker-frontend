import { litres } from '../lib/format'
import { useWidth } from '../lib/useSize'

const HEIGHT = 230
const PAD = { top: 16, right: 12, bottom: 30, left: 38 }
const STEPS = [0.5, 1, 2, 5, 10, 20, 50, 100]

function niceScale(max) {
  const step = STEPS.find((s) => max / s <= 4) ?? 100
  const top = Math.max(step, Math.ceil(max / step) * step)
  return { step, top }
}

/** Stacked bars: litres per day, morning at the bottom and evening on top. */
export default function DailyChart({ days }) {
  const [ref, width] = useWidth(720)
  const maxLitres = Math.max(0, ...days.map((d) => d.litres))
  const { step, top } = niceScale(maxLitres || 1)

  const plotW = width - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const slot = plotW / days.length
  const barW = Math.max(3, Math.min(22, slot * 0.62))
  const y = (value) => PAD.top + plotH - (value / top) * plotH

  const delivered = days.filter((d) => d.status === 'delivered')
  const average = delivered.length ? delivered.reduce((sum, d) => sum + d.litres, 0) / delivered.length : 0
  const labelEvery = Math.ceil(days.length / Math.max(4, Math.floor(plotW / 44)))
  const ticks = []
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v)

  return (
    <section className="card chart-card" aria-labelledby="chart-title">
      <div className="card-head">
        <div>
          <h2 className="card-title" id="chart-title">Daily litres</h2>
          <p className="card-sub">
            {delivered.length ? `Average ${litres(average)} L on days with milk` : 'Nothing recorded yet this month'}
          </p>
        </div>
        <ul className="legend legend-inline" aria-label="Chart legend">
          <li><i className="dot dot-morning" /> Morning</li>
          <li><i className="dot dot-evening" /> Evening</li>
        </ul>
      </div>

      <div className="chart-canvas" ref={ref}>
        <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label="Bar chart of litres bought each day">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} className="chart-grid" />
              <text x={PAD.left - 10} y={y(v)} className="chart-axis" textAnchor="end" dominantBaseline="middle">
                {litres(v)}
              </text>
            </g>
          ))}

          {days.map((d, i) => {
            const x = PAD.left + slot * i + (slot - barW) / 2
            const morning = d.morning.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
            const evening = d.evening.reduce((s, p) => s + (Number(p.quantity) || 0), 0)
            const hM = (morning / top) * plotH
            const hE = (evening / top) * plotH
            return (
              <g key={d.day} className="chart-bar">
                <title>{`Day ${d.day}: ${litres(d.litres)} L`}</title>
                <rect x={x} y={PAD.top} width={barW} height={plotH} className="chart-hit" />
                {hM > 0 && <rect x={x} y={y(0) - hM} width={barW} height={hM} rx="3" className="fill-morning bar-grow" style={{ '--i': i }} />}
                {hE > 0 && <rect x={x} y={y(0) - hM - hE - (hM > 0 ? 2 : 0)} width={barW} height={hE} rx="3" className="fill-evening bar-grow" style={{ '--i': i + 4 }} />}
                {hM === 0 && hE === 0 && d.isPast && <rect x={x} y={y(0) - 2} width={barW} height="2" rx="1" className="chart-none" />}
                {(i % labelEvery === 0 || d.day === days.length) && (
                  <text x={x + barW / 2} y={HEIGHT - 8} className={`chart-axis ${d.isToday ? 'is-today' : ''}`} textAnchor="middle">
                    {d.day}
                  </text>
                )}
              </g>
            )
          })}

          {average > 0 && (
            <line x1={PAD.left} x2={width - PAD.right} y1={y(average)} y2={y(average)} className="chart-average">
              <title>{`Average ${litres(average)} L`}</title>
            </line>
          )}
        </svg>
      </div>
    </section>
  )
}
