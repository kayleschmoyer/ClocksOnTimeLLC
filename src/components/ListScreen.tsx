import React from 'react'
import type { SortMode, Tab, WaitingListRecord } from '../types'
import { formatDate } from '../utils/dateUtils'
import { clockLabel, isSearchActive, SORT_LABELS, type SearchParams } from '../utils/records'
import { Flag } from './ui/Flag'
import { Ico } from './ui/Ico'

interface ListScreenProps {
  tab: Tab
  records: WaitingListRecord[]
  totalInTab: number
  flagCounts: { yellow: number; red: number }
  search: SearchParams
  sort: SortMode
  onSearch: (p: SearchParams) => void
  onClearSearch: () => void
  onSort: (m: SortMode) => void
  onOpen: (id: number) => void
  onNew: () => void
  onPrint: () => void
  onPdf: () => void
}

export const ListScreen: React.FC<ListScreenProps> = ({
  tab, records, totalInTab, flagCounts, search, sort,
  onSearch, onClearSearch, onSort, onOpen, onNew, onPrint, onPdf,
}) => {
  const searching = isSearchActive(search)
  const set = <K extends keyof SearchParams>(k: K, v: SearchParams[K]) => onSearch({ ...search, [k]: v })
  const noun = (n: number) => (n === 1 ? 'record' : 'records')

  return (
    <div className="screen no-print">
      <div className="page-head">
        <div>
          <h1>{tab === 'waiting' ? 'Waiting List' : 'Completed Records'}</h1>
          <p className="page-sub">
            {tab === 'waiting'
              ? <>{totalInTab} active {noun(totalInTab)}</>
              : <>{totalInTab} completed {noun(totalInTab)}. These are kept here and can be searched.</>}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={onPrint} disabled={records.length === 0}><Ico name="print" />Print List</button>
          <button className="btn" onClick={onPdf} disabled={records.length === 0}><Ico name="pdf" />Save as PDF</button>
          <button className="btn btn-primary btn-lg" onClick={onNew}><Ico name="plus" />New Record</button>
        </div>
      </div>

      <section className="card searchcard" aria-label="Search">
        <div className="search-grid">
          <div className="field">
            <label htmlFor="s-last">Last name</label>
            <input id="s-last" className="input" type="text" placeholder="e.g. Smi" value={search.lastName}
              onChange={e => set('lastName', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="s-first">First name</label>
            <input id="s-first" className="input" type="text" value={search.firstName}
              onChange={e => set('firstName', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="s-from">Date entered, from</label>
            <input id="s-from" className="input" type="date" value={search.dateFrom} max={search.dateTo || undefined}
              onChange={e => set('dateFrom', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="s-to">Date entered, to</label>
            <input id="s-to" className="input" type="date" value={search.dateTo} min={search.dateFrom || undefined}
              onChange={e => set('dateTo', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="s-sort">Sort by</label>
            <select id="s-sort" className="input" value={sort} onChange={e => onSort(e.target.value as SortMode)}>
              {(Object.keys(SORT_LABELS) as SortMode[]).map(m => <option key={m} value={m}>{SORT_LABELS[m]}</option>)}
            </select>
          </div>
        </div>
        <div className="search-foot">
          {tab === 'waiting' && (
            <>
              <label className="check">
                <input type="checkbox" checked={search.notCalledOnly} onChange={e => set('notCalledOnly', e.target.checked)} />
                Only customers not called yet
              </label>
              <label className="check">
                <input type="checkbox" checked={search.includeCompleted} onChange={e => set('includeCompleted', e.target.checked)} />
                Include completed records
              </label>
            </>
          )}
          <div className="grow" />
          <span className="result-count" aria-live="polite">
            {searching ? <>Showing <strong>{records.length}</strong> matching {noun(records.length)}</> : <>Showing all <strong>{records.length}</strong></>}
          </span>
          <button className="btn" onClick={onClearSearch} disabled={!searching}><Ico name="close" size={18} />Clear Search</button>
        </div>
      </section>

      <div className="card tablecard">
        {records.length === 0 ? (
          <div className="empty">
            {searching ? (
              <>
                <h2>No records match your search</h2>
                <p>Try fewer letters of the name, or a wider date range.</p>
                <button className="btn btn-lg" onClick={onClearSearch}>Clear Search</button>
              </>
            ) : tab === 'waiting' ? (
              <>
                <h2>No one is on the waiting list</h2>
                <p>Add your first customer to get started.</p>
                <button className="btn btn-primary btn-lg" onClick={onNew}><Ico name="plus" />New Record</button>
              </>
            ) : (
              <>
                <h2>No completed records yet</h2>
                <p>When you mark a record Complete and save it, it moves here.</p>
              </>
            )}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="records">
              <thead>
                <tr>
                  <th style={{ width: '13%' }}>Number</th>
                  <th style={{ width: '13%' }}>Last name</th>
                  <th style={{ width: '11%' }}>First name</th>
                  <th style={{ width: '13%' }}>Phone</th>
                  <th style={{ width: '10%' }}>Date entered</th>
                  <th style={{ width: '10%' }}>Date called</th>
                  <th style={{ width: '11%' }}>Clock type</th>
                  <th>Issue</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr
                    key={r.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open record ${r.number}, ${r.lastName}, ${r.firstName}`}
                    onClick={() => onOpen(r.id)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(r.id) } }}
                  >
                    <td>
                      <span className="numcell">
                        <span className="num">{r.number}</span>
                        <Flag record={r} />
                        {r.status === 'Complete' && tab === 'waiting' && <span className="pill pill-done">Complete</span>}
                      </span>
                    </td>
                    <td className="strong">{r.lastName}</td>
                    <td>{r.firstName}</td>
                    <td className="nowrap">{r.phoneNumber}</td>
                    <td className="nowrap">{formatDate(r.dateEntered)}</td>
                    <td className="nowrap">{r.dateCalled ? formatDate(r.dateCalled) : <span className="muted">Not called</span>}</td>
                    <td>{clockLabel(r)}</td>
                    <td><span className="clamp">{r.issue}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tab === 'waiting' && (
        <p className="legend">
          <span className="flag flag-yellow">Yellow</span> waiting 45 to 75 days ({flagCounts.yellow})
          <span className="legend-gap" />
          <span className="flag flag-red">Red</span> waiting more than 75 days ({flagCounts.red})
          <span className="legend-gap" />
          Click any row to open the record.
        </p>
      )}
    </div>
  )
}
