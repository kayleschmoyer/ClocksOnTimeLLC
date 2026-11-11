import React, { useEffect } from 'react'
import { Ico } from './Ico'

export interface ToastSpec {
  id: number
  msg: string
  kind?: 'ok' | 'error'
  actionLabel?: string
  onAction?: () => void
}

export const Toast: React.FC<{ toast: ToastSpec | null; onClear: () => void }> = ({ toast, onClear }) => {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClear, toast.actionLabel || toast.kind === 'error' ? 12000 : 6000)
    return () => clearTimeout(t)
  }, [toast, onClear])

  if (!toast) return <div role="status" aria-live="polite" />
  return (
    <div className={'toast' + (toast.kind === 'error' ? ' toast-error' : '')} role="status" aria-live="polite">
      <Ico name={toast.kind === 'error' ? 'warn' : 'check'} />
      <span>{toast.msg}</span>
      {toast.actionLabel && (
        <button className="toast-action" onClick={() => { toast.onAction?.(); onClear() }}>{toast.actionLabel}</button>
      )}
      <button className="toast-close" onClick={onClear} aria-label="Dismiss message"><Ico name="close" size={16} /></button>
    </div>
  )
}
