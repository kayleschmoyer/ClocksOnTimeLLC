import React, { useState, useEffect } from 'react'
import type { WaitingListRecord, NewRecordInput, UpdateRecordInput } from '../../types'
import { CLOCK_TYPES } from '../../types'
import { today } from '../../utils/dateUtils'
import { PhoneInput } from '../shared/PhoneInput'
import { Button } from '../shared/Button'

interface RecordFormProps {
  mode: 'new' | 'edit'
  record?: WaitingListRecord        // provided in 'edit' mode
  nextNumber?: number               // provided in 'new' mode
  onSave: (data: NewRecordInput | UpdateRecordInput) => Promise<void>
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
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

function recordToForm(r: WaitingListRecord): FormState {
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

function emptyForm(nextNumber?: number): FormState {
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

export const RecordForm: React.FC<RecordFormProps> = ({
  mode,
  record,
  nextNumber,
  onSave,
  onCancel,
  onDirtyChange,
}) => {
  const [form, setForm] = useState<FormState>(
    mode === 'edit' && record ? recordToForm(record) : emptyForm(nextNumber)
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  // Track dirty state
  const initialForm = React.useRef<FormState>(
    mode === 'edit' && record ? recordToForm(record) : emptyForm(nextNumber)
  )
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm.current)

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  // Reset if record changes (navigating prev/next while in edit mode — won't happen, but safety)
  useEffect(() => {
    if (mode === 'edit' && record) {
      const f = recordToForm(record)
      setForm(f)
      initialForm.current = f
    }
  }, [record?.id])

  const update = (field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.dateEntered) newErrors.dateEntered = 'Date entered is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const data: NewRecordInput | UpdateRecordInput = {
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        dateEntered: form.dateEntered,
        phoneNumber: form.phoneNumber,
        dateCalled: form.dateCalled || null,
        clockType: form.clockType,
        customClockType: form.clockType === 'Other' ? (form.customClockType || null) : null,
        issue: form.issue.trim(),
        status: form.status,
      }
      await onSave(data)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={styles.form}>
      <div style={styles.grid}>
        {/* Last Name */}
        <div style={styles.field}>
          <label className="field-label" htmlFor="f-lastName">
            Last Name <span style={styles.required}>*</span>
          </label>
          <input
            id="f-lastName"
            className="field-input"
            value={form.lastName}
            onChange={e => update('lastName', e.target.value)}
          />
          {errors.lastName && <span style={styles.error}>{errors.lastName}</span>}
        </div>

        {/* First Name */}
        <div style={styles.field}>
          <label className="field-label" htmlFor="f-firstName">
            First Name <span style={styles.required}>*</span>
          </label>
          <input
            id="f-firstName"
            className="field-input"
            value={form.firstName}
            onChange={e => update('firstName', e.target.value)}
          />
          {errors.firstName && <span style={styles.error}>{errors.firstName}</span>}
        </div>

        {/* Date Entered */}
        <div style={styles.field}>
          <label className="field-label" htmlFor="f-dateEntered">
            Date Entered <span style={styles.required}>*</span>
          </label>
          <input
            id="f-dateEntered"
            className="field-input"
            type="date"
            value={form.dateEntered}
            onChange={e => update('dateEntered', e.target.value)}
          />
          {errors.dateEntered && <span style={styles.error}>{errors.dateEntered}</span>}
        </div>

        {/* Phone */}
        <div style={styles.field}>
          <label className="field-label" htmlFor="f-phone">Phone Number</label>
          <PhoneInput
            id="f-phone"
            value={form.phoneNumber}
            onChange={v => update('phoneNumber', v)}
          />
        </div>

        {/* Date Called */}
        <div style={styles.field}>
          <label className="field-label" htmlFor="f-dateCalled">Date Called</label>
          <input
            id="f-dateCalled"
            className="field-input"
            type="date"
            value={form.dateCalled}
            onChange={e => update('dateCalled', e.target.value)}
          />
        </div>

        {/* Clock Type */}
        <div style={styles.field}>
          <label className="field-label" htmlFor="f-clockType">Clock Type</label>
          <select
            id="f-clockType"
            className="field-input"
            value={form.clockType}
            onChange={e => update('clockType', e.target.value)}
          >
            {CLOCK_TYPES.map(ct => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>

        {/* Custom clock type (shown when Other is selected) */}
        {form.clockType === 'Other' && (
          <div style={styles.field}>
            <label className="field-label" htmlFor="f-customClock">Custom Clock Type</label>
            <input
              id="f-customClock"
              className="field-input"
              placeholder="e.g. Ship Clock, Anniversary Clock"
              value={form.customClockType}
              onChange={e => update('customClockType', e.target.value)}
            />
          </div>
        )}

        {/* Status */}
        <div style={styles.field}>
          <label className="field-label" htmlFor="f-status">Status</label>
          <select
            id="f-status"
            className="field-input"
            value={form.status}
            onChange={e => update('status', e.target.value as 'Active' | 'Complete')}
          >
            <option value="Active">Active</option>
            <option value="Complete">Complete</option>
          </select>
        </div>
      </div>

      {/* Issue — full width */}
      <div style={{ ...styles.field, marginTop: 12 }}>
        <label className="field-label" htmlFor="f-issue">Issue</label>
        <textarea
          id="f-issue"
          className="field-input"
          rows={3}
          style={{ resize: 'vertical', minHeight: 70 }}
          value={form.issue}
          onChange={e => update('issue', e.target.value)}
          placeholder="Brief description of the clock issue..."
        />
      </div>

      {/* Form actions */}
      <div style={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : (mode === 'new' ? 'Save New Record' : 'Save Changes')}
        </Button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    padding: '16px 20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px 16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
  },
  required: {
    color: '#c0392b',
    marginLeft: 2,
  },
  error: {
    fontSize: 11,
    color: '#c0392b',
    marginTop: 3,
  },
  actions: {
    display: 'flex',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid #dddddd',
  },
}
