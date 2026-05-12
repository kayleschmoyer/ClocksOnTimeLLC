import React from 'react';
import { ClockRecord } from '../types';

export interface FormValues {
  lastName: string;
  firstName: string;
  dateEntered: string;
  phoneNumber: string;
  dateCalled: string;
  clockType: string;
  issue: string;
}

interface RecordFormProps {
  values: FormValues;
  onChange: (values: FormValues) => void;
  recordNumber?: number; // shown read-only when editing
}

export function RecordForm({ values, onChange, recordNumber }: RecordFormProps) {
  function set(field: keyof FormValues, value: string) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {recordNumber !== undefined && (
        <Field label="Record #">
          <span style={{
            display: 'inline-block',
            padding: '8px 12px',
            backgroundColor: 'var(--color-surface-soft)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--rounded-sm)',
            fontSize: 13,
            color: 'var(--color-muted)',
            minWidth: 80,
          }}>
            {recordNumber}
          </span>
        </Field>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <Field label="Last Name" required>
          <Input
            value={values.lastName}
            onChange={v => set('lastName', v)}
            placeholder="Smith"
          />
        </Field>
        <Field label="First Name" required>
          <Input
            value={values.firstName}
            onChange={v => set('firstName', v)}
            placeholder="John"
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <Field label="Date Entered" required>
          <Input
            type="date"
            value={values.dateEntered}
            onChange={v => set('dateEntered', v)}
          />
        </Field>
        <Field label="Phone Number">
          <Input
            type="tel"
            value={values.phoneNumber}
            onChange={v => set('phoneNumber', v)}
            placeholder="555-0100"
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <Field label="Date Called" hint="Leave blank if not yet called">
          <Input
            type="date"
            value={values.dateCalled}
            onChange={v => set('dateCalled', v)}
          />
        </Field>
        <Field label="Clock Type">
          <Input
            value={values.clockType}
            onChange={v => set('clockType', v)}
            placeholder="Grandfather Clock"
          />
        </Field>
      </div>

      <Field label="Issue / Description">
        <textarea
          value={values.issue}
          onChange={e => set('issue', e.target.value)}
          placeholder="Describe the problem with the clock…"
          rows={4}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--rounded-sm)',
            fontSize: 13,
            color: 'var(--color-ink)',
            lineHeight: 1.5,
            backgroundColor: 'var(--color-canvas)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-info-border)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-hairline)')}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--color-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        {label}
        {required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--color-border-strong)' }}>{hint}</span>}
    </div>
  );
}

function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        height: 36,
        padding: '0 12px',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--rounded-sm)',
        fontSize: 13,
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-ink)',
      }}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-info-border)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-hairline)')}
    />
  );
}

export function emptyFormValues(): FormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    lastName: '',
    firstName: '',
    dateEntered: today,
    phoneNumber: '',
    dateCalled: '',
    clockType: '',
    issue: '',
  };
}

export function recordToFormValues(r: ClockRecord): FormValues {
  return {
    lastName: r.lastName,
    firstName: r.firstName,
    dateEntered: r.dateEntered,
    phoneNumber: r.phoneNumber,
    dateCalled: r.dateCalled,
    clockType: r.clockType,
    issue: r.issue,
  };
}
