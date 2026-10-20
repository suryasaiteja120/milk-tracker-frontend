import { parseDate, sessionOf } from './format'

/**
 * Turns a month of purchases into one record per calendar day.
 * status: delivered | missed | pending (today, nothing yet) | future
 */
export function buildDays(purchases, month, year, today) {
  const total = new Date(year, month, 0).getDate()
  const byDay = {}

  purchases.forEach((p) => {
    const d = parseDate(p.purchaseDate)
    if (d.getMonth() + 1 !== month || d.getFullYear() !== year) return
    const day = d.getDate()
    const entry = (byDay[day] ??= { morning: [], evening: [], litres: 0, amount: 0 })
    entry[sessionOf(p) === 'EVENING' ? 'evening' : 'morning'].push(p)
    entry.litres += Number(p.quantity) || 0
    entry.amount += Number(p.totalAmount) || 0
  })

  const relation = (year - today.year) * 12 + (month - today.month) // <0 past, 0 now, >0 future
  const elapsed = relation < 0 ? total : relation === 0 ? today.day : 0

  return Array.from({ length: total }, (_, i) => {
    const day = i + 1
    const entry = byDay[day]
    let status = 'future'
    if (entry) status = 'delivered'
    else if (relation === 0 && day === today.day) status = 'pending'
    else if (day <= elapsed) status = 'missed'
    return {
      day,
      status,
      isToday: relation === 0 && day === today.day,
      isPast: day <= elapsed,
      morning: entry?.morning ?? [],
      evening: entry?.evening ?? [],
      litres: entry?.litres ?? 0,
      amount: entry?.amount ?? 0,
    }
  })
}

export function routeSummary(days) {
  let streak = 0
  let best = 0
  let missed = 0
  days.forEach((d) => {
    if (d.status === 'delivered') {
      streak += 1
      best = Math.max(best, streak)
    } else {
      streak = 0
    }
    if (d.status === 'missed') missed += 1
  })
  return { longestStreak: best, missedDays: missed }
}
