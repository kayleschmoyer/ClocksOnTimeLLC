import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { CLOCK_TYPES, type NewRecordInput, type Note, type RecordStatus, type WaitingListRecord } from '../types'
import { formatDate, formatNoteTime, today } from '../utils/dateUtils'
import { formatPhone } from '../utils/phoneFormat'
import { parseNotes } from '../utils/records'
import { Flag } from './ui/Flag'
import { Ico } from './ui/Ico'

export interface RecordScreenHandle {
  isDirty: () => boolean
  /** Validates and saves. Resolves false when a field needs fixing. */
  save: () => Promise<boolean>
}

interface FormState {
  lastName: string
  firstName: string
  phoneNumber: string
  dateEntered: string
  dateCalled: string
  clockType: string
  customClockType: string
  issue: string
  status: RecordStatus
}

const KNOWN_TYPES: readonly string[] = CLOCK_TYPES

function toForm(r?: WaitingListRecord): FormState {
  if (!r) {
    return { lastName: '', firstName: '', phoneNumber: '', dateEntered: today(), dateCalled: '', clockType: '', customClockType: '', issue: '', status: 'Active' }
  }
  // A type saved before the list changed is shown under "Other" so nothing is lost.
  const known = r.clockType === '' || KNOWN_TYPES.includes(r.clockType)
  return {
    lastName: r.lastName, firstName: r.firstName, phoneNumber: r.phoneNumber,
    dateEntered: r.dateEntered, dateCalled: r.dateCalled ?? '',
    clockType: known ? r.clockType : 'Other',
    customClockType: known ? (r.customClockType ?? '') : r.clockType,
    issue: r.issue, status: r.status,
  }
}

function toInput(f: FormState): NewRecordInput {
  return {
    lastName: f.lastName.trim(), firstName: f.firstName.trim(), phoneNumber: f.phoneNumber.trim(),
    dateEntered: f.dateEntered, dateCalled: f.dateCalled || null,
    clockType: f.clockType, customClockType: f.clockType === 'Other' ? (f.customClockType.trim() || null) : null,
    issue: f.issue.trim(), status: f.status,
  }
}

interface RecordScreenProps {
  record?: WaitingListRecord        // undefined = new record
  newNumber?: number
  position: { index: number; total: number; label: string } | null
  onBack: () => void
  onPrev?: () => void
  onNext?: () => void
  onSave: (input: NewRecordInput) => Promise<void>
  onDelete: () => void
  onPrint: (preview: WaitingListRecord) => void
  onSaveNotes: (notes: Note[]) => Promise<void>
}

