import React, { useState, useCallback } from 'react'
import type { WaitingListRecord, Note } from '../../types'
import { Ico } from '../shared/Ico'
import { daysSince, formatLongDate, formatShortDate } from '../../utils/dateUtils'
import { getAgingLevel } from '../../utils/agingFlag'

function clockLabel(r: WaitingListRecord): string {
  return r.clockType === 'Other' ? (r.customClockType || 'Other') : r.clockType
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={'badge ' + (status === 'Active' ? 'active' : 'done')}>
      <span className="pip" />{status}
    </span>
  )
}

function AgingText({ iso, status }: { iso: string; status: string }) {
  if (status === 'Complete') return <span>Completed</span>
  const days = daysSince(iso)
  const level = getAgingLevel(iso)
  if (level === 'critical') return <span style={{ color: 'var(--flag-crit)', fontWeight: 600 }}>{days} days waiting</span>
  if (level === 'warning')  return <span style={{ color: 'var(--flag-warn)', fontWeight: 600 }}>{days} days waiting</span>
  return <span>{days} days ago</span>
}

interface DetailProps {
  record: WaitingListRecord
  records: WaitingListRecord[]
  onClose: () => void
  onNavigate: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => Promise<void>
  onToggleCalled: (id: number) => Promise<void>
  onToggleComplete: (id: number) => Promise<void>
  onAddNote: (id: number, body: string) => Promise<void>
  onDeleteNote: (id: number, noteId: number) => Promise<void>
}

