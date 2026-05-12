import React, { useState, useEffect } from 'react'
import type { WaitingListRecord, NewRecordInput, UpdateRecordInput } from '../../types'
import { CLOCK_TYPES } from '../../types'
import { today, formatLongDate } from '../../utils/dateUtils'
import { Ico } from '../shared/Ico'

interface RecordFormModalProps {
  editRecord?: WaitingListRecord
  nextNumber?: number
  onSave: (data: NewRecordInput | UpdateRecordInput) => Promise<void>
  onClose: () => void
}

interface FormState {
  lastName: string
  firstName: string
  dateEntered: string
  phoneNumber: string
  dateCalled: string
  clockType: string
  customClockType: string
  issue: string
  status: 'Active' | 'Complete'
}

function toFormState(r: WaitingListRecord): FormState {
  return {
    lastName: r.lastName,
    firstName: r.firstName,
    dateEntered: r.dateEntered,
    phoneNumber: r.phoneNumber,
    dateCalled: r.dateCalled ?? '',
    clockType: r.clockType,
    customClockType: r.customClockType ?? '',
    issue: r.issue,
    status: r.status,
  }
}

function emptyFormState(): FormState {
  return {
    lastName: '',
    firstName: '',
    dateEntered: today(),
    phoneNumber: '',
    dateCalled: '',
    clockType: 'Wall Clock',
    customClockType: '',
    issue: '',
    status: 'Active',
  }
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  editRecord, nextNumber, onSave, onClose,
}) => {
  const isEdit = !!editRecord
  const [form, setForm] = useState<FormState>(isEdit ? toFormState(editRecord!) : emptyFormState())
  const [showErr, setShowErr] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(isEdit ? toFormState(editRecord!) : emptyFormState())
    setShowErr(false)
  }, [editRecord?.id])

  const set = (field: keyof FormState, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const canSave = form.lastName.trim() && form.firstName.trim() && form.dateEntered

  const handleSubmit = async () => {
    if (!canSave) { setShowErr(true); return }
    setSaving(true)
    try {
      await onSave({
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        clockType: form.clockType,
        ...(form.clockType === 'Other' ? { customClockType: form.customClockType.trim() } : { customClockType: null }),
        dateEntered: form.dateEntered,
        dateCalled: form.dateCalled || null,
        status: form.status,
        issue: form.issue.trim() || 'No additional notes provided.',
      })
    } finally {
      setSaving(false)
    }
  }

  const displayNumber = isEdit
    ? String(editRecord!.number).padStart(3, '0')
    : String(nextNumber ?? '???').padStart(3, '0')

  return (
    <div className="modal-mask open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="ico"><Ico name={isEdit ? 'edit' : 'plus'} /></div>
          <div>
            <div className="modal-title">{isEdit ? 'Edit record' : 'New waiting list entry'}</div>
            <div className="modal-sub">Record #{displayNumber} · {formatLongDate(today())}</div>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Ico name="close" /></button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="form-field">
              <label>Last name <span className="req">*</span></label>
              <input
                className={'input' + (showErr && !form.lastName.trim() ? ' err' : '')}
                placeholder="e.g. Ahlström"
                value={form.lastName}
                onChange={e => set('lastName', e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-field">
              <label>First name <span className="req">*</span></label>
              <input
                className={'input' + (showErr && !form.firstName.trim() ? ' err' : '')}
                placeholder="e.g. Greta"
                value={form.firstName}
                onChange={e => set('firstName', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Phone number</label>
              <input
                className="input"
                placeholder="(231) 555-0000"
                value={form.phoneNumber}
                onChange={e => set('phoneNumber', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Clock type</label>
              <select
                className="select"
                value={form.clockType}
                onChange={e => set('clockType', e.target.value)}
              >
                {[...CLOCK_TYPES].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {form.clockType === 'Other' && (
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Custom clock type</label>
                <input
                  className="input"
                  placeholder="e.g. Anniversary, Ship's Bell, Tall Case"
                  value={form.customClockType}
                  onChange={e => set('customClockType', e.target.value)}
                />
              </div>
            )}
            <div className="form-field">
              <label>Date entered <span className="req">*</span></label>
              <input
                className="input"
                type="date"
                value={form.dateEntered}
                onChange={e => set('dateEntered', e.target.value)}
              />
            </div>
            <div className="form-field">
              <label>Date called</label>
              <input
                className="input"
                type="date"
                value={form.dateCalled}
                onChange={e => set('dateCalled', e.target.value)}
              />
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Status</label>
              <div className="seg">
                <button
                  className={form.status === 'Active' ? 'on' : ''}
                  onClick={() => set('status', 'Active')}
                  type="button"
                >Active</button>
                <button
                  className={form.status === 'Complete' ? 'on' : ''}
                  onClick={() => set('status', 'Complete')}
                  type="button"
                >Complete</button>
              </div>
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Issue / notes</label>
              <textarea
                className="textarea"
                placeholder="Brief description of the clock and the issue — visible chime mechanism damage, customer notes, urgency, etc."
                rows={4}
                value={form.issue}
                onChange={e => set('issue', e.target.value)}
              />
            </div>
          </div>
          {showErr && !canSave && (
            <div className="form-err">Please fill in the required fields marked with *.</div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            <Ico name="check" size={14} />
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save record'}
          </button>
        </div>
      </div>
    </div>
  )
}
