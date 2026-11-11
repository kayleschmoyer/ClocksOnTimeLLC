import type { Note, SortMode, Tab, WaitingListRecord } from '../types'

export interface SearchParams {
  lastName: string
  firstName: string
  dateFrom: string
  dateTo: string
  notCalledOnly: boolean
  includeCompleted: boolean
}

export const EMPTY_SEARCH: SearchParams = {
  lastName: '', firstName: '', dateFrom: '', dateTo: '', notCalledOnly: false, includeCompleted: false,
}

export function isSearchActive(p: SearchParams): boolean {
  return !!(p.lastName.trim() || p.firstName.trim() || p.dateFrom || p.dateTo || p.notCalledOnly || p.includeCompleted)
}

/** Lower-case with accents removed, so "calderon" finds "Calderón". */
export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** Partial matches anywhere in the name; the date range is inclusive at both ends. */
export function matchesSearch(r: WaitingListRecord, p: SearchParams): boolean {
  const last = normalize(p.lastName)
  if (last && !normalize(r.lastName).includes(last)) return false
  const first = normalize(p.firstName)
  if (first && !normalize(r.firstName).includes(first)) return false
  if (p.dateFrom && r.dateEntered < p.dateFrom) return false
  if (p.dateTo && r.dateEntered > p.dateTo) return false
  if (p.notCalledOnly && r.dateCalled) return false
  return true
}

/** Records for a tab. Completed records leave the waiting list but can be included in a search. */
export function recordsForView(records: WaitingListRecord[], tab: Tab, p: SearchParams): WaitingListRecord[] {
  return records.filter(r => {
    if (r.isDeleted) return false
    if (tab === 'completed') { if (r.status !== 'Complete') return false }
    else if (r.status !== 'Active' && !p.includeCompleted) return false
    return matchesSearch(r, tab === 'completed' ? { ...p, notCalledOnly: false } : p)
  })
}

const byName = (a: WaitingListRecord, b: WaitingListRecord) =>
  normalize(a.lastName).localeCompare(normalize(b.lastName)) ||
  normalize(a.firstName).localeCompare(normalize(b.firstName)) ||
  a.number - b.number

const byEntered = (a: WaitingListRecord, b: WaitingListRecord) =>
  a.dateEntered.localeCompare(b.dateEntered) || a.number - b.number

export function sortRecords(records: WaitingListRecord[], mode: SortMode): WaitingListRecord[] {
  const out = [...records]
  switch (mode) {
    case 'number': return out.sort((a, b) => a.number - b.number)
    case 'lastName': return out.sort(byName)
    case 'dateEntered': return out.sort(byEntered)
    case 'dateCalled':
      // Not called yet comes first, oldest entry first; then by the date called.
      return out.sort((a, b) => {
        if (!a.dateCalled && !b.dateCalled) return byEntered(a, b)
        if (!a.dateCalled) return -1
        if (!b.dateCalled) return 1
        return a.dateCalled.localeCompare(b.dateCalled) || byEntered(a, b)
      })
  }
}

export const SORT_LABELS: Record<SortMode, string> = {
  number: 'Number',
  lastName: 'Last name (A to Z)',
  dateEntered: 'Date entered (earliest first)',
  dateCalled: 'Date called (not called first)',
}

export function clockLabel(r: Pick<WaitingListRecord, 'clockType' | 'customClockType'>): string {
  return r.clockType === 'Other' ? (r.customClockType || 'Other') : r.clockType
}

export function parseNotes(json: string): Note[] {
  try {
    const v = JSON.parse(json || '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/** One line describing the search, for the list heading and printouts. */
export function describeSearch(p: SearchParams, fmt: (iso: string) => string): string {
  const parts: string[] = []
  if (p.lastName.trim()) parts.push(`last name contains "${p.lastName.trim()}"`)
  if (p.firstName.trim()) parts.push(`first name contains "${p.firstName.trim()}"`)
  if (p.dateFrom && p.dateTo) parts.push(`entered ${fmt(p.dateFrom)} to ${fmt(p.dateTo)}`)
  else if (p.dateFrom) parts.push(`entered on or after ${fmt(p.dateFrom)}`)
  else if (p.dateTo) parts.push(`entered on or before ${fmt(p.dateTo)}`)
  if (p.notCalledOnly) parts.push('not called yet')
  if (p.includeCompleted) parts.push('including completed')
  return parts.join(', ')
}