export const Detail: React.FC<DetailProps> = ({
  record, records, onClose, onNavigate,
  onEdit, onDelete, onToggleCalled, onToggleComplete, onAddNote, onDeleteNote,
}) => {
  const [draft, setDraft] = useState('')
  const notes: Note[] = JSON.parse(record.notes || '[]')
  const idx = records.findIndex(r => r.id === record.id)

  const handlePost = useCallback(async () => {
    if (!draft.trim()) return
    await onAddNote(record.id, draft.trim())
    setDraft('')
  }, [draft, record.id, onAddNote])

  const handleExport = useCallback(() => {
    const lines = [
      'CLOCKS ON TIME — Record #' + String(record.number).padStart(3, '0'),
      '='.repeat(40),
      'Customer:    ' + record.lastName + ', ' + record.firstName,
      'Phone:       ' + (record.phoneNumber || ''),
      'Clock:       ' + clockLabel(record),
      'Entered:     ' + formatLongDate(record.dateEntered),
      'Called:      ' + (record.dateCalled ? formatLongDate(record.dateCalled) : '—'),
      'Status:      ' + record.status,
      '',
      'Issue:',
      record.issue,
      '',
      'Notes:',
      ...notes.map(n => `  • [${n.when}] ${n.author}: ${n.body}`),
    ].join('\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `record-${String(record.number).padStart(3, '0')}.txt`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, [record, notes])

  return (
    <div className="drawer" key={record.id}>
      <div className="drawer-head">
        <div className="drawer-headtop">
          <div className="crumbs">
            <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ marginRight: 4 }}>
              <Ico name="chev-l" size={14} />Back to list
            </button>
            <span>Waiting List</span>
            <Ico name="chev-r" size={12} />
            <strong>Record #{String(record.number).padStart(3, '0')}</strong>
          </div>
          <div className="drawer-nav">
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => idx > 0 && onNavigate(records[idx - 1].id)}
              disabled={idx <= 0}
            >
              <Ico name="chev-l" size={14} />
            </button>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              {idx >= 0 ? idx + 1 : '?'} / {records.length}
            </span>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => idx < records.length - 1 && onNavigate(records[idx + 1].id)}
              disabled={idx >= records.length - 1}
            >
              <Ico name="chev-r" size={14} />
            </button>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} title="Close">
            <Ico name="close" size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <div className="drawer-name">{record.lastName}, {record.firstName}</div>
            <div className="drawer-meta">
              <StatusBadge status={record.status} />
              <span className="sep">·</span>
              <span>Entered {formatLongDate(record.dateEntered)}</span>
              <span className="sep">·</span>
              <AgingText iso={record.dateEntered} status={record.status} />
              <span className="sep">·</span>
              <span className="ct-chip" style={{ height: 20, fontSize: 11 }}>
                <Ico name="clock" size={11} />{clockLabel(record)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              className={'action-toggle' + (record.dateCalled ? ' on' : '')}
              onClick={() => onToggleCalled(record.id)}
            >
              <span className="check">{record.dateCalled && <Ico name="check" size={10} />}</span>
              {record.dateCalled
                ? <>{`Called ${formatShortDate(record.dateCalled)}`}<span className="undo"> · click to undo</span></>
                : 'Mark as called'}
            </button>
            <button
              className={'action-toggle' + (record.status === 'Complete' ? ' on' : '')}
              onClick={() => onToggleComplete(record.id)}
            >
              <span className="check">{record.status === 'Complete' && <Ico name="check" size={10} />}</span>
              {record.status === 'Complete'
                ? <>Complete<span className="undo"> · click to reopen</span></>
                : 'Mark complete'}
            </button>
          </div>
        </div>
      </div>

      <div className="drawer-body">
        <div className="drawer-inner">
          <div className="two-col">
            <div>
              <div className="panel" style={{ marginTop: 0 }}>
                <div className="panel-title">Issue</div>
                <div className="panel-body">{record.issue}</div>
              </div>

              <div className="panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="panel-title" style={{ marginBottom: 0 }}>Notes · {notes.length}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-mute)' }}>Newest first</div>
                </div>
                <div style={{ marginTop: 10 }} className="note-composer">
                  <textarea
                    placeholder="Add a note — parts ordered, customer call back, repair progress…"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handlePost() }}
                  />
                  <div className="note-composer-foot">
                    <span className="hint">Tip: Ctrl+Enter to post</span>
                    <div style={{ flex: 1 }} />
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={!draft.trim()}
                      onClick={handlePost}
                      style={!draft.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      <Ico name="plus" size={13} />Add note
                    </button>
                  </div>
                </div>
                <div className="notes" style={{ marginTop: 12 }}>
                  {[...notes].reverse().map(n => (
                    <div className="note" key={n.id}>
                      <div className="note-head">
                        <span className="author">{n.author}</span>
                        <span>·</span>
                        <span className="when">{n.when}</span>
                        {n.tag && <span className="tag">{n.tag}</span>}
                      </div>
                      <div className="note-body">{n.body}</div>
                      <button
                        className="btn btn-ghost btn-icon btn-sm note-del"
                        title="Delete note"
                        onClick={() => onDeleteNote(record.id, n.id)}
                      >
                        <Ico name="trash" size={12} />
                      </button>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div style={{ padding: '14px 4px', fontSize: 13, color: 'var(--ink-mute)', fontStyle: 'italic' }}>
                      No notes yet. Add the first one above.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="panel" style={{ marginTop: 0 }}>
                <div className="panel-title">Details</div>
                <div className="field-grid" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="field">
                    <span className="lbl">Phone</span>
                    <span className="val mono">{record.phoneNumber || '—'}</span>
                  </div>
                  <div className="field">
                    <span className="lbl">Clock Type</span>
                    <span className="val">
                      <span className="ct-chip"><Ico name="clock" size={11} />{clockLabel(record)}</span>
                    </span>
                  </div>
                  <div className="field">
                    <span className="lbl">Date Entered</span>
                    <span className="val">{formatLongDate(record.dateEntered)}</span>
                  </div>
                  <div className="field">
                    <span className="lbl">Date Called</span>
                    <span className={'val' + (record.dateCalled ? '' : ' empty')}>
                      {record.dateCalled ? formatLongDate(record.dateCalled) : 'Not called yet'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-title">Timeline</div>
                <div className="timeline">
                  <div className="tl-item done">
                    <div className="tl-dot"><Ico name="check" size={11} /></div>
                    <div>
                      <div className="tl-row">
                        <span className="tl-label">Added to waiting list</span>
                        <span className="tl-date">{formatLongDate(record.dateEntered)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        Entry #{String(record.number).padStart(3, '0')} created by Ron
                      </div>
                    </div>
                  </div>
                  <div className={'tl-item ' + (record.dateCalled ? 'done' : 'pending')}>
                    <div className="tl-dot">{record.dateCalled && <Ico name="phone" size={10} />}</div>
                    <div>
                      <div className="tl-row">
                        <span className="tl-label">
                          {record.dateCalled ? 'Customer called' : 'Customer not yet called'}
                        </span>
                        {record.dateCalled && <span className="tl-date">{formatLongDate(record.dateCalled)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className={'tl-item ' + (record.status === 'Complete' ? 'done' : 'pending')}>
                    <div className="tl-dot">{record.status === 'Complete' && <Ico name="check" size={11} />}</div>
                    <div>
                      <div className="tl-row">
                        <span className="tl-label">
                          {record.status === 'Complete' ? 'Marked complete' : 'Awaiting completion'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="drawer-foot">
        <button className="btn" onClick={() => window.print()}>
          <Ico name="print" size={14} />Print record
        </button>
        <button className="btn" onClick={handleExport}>
          <Ico name="export" size={14} />Export
        </button>
        <div className="spacer" />
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm(`Delete record #${String(record.number).padStart(3, '0')}? This cannot be undone.`)) {
              onDelete(record.id)
            }
          }}
        >
          <Ico name="trash" size={14} />Delete
        </button>
        <button className="btn btn-primary" onClick={() => onEdit(record.id)}>
          <Ico name="edit" size={14} />Edit details
        </button>
      </div>
    </div>
  )
}
