import React, { useState, useEffect } from 'react';
import { ClockRecord, ModalMode } from '../types';
import { RecordForm, FormValues, emptyFormValues, recordToFormValues } from './RecordForm';

interface RecordModalProps {
  mode: ModalMode;
  record: ClockRecord | null; // null when adding
  onSave: (values: FormValues) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function RecordModal({ mode, record, onSave, onDelete, onClose }: RecordModalProps) {
  const [values, setValues] = useState<FormValues>(emptyFormValues);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && record) {
      setValues(recordToFormValues(record));
    } else {
      setValues(emptyFormValues());
    }
    setConfirmDelete(false);
  }, [mode, record]);

  if (!mode) return null;

  const isValid = values.lastName.trim() && values.firstName.trim() && values.dateEntered;

  function handleSave() {
    if (!isValid) return;
    onSave(values);
  }

  function handleDelete() {
    if (!record) return;
    if (confirmDelete) {
      onDelete(record.id);
    } else {
      setConfirmDelete(true);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(24, 29, 38, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 'var(--spacing-lg)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: 'var(--color-canvas)',
        borderRadius: 'var(--rounded-lg)',
        boxShadow: 'var(--shadow-modal)',
        width: '100%',
        maxWidth: 640,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Modal header */}
        <div style={{
          padding: 'var(--spacing-lg) var(--spacing-xl)',
          borderBottom: '1px solid var(--color-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
            {mode === 'add' ? 'Add New Record' : `Edit Record #${record?.number}`}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--rounded-sm)',
              border: '1px solid var(--color-hairline)',
              backgroundColor: 'var(--color-canvas)',
              color: 'var(--color-muted)',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', overflowY: 'auto', flex: 1 }}>
          <RecordForm
            values={values}
            onChange={setValues}
            recordNumber={mode === 'edit' ? record?.number : undefined}
          />
        </div>

        {/* Modal footer */}
        <div style={{
          padding: 'var(--spacing-md) var(--spacing-xl)',
          borderTop: '1px solid var(--color-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-xs)',
        }}>
          <div>
            {mode === 'edit' && (
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--rounded-sm)',
                  border: '1px solid var(--color-danger)',
                  backgroundColor: confirmDelete ? 'var(--color-danger)' : 'var(--color-canvas)',
                  color: confirmDelete ? 'var(--color-on-primary)' : 'var(--color-danger)',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {confirmDelete ? 'Confirm Delete' : 'Delete Record'}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--rounded-sm)',
                border: '1px solid var(--color-hairline)',
                backgroundColor: 'var(--color-canvas)',
                color: 'var(--color-ink)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--rounded-lg)',
                border: 'none',
                backgroundColor: isValid ? 'var(--color-primary)' : 'var(--color-surface-strong)',
                color: isValid ? 'var(--color-on-primary)' : 'var(--color-border-strong)',
                fontSize: 13,
                fontWeight: 500,
                cursor: isValid ? 'pointer' : 'not-allowed',
              }}
            >
              {mode === 'add' ? 'Add Record' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
