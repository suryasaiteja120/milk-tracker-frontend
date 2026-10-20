const pad = (n) => String(n).padStart(2, '0')

/** Indian-style grouping, hides ".00". */
export function money(value) {
  const n = Number(value) || 0
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

export function litres(value) {
  return (Number(value) || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

/** Parse "YYYY-MM-DD" as a *local* date (avoids the UTC off-by-one bug). */
export function parseDate(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function toISO(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`
}

export function todayParts() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(), hour: d.getHours() }
}

export function todayISO() {
  const t = todayParts()
  return toISO(t.year, t.month, t.day)
}

export function monthLabel(month, year, style = 'long') {
  return new Date(year, month - 1, 1).toLocaleString('en-US', { month: style })
}

export function longDate(iso) {
  return parseDate(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function shortDate(iso) {
  return parseDate(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function greeting() {
  const h = todayParts().hour
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function sessionOf(purchase) {
  return purchase?.session === 'EVENING' ? 'EVENING' : 'MORNING'
}

export function sortPurchases(list) {
  return [...list].sort((a, b) => {
    if (a.purchaseDate !== b.purchaseDate) return a.purchaseDate < b.purchaseDate ? 1 : -1
    // Evening before morning when sorting newest first
    return sessionOf(a) === sessionOf(b) ? 0 : sessionOf(a) === 'EVENING' ? -1 : 1
  })
}

export function sortPayments(list) {
  return [...list].sort((a, b) => (a.paymentDate < b.paymentDate ? 1 : a.paymentDate > b.paymentDate ? -1 : 0))
}

export function matchesQuery(query, parts) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return parts.filter(Boolean).join(' ').toLowerCase().includes(q)
}

export function timeAgo(value) {
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Math.max(0, Date.now() - then) / 1000
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function purchaseSearchText(p) {
  return [p.purchaseDate, longDate(p.purchaseDate), sessionOf(p), sessionOf(p) === 'EVENING' ? 'evening' : 'morning', p.quantity, p.pricePerLiter, p.totalAmount]
}

export function paymentSearchText(p) {
  return [p.paymentDate, longDate(p.paymentDate), 'payment', p.amount]
}
