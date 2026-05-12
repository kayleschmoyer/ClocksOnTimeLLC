import React, { useEffect } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  thirdLabel?: string       // optional third button (e.g. "Close Without Backup")
  onConfirm: () => void
  onCancel: () => void
  onThird?: () => void
  variant?: 'default' | 'danger'
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  thirdLabel,
  onConfirm,
  onCancel,
  onThird,
  variant = 'default',
}) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.dialog} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <div style={styles.buttons}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ marginRight: 8 }}
          >
            {cancelLabel}
          </button>
          {thirdLabel && onThird && (
            <button
              className="btn btn-secondary"
              onClick={onThird}
              style={{ marginRight: 8 }}
            >
              {thirdLabel}
            </button>
          )}
          <button
            className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(24, 29, 38, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  dialog: {
    background: '#ffffff',
    borderRadius: 12,
    padding: '28px 32px',
    maxWidth: 420,
    width: '90%',
    boxShadow: '0 8px 32px rgba(24, 29, 38, 0.18)',
  },
  title: {
    fontSize: 17,
    fontWeight: 600,
    color: '#181d26',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#333840',
    lineHeight: 1.5,
    marginBottom: 24,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
  },
}