export const RecordScreen = forwardRef<RecordScreenHandle, RecordScreenProps>(({
  record, newNumber, position, onBack, onPrev, onNext, onSave, onDelete, onPrint, onSaveNotes,
}, ref) => {
  const isNew = !record
  const [form, setForm] = useState<FormState>(() => toForm(record))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [saving, setSaving] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const lastRef = useRef<HTMLInputElement>(null)
  const firstRef = useRef<HTMLInputElement>(null)
  const enteredRef = useRef<HTMLInputElement>(null)

  const saved = useMemo(() => toForm(record), [record])
  const dirty = (Object.keys(form) as (keyof FormState)[]).some(k => form[k] !== saved[k])
  const notes = useMemo(() => (record ? parseNotes(record.notes) : []), [record])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(prev => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const save = async (): Promise<boolean> => {
    const e: typeof errors = {}
    if (!form.lastName.trim()) e.lastName = 'Enter the last name.'
    if (!form.firstName.trim()) e.firstName = 'Enter the first name.'
    if (!form.dateEntered) e.dateEntered = 'Choose the date entered.'
    setErrors(e)
    if (e.lastName) lastRef.current?.focus()
    else if (e.firstName) firstRef.current?.focus()
    else if (e.dateEntered) enteredRef.current?.focus()
    if (Object.keys(e).length) return false

    setSaving(true)
    try {
      await onSave(toInput(form))
      return true
    } catch {
      return false
    } finally {
      setSaving(false)
    }
  }

  useImperativeHandle(ref, () => ({ isDirty: () => dirty, save }))

  const addNote = async () => {
    const body = noteDraft.trim()
    if (!body) return
    await onSaveNotes([...notes, { id: Date.now(), when: new Date().toISOString(), body }])
    setNoteDraft('')
  }

  const number = record ? record.number : newNumber
  const preview = (): WaitingListRecord => ({
    ...(record ?? { id: 0, number: number ?? 0, notes: '[]', isDeleted: 0, createdAt: '', updatedAt: '' }),
    ...toInput(form),
  })

  return (
    <div className="screen no-print">
      <div className="recnav">
        <button className="btn" onClick={onBack}><Ico name="chev-l" />Back to List</button>
        <div className="grow" />
        {position && (
          <>
            <span className="recnav-pos">Record <strong>{position.index + 1}</strong> of <strong>{position.total}</strong> {position.label}</span>
            <button className="btn" onClick={onPrev} disabled={!onPrev}><Ico name="chev-l" />Previous</button>
            <button className="btn" onClick={onNext} disabled={!onNext}>Next<Ico name="chev-r" /></button>
          </>
        )}
      </div>

      <form className="card reccard" onSubmit={e => e.preventDefault()} noValidate>
        {/* Saving happens only from the Save button, never from the Enter key. */}
        <div className="rec-head">
          <div>
            <h1>{isNew ? 'New Record' : `Record ${number}`}</h1>
            <p className="page-sub">
              {isNew
                ? <>This will be record number <strong>{number ?? '…'}</strong>. Nothing is stored until you press Save.</>
                : <>Entered {formatDate(record.dateEntered)}</>}
            </p>
          </div>
          <div className="rec-head-flags">
            {!isNew && <Flag record={record} long />}
            {!isNew && <span className={'pill ' + (record.status === 'Active' ? 'pill-active' : 'pill-done')}>{record.status}</span>}
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="f-last">Last name <span className="req">(required)</span></label>
            <input id="f-last" ref={lastRef} className={'input' + (errors.lastName ? ' err' : '')} value={form.lastName}
              onChange={e => set('lastName', e.target.value)} autoFocus={isNew} aria-invalid={!!errors.lastName} aria-describedby="e-last" />
            {errors.lastName && <span id="e-last" className="field-err">{errors.lastName}</span>}
          </div>
          <div className="field">
            <label htmlFor="f-first">First name <span className="req">(required)</span></label>
            <input id="f-first" ref={firstRef} className={'input' + (errors.firstName ? ' err' : '')} value={form.firstName}
              onChange={e => set('firstName', e.target.value)} aria-invalid={!!errors.firstName} aria-describedby="e-first" />
            {errors.firstName && <span id="e-first" className="field-err">{errors.firstName}</span>}
          </div>

          <div className="field">
            <label htmlFor="f-phone">Phone number</label>
            <input id="f-phone" className="input" type="tel" inputMode="tel" placeholder="(231) 555-0142" value={form.phoneNumber}
              onChange={e => set('phoneNumber', formatPhone(e.target.value))} />
          </div>
          <div className="field">
            <label htmlFor="f-clock">Clock type</label>
            <select id="f-clock" className="input" value={form.clockType} onChange={e => set('clockType', e.target.value)}>
              <option value="">Choose a clock type</option>
              {CLOCK_TYPES.map(t => <option key={t} value={t}>{t === 'Other' ? 'Other (type it in)' : t}</option>)}
            </select>
            {form.clockType === 'Other' && (
              <input className="input" style={{ marginTop: 8 }} aria-label="Other clock type" placeholder="Type the clock type"
                value={form.customClockType} onChange={e => set('customClockType', e.target.value)} />
            )}
          </div>

          <div className="field">
            <label htmlFor="f-entered">Date entered <span className="req">(required)</span></label>
            <input id="f-entered" ref={enteredRef} className={'input' + (errors.dateEntered ? ' err' : '')} type="date" value={form.dateEntered}
              onChange={e => set('dateEntered', e.target.value)} aria-invalid={!!errors.dateEntered} aria-describedby="e-entered" />
            {errors.dateEntered && <span id="e-entered" className="field-err">{errors.dateEntered}</span>}
          </div>
          <div className="field">
            <label htmlFor="f-called">Date called</label>
            <div className="inline">
              <input id="f-called" className="input" type="date" value={form.dateCalled} onChange={e => set('dateCalled', e.target.value)} />
              {form.dateCalled
                ? <button type="button" className="btn" onClick={() => set('dateCalled', '')}>Clear</button>
                : <button type="button" className="btn btn-soft" onClick={() => set('dateCalled', today())}><Ico name="phone" size={18} />Called Today</button>}
            </div>
            <span className="hint">Leave blank until the customer has been called.</span>
          </div>

          <div className="field span2">
            <label htmlFor="f-issue">Issue</label>
            <textarea id="f-issue" className="input textarea" rows={2} maxLength={300} value={form.issue}
              onChange={e => set('issue', e.target.value)} />
          </div>

          <div className="field span2">
            <span className="label" id="l-status">Status</span>
            <div className="seg" role="radiogroup" aria-labelledby="l-status">
              {(['Active', 'Complete'] as RecordStatus[]).map(s => (
                <button key={s} type="button" role="radio" aria-checked={form.status === s}
                  className={'seg-btn' + (form.status === s ? ' on' : '')} onClick={() => set('status', s)}>
                  {form.status === s && <Ico name="check" size={18} />}{s}
                </button>
              ))}
            </div>
            <span className="hint">Completed records move off the waiting list. You can still find them under Completed.</span>
          </div>
        </div>

        <div className="savebar">
          <span className={'savestate' + (dirty ? ' dirty' : '')} aria-live="polite">
            {isNew ? 'Not saved yet' : dirty ? 'You have changes that are not saved' : 'All changes saved'}
          </span>
          <div className="grow" />
          {!isNew && <button type="button" className="btn btn-danger" onClick={onDelete}><Ico name="trash" />Delete</button>}
          <button type="button" className="btn" onClick={() => onPrint(preview())}><Ico name="print" />Print Record</button>
          {!isNew && <button type="button" className="btn" disabled={!dirty} onClick={() => { setForm(saved); setErrors({}) }}><Ico name="undo" />Undo Changes</button>}
          {isNew && <button type="button" className="btn" onClick={onBack}>Cancel</button>}
          <button type="button" className="btn btn-primary btn-lg" disabled={saving || (!isNew && !dirty)} onClick={save}>
            <Ico name="save" />{saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>

      {!isNew && (
        <section className="card notescard" aria-label="Notes">
          <h2>Notes</h2>
          <div className="note-add">
            <label htmlFor="f-note" className="sr-only">New note</label>
            <textarea id="f-note" className="input textarea" rows={2} placeholder="Parts ordered, customer called back, repair progress…"
              value={noteDraft} onChange={e => setNoteDraft(e.target.value)} />
            <button type="button" className="btn btn-soft" disabled={!noteDraft.trim()} onClick={addNote}><Ico name="plus" />Add Note</button>
          </div>
          {notes.length === 0
            ? <p className="muted">No notes yet.</p>
            : (
              <ul className="notes">
                {[...notes].reverse().map(n => (
                  <li key={n.id}>
                    <div className="note-when">{formatNoteTime(n.when)}</div>
                    <div className="note-body">{n.body}</div>
                    <button type="button" className="btn btn-quiet" onClick={() => onSaveNotes(notes.filter(x => x.id !== n.id))}>
                      <Ico name="trash" size={18} />Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
        </section>
      )}
    </div>
  )
})
RecordScreen.displayName = 'RecordScreen'
