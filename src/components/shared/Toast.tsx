import React, { useEffect } from 'react'
import { Ico } from './Ico'

interface ToastProps {
  msg: string
  onClear: () => void
}

export const Toast: React.FC<ToastProps> = ({ msg, onClear }) => {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(onClear, 2600)
    return () => clearTimeout(t)
  }, [msg, onClear])

  return (
    <div className={'toast' + (msg ? ' show' : '')} role="status" aria-live="polite">
      {msg && <><span className="ico"><Ico name="check" size={14} /></span>{msg}</>}
    </div>
  )
}
