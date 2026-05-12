/** Returns today's date in local timezone as YYYY-MM-DD */
export function today(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Formats a YYYY-MM-DD string as MM/DD/YYYY for display */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  const [y, m, d] = parts
  return `${m}/${d}/${y}`
}

/** Returns number of days since a YYYY-MM-DD date (using local timezone) */
export function daysSince(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  const entered = new Date(y, m - 1, d).getTime()
  const todayMs = new Date().setHours(0, 0, 0, 0)
  return Math.max(0, Math.floor((todayMs - entered) / 86400000))
}

/** Formats a YYYY-MM-DD string as "May 12, 2026" */
export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Formats a YYYY-MM-DD string as "May 12" */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Converts a display date MM/DD/YYYY to ISO YYYY-MM-DD */
export function parseDisplayDate(display: string): string | null {
  const parts = display.split('/')
  if (parts.length !== 3) return null
  const [m, d, y] = parts
  if (!m || !d || !y) return null
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}
