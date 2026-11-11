/** Today's date in the local timezone as YYYY-MM-DD */
export function today(): string {
  return toIso(new Date())
}

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole days from a YYYY-MM-DD date until today (local time, never negative) */
export function daysSince(iso: string, now: Date = new Date()): number {
  const start = parseIso(iso).getTime()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.max(0, Math.round((end - start) / 86400000))
}

/** "04/22/2026" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  return `${parts[1]}/${parts[2]}/${parts[0]}`
}

/** "April 22, 2026" */
export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return ''
  return parseIso(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/** Note times: ISO timestamps become "May 10, 2026 at 4:48 PM"; older free-text values pass through. */
export function formatNoteTime(when: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T/.test(when)) return when
  const d = new Date(when)
  if (isNaN(d.getTime())) return when
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date} at ${time}`
}

/** "today", "yesterday", "5 days ago" for a full ISO timestamp */
export function formatAgo(isoTimestamp: string | null, now: Date = new Date()): string {
  if (!isoTimestamp) return 'never'
  const d = new Date(isoTimestamp)
  if (isNaN(d.getTime())) return 'never'
  const days = daysSince(toIso(d), now)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}
