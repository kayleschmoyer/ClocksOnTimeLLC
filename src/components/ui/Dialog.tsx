import React, { useEffect, useRef } from 'react'

export interface DialogButton {
  label: string
  kind?: 'primary' | 'danger'
  onClick: () => void
}

export interface DialogSpec {
  title: string
  message: React.ReactNode
  buttons: DialogButton[]
  /** Called for Esc. Clicking outside does nothing, so a stray click never loses work. */
  onCancel: () => void
}

export const Dialog: React.FC<{ spec: DialogSpec }> = ({ spec }) => {
  const firstRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); spec.onCancel() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [spec])

  return (
    <div className="dialog-mask">
      <div className="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-msg">
        <h2 id="dialog-title">{spec.title}</h2>
        <div id="dialog-msg" className="dialog-msg">{spec.message}</div>
        <div className="dialog-buttons">
          {spec.buttons.map((b, i) => (
            <button
              key={b.label}
              ref={i === 0 ? firstRef : undefined}
              className={'btn btn-lg' + (b.kind === 'primary' ? ' btn-primary' : b.kind === 'danger' ? ' btn-danger-solid' : '')}
              onClick={b.onClick}
            >{b.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
