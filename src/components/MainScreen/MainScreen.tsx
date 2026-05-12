import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import type { WaitingListRecord } from '../../types'
import type { SidebarTab } from '../../App'
import { Ico } from '../shared/Ico'
import { daysSince, formatShortDate } from '../../utils/dateUtils'
import { getAgingLevel } from '../../utils/agingFlag'

interface MainScreenProps {
  records: WaitingListRecord[]
  tab: SidebarTab
  selectedId: number | null
  onSelectRecord: (id: number) => void
  onAddNew: () => void
  onBackup: () => void
}

const CLOCK_FILTER_OPTS = ['All clock types', 'Cuckoo 2 wt.', 'Cuckoo 3 wt.', 'Wall Clock', 'Mantle Clock', 'Anniversary (400-day)', 'Tall Case', "Ship's Bell", 'Other']
const DATE_RANGE_OPTS   = ['All time', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Older than 90 days']
const SORT_KEYS = [
  { key: 'number',      label: 'Record #' },
  { key: 'lastName',    label: 'Customer' },
  { key: 'dateEntered', label: 'Date entered' },
  { key: 'dateCalled',  label: 'Date called' },
]

function clockLabel(r: WaitingListRecord): string {
  return r.clockType === 'Other' ? (r.customClockType || 'Other') : r.clockType
}

function AgingFlag({ iso, status }: { iso: string; status: string }) {
  if (status === 'Complete') return <span className="flag fresh" />
  const days = daysSince(iso)
  const level = getAgingLevel(iso)
  if (level === 'fresh') {
    return <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{days}d</span>
  }
  return (
    <span className={'flag ' + (level === 'warning' ? 'warn' : 'crit')} title={`${days} days waiting`}>
      <span className="glyph">!</span>{days}d
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={'badge ' + (status === 'Active' ? 'active' : 'done')}>
      <span className="pip" />{status}
    </span>
  )
}

interface ChipMenuProps {
  open: boolean
  items: string[]
  value: string
  onPick: (v: string) => void
  onClose: () => void
}

function ChipMenu({ open, items, value, onPick, onClose }: ChipMenuProps) {
  if (!open) return null
  return (
    <>
      <div className="menu-mask" onClick={onClose} />
      <div className="menu">
        {items.map(item => (
          <button
            key={item}
            className={'menu-item' + (item === value ? ' active' : '')}
            onClick={() => { onPick(item); onClose() }}
          >
            <span className="menu-check">{item === value && <Ico name="check" size={11} />}</span>
            <span>{item}</span>
          </button>
        ))}
      </div>
    </>
  )
}

export const MainScreen: React.FC<MainScreenProps> = ({
  records, tab, selectedId, onSelectRecord, onAddNew, onBackup,
}) => {
  const [search, setSearch] = useState('')
  const [agingFilter, setAgingFilter] = useState<'all' | 'warn' | 'crit'>('all')
  const [clockTypeFilter, setClockTypeFilter] = useState('All clock types')
  const [dateRangeFilter, setDateRangeFilter] = useState('All time')
  const [sort, setSort] = useState({ key: 'number', dir: 'desc' as 'asc' | 'desc' })
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        onAddNew()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onAddNew])

  const baseRecords = useMemo(() => {
    if (tab === 'waiting')   return records.filter(r => !r.isDeleted && r.status === 'Active')
    if (tab === 'completed') return records.filter(r => !r.isDeleted && r.status === 'Complete')
    return records.filter(r => !r.isDeleted)
  }, [records, tab])

  const flags = useMemo(() => {
    return baseRecords.reduce((acc, r) => {
      const lv = getAgingLevel(r.dateEntered)
      acc[lv] = (acc[lv] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [baseRecords])

  const filtered = useMemo(() => {
    let r = baseRecords
    if (agingFilter !== 'all') {
      const lvMap: Record<string, string> = { warn: 'warning', crit: 'critical' }
      r = r.filter(x => x.status === 'Active' && getAgingLevel(x.dateEntered) === lvMap[agingFilter])
    }
    if (clockTypeFilter !== 'All clock types') {
      r = r.filter(x => clockLabel(x) === clockTypeFilter)
    }
    if (dateRangeFilter !== 'All time') {
      r = r.filter(x => {
        const d = daysSince(x.dateEntered)
        if (dateRangeFilter === 'Older than 90 days') return d > 90
        const limit: Record<string, number> = { 'Last 7 days': 7, 'Last 30 days': 30, 'Last 90 days': 90 }
        return d <= (limit[dateRangeFilter] || 999)
      })
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const digits = q.replace(/\D/g, '')
      r = r.filter(x => {
        const nameTokens = (x.lastName + ' ' + x.firstName).toLowerCase().split(/[^a-z]+/)
        if (nameTokens.some(t => t.startsWith(q))) return true
        const clockTokens = clockLabel(x).toLowerCase().split(/[^a-z0-9]+/)
        if (clockTokens.some(t => t.startsWith(q))) return true
        if (digits && x.phoneNumber && x.phoneNumber.replace(/\D/g, '').includes(digits)) return true
        if (String(x.number).startsWith(q)) return true
        return false
      })
    }
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...r].sort((a, b) => {
      const va = (a as any)[sort.key] ?? ''
      const vb = (b as any)[sort.key] ?? ''
      if (va < vb) return -1 * dir
      if (va > vb) return  1 * dir
      return 0
    })
  }, [baseRecords, agingFilter, clockTypeFilter, dateRangeFilter, search, sort])

  const hasFilters = agingFilter !== 'all' || clockTypeFilter !== 'All clock types' || dateRangeFilter !== 'All time' || search

  const handleExport = useCallback(() => {
    const rows = [['#', 'Last', 'First', 'Phone', 'Clock', 'Entered', 'Called', 'Status', 'Issue']]
    filtered.forEach(r => rows.push([
      String(r.number), r.lastName, r.firstName, r.phoneNumber,
      clockLabel(r), r.dateEntered, r.dateCalled || '', r.status, r.issue.replace(/\n/g, ' ')
    ]))
    const csv = rows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'clocks-on-time-export.csv'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [filtered])

  const toggleSort = useCallback((key: string) => {
    setSort(s => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }))
  }, [])

  const sortLabel = SORT_KEYS.find(k => k.key === sort.key)?.label ?? sort.key

  if (tab === 'reports') {
    return (
      <div className="main" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <div className="title">Reports</div>
          <div className="sub">Export and print features coming soon.</div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Command bar */}
      <div className="cmdbar">
        <div>
          <div className="page-title">
            {tab === 'waiting' ? 'Waiting List' : 'Completed Repairs'}
          </div>
          <div className="page-sub">
            {tab === 'waiting' ? (
              <>
                <strong style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{baseRecords.length}</strong> active ·{' '}
                <span style={{ color: 'var(--flag-warn)' }}>{flags['warning'] || 0} aging</span> ·{' '}
                <span style={{ color: 'var(--flag-crit)' }}>{flags['critical'] || 0} overdue (76+ days)</span>
              </>
            ) : (
              <>{baseRecords.length} repairs completed</>
            )}
          </div>
        </div>
        <div className="cmd-spacer" />
        <div className="search">
          <span className="ico"><Ico name="search" size={14} /></span>
          <input
            ref={searchRef}
            placeholder="Search by name, phone, or #"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="kbd">Ctrl K</span>
        </div>
        <button className="btn" title="Create a snapshot backup" onClick={onBackup}>
          <Ico name="backup" size={14} />Backup
        </button>
        <button className="btn" title="Download current view as CSV" onClick={handleExport}>
          <Ico name="export" size={14} />Export
        </button>
        <button className="btn" title="Print current view" onClick={() => window.print()}>
          <Ico name="print" size={14} />Print
        </button>
        <button className="btn btn-primary" onClick={onAddNew}>
          <Ico name="plus" size={14} />New Record
        </button>
      </div>

      {/* Filter chips */}
      <div className="filterbar">
        <span className="filter-label">Filter</span>

        {tab === 'waiting' && (
          <>
            <div className="chip-wrap">
              <button
                className={'chip ' + (agingFilter === 'warn' ? 'active' : '')}
                onClick={() => setAgingFilter(f => f === 'warn' ? 'all' : 'warn')}
              >
                <span className="flag warn" style={{ width: 10, height: 10, minWidth: 0, padding: 0 }} />
                Aging 45–75d <span className="chip-count">· {flags['warning'] || 0}</span>
              </button>
            </div>
            <div className="chip-wrap">
              <button
                className={'chip ' + (agingFilter === 'crit' ? 'active' : '')}
                onClick={() => setAgingFilter(f => f === 'crit' ? 'all' : 'crit')}
              >
                <span className="flag crit" style={{ width: 10, height: 10, minWidth: 0, padding: 0, boxShadow: 'none' }} />
                Overdue 76d+ <span className="chip-count">· {flags['critical'] || 0}</span>
              </button>
            </div>
            <span className="chip-divider" />
          </>
        )}

        <div className="chip-wrap">
          <button
            className={'chip ' + (clockTypeFilter !== 'All clock types' ? 'active' : '')}
            onClick={() => setOpenMenu(m => m === 'clockType' ? null : 'clockType')}
          >
            <Ico name="filter" size={12} />
            {clockTypeFilter === 'All clock types' ? 'Clock type' : clockTypeFilter}
            <Ico name="chev-d" size={10} />
          </button>
          <ChipMenu
            open={openMenu === 'clockType'}
            items={CLOCK_FILTER_OPTS}
            value={clockTypeFilter}
            onPick={setClockTypeFilter}
            onClose={() => setOpenMenu(null)}
          />
        </div>

        <div className="chip-wrap">
          <button
            className={'chip ' + (dateRangeFilter !== 'All time' ? 'active' : '')}
            onClick={() => setOpenMenu(m => m === 'dateRange' ? null : 'dateRange')}
          >
            <Ico name="calendar" size={12} />
            {dateRangeFilter === 'All time' ? 'Date range' : dateRangeFilter}
            <Ico name="chev-d" size={10} />
          </button>
          <ChipMenu
            open={openMenu === 'dateRange'}
            items={DATE_RANGE_OPTS}
            value={dateRangeFilter}
            onPick={setDateRangeFilter}
            onClose={() => setOpenMenu(null)}
          />
        </div>

        <div style={{ flex: 1 }} />

        {hasFilters && (
          <button className="chip" onClick={() => { setAgingFilter('all'); setClockTypeFilter('All clock types'); setDateRangeFilter('All time'); setSearch('') }}>
            <Ico name="close" size={11} />Clear filters
          </button>
        )}

        <div className="chip-wrap">
          <button className="chip" onClick={() => setOpenMenu(m => m === 'sort' ? null : 'sort')}>
            <Ico name="chev-d" size={12} />Sort: {sortLabel} {sort.dir === 'desc' ? '↓' : '↑'}
          </button>
          <ChipMenu
            open={openMenu === 'sort'}
            items={[
              ...SORT_KEYS.map(k => k.label + ' (newest/Z–A)'),
              ...SORT_KEYS.map(k => k.label + ' (oldest/A–Z)'),
            ]}
            value={sortLabel + (sort.dir === 'desc' ? ' (newest/Z–A)' : ' (oldest/A–Z)')}
            onPick={v => {
              const desc = v.endsWith('(newest/Z–A)')
              const label = v.replace(/ \(.*/, '')
              const found = SORT_KEYS.find(k => k.label === label)
              if (found) setSort({ key: found.key, dir: desc ? 'desc' : 'asc' })
              setOpenMenu(null)
            }}
            onClose={() => setOpenMenu(null)}
          />
        </div>
      </div>

      {/* Result bar */}
      <div className="resultbar">
        Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'record' : 'records'}
        {search && <> matching <strong>"{search}"</strong></>}
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="records">
          <thead>
            <tr>
              <th style={{ width: 64, paddingLeft: 16 }}>Age</th>
              <th
                style={{ width: 56 }}
                className={sort.key === 'number' ? 'sorted' : ''}
                onClick={() => toggleSort('number')}
              >
                #<span className="sort">{sort.key === 'number' ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
              </th>
              <th
                className={sort.key === 'lastName' ? 'sorted' : ''}
                onClick={() => toggleSort('lastName')}
              >
                Customer<span className="sort">{sort.key === 'lastName' ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
              </th>
              <th>Phone</th>
              <th
                style={{ width: 110 }}
                className={sort.key === 'dateEntered' ? 'sorted' : ''}
                onClick={() => toggleSort('dateEntered')}
              >
                Entered<span className="sort">{sort.key === 'dateEntered' ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
              </th>
              <th
                style={{ width: 110 }}
                className={sort.key === 'dateCalled' ? 'sorted' : ''}
                onClick={() => toggleSort('dateCalled')}
              >
                Called<span className="sort">{sort.key === 'dateCalled' ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</span>
              </th>
              <th>Clock</th>
              <th>Issue</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 44 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--ink-3)', fontStyle: 'italic' }}>
                  No records match your filters.
                </td>
              </tr>
            ) : filtered.map(r => (
              <tr
                key={r.id}
                className={'row' + (selectedId === r.id ? ' selected' : '')}
                onClick={() => onSelectRecord(r.id)}
              >
                <td className="flag-cell">
                  <AgingFlag iso={r.dateEntered} status={r.status} />
                </td>
                <td className="num-cell">{String(r.number).padStart(3, '0')}</td>
                <td className="name-cell">
                  {r.lastName},<span className="first"> {r.firstName}</span>
                </td>
                <td className="phone-cell">{r.phoneNumber}</td>
                <td className="date-cell">{formatShortDate(r.dateEntered)}</td>
                <td className={'date-cell' + (r.dateCalled ? '' : ' empty')}>
                  {r.dateCalled ? formatShortDate(r.dateCalled) : '—'}
                </td>
                <td>
                  <span className="ct-chip">
                    <Ico name="clock" size={11} />
                    {clockLabel(r)}
                  </span>
                </td>
                <td className="issue-cell" title={r.issue}>{r.issue}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="actions-cell">
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={e => { e.stopPropagation(); onSelectRecord(r.id) }}
                    aria-label="Open"
                  >
                    <Ico name="chev-r" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
