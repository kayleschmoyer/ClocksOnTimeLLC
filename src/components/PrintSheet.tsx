import React from 'react'
import type { WaitingListRecord } from '../types'
import { agingLevel } from '../utils/agingFlag'
import { daysSince, formatDate, formatLongDate, formatNoteTime, today } from '../utils/dateUtils'
import { clockLabel, parseNotes } from '../utils/records'

export type PrintJob =
  | { kind: 'list'; title: string; detail: string; records: WaitingListRecord[] }
  | { kind: 'record'; record: WaitingListRecord }

function flagText(r: WaitingListRecord): string {
  const level = agingLevel(r)
  if (level === 'none') return ''
  return `${daysSince(r.dateEntered)} days`
}

/** Hidden on screen. Under @media print it is the only thing on the page, so paper and PDF match. */
export const PrintSheet: React.FC<{ job: PrintJob | null }> = ({ job }) => {
  if (!job) return <div className="print-sheet" />

  if (job.kind === 'record') {
    const r = job.record
    const notes = parseNotes(r.notes)
    const rows: [string, string][] = [
      ['Number', String(r.number || '')],
      ['Last name', r.lastName],
      ['First name', r.firstName],
      ['Phone number', r.phoneNumber],
      ['Date entered', formatDate(r.dateEntered)],
      ['Date called', r.dateCalled ? formatDate(r.dateCalled) : 'Not called'],
      ['Clock type', clockLabel(r)],
      ['Issue', r.issue],
      ['Status', r.status + (flagText(r) ? ` (waiting ${flagText(r)})` : '')],
    ]
    return (
      <div className="print-sheet">
        <div className="ps-head">
          <div className="ps-title">Clocks on Time LLC <span>· Waiting List Record</span></div>
          <div className="ps-meta">Printed {formatLongDate(today())}</div>
        </div>
        <table className="ps-record">
          <tbody>{rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody>
        </table>
        {notes.length > 0 && (
          <>
            <div className="ps-section">Notes</div>
            {notes.map(n => <p className="ps-note" key={n.id}><strong>{formatNoteTime(n.when)}</strong> — {n.body}</p>)}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="print-sheet">
      <div className="ps-head">
        <div className="ps-title">Clocks on Time LLC <span>· {job.title}</span></div>
        <div className="ps-meta">
          Printed {formatLongDate(today())}<br />
          {job.records.length} {job.records.length === 1 ? 'record' : 'records'}{job.detail ? ` · ${job.detail}` : ''}
        </div>
      </div>
      <table className="ps-list">
        <thead>
          <tr><th>No.</th><th>Last name</th><th>First name</th><th>Phone</th><th>Entered</th><th>Called</th><th>Clock type</th><th>Issue</th></tr>
        </thead>
        <tbody>
          {job.records.map(r => (
            <tr key={r.id}>
              <td className="ps-num">{r.number}{flagText(r) && <span className={'ps-flag ps-' + agingLevel(r)}>{flagText(r)}</span>}</td>
              <td className="ps-strong">{r.lastName}</td>
              <td>{r.firstName}</td>
              <td className="ps-nowrap">{r.phoneNumber}</td>
              <td className="ps-nowrap">{formatDate(r.dateEntered)}</td>
              <td className="ps-nowrap">{r.dateCalled ? formatDate(r.dateCalled) : ''}</td>
              <td>{clockLabel(r)}</td>
              <td>{r.issue}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ps-foot">Day counts mark records waiting 45 days or more since the date entered.</div>
    </div>
  )
}
