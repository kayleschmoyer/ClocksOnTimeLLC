import React from 'react'

interface IcoProps {
  name: string
  size?: number
  stroke?: number
}

export const Ico: React.FC<IcoProps> = ({ name, size = 16, stroke = 1.6 }) => {
  const s: React.CSSProperties = { width: size, height: size }
  const p = { fill: 'none' as const, stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (name) {
    case 'clock':    return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="9" {...p}/><path d="M12 7v5l3.5 2.2" {...p}/></svg>
    case 'list':     return <svg viewBox="0 0 24 24" style={s}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" {...p}/></svg>
    case 'check':    return <svg viewBox="0 0 24 24" style={s}><path d="M4 12.5l5 5L20 6.5" {...p}/></svg>
    case 'people':   return <svg viewBox="0 0 24 24" style={s}><circle cx="9" cy="8" r="3.2" {...p}/><path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6" {...p}/><circle cx="17" cy="9" r="2.6" {...p}/><path d="M14.5 14.5c2.7.4 5 2.5 5 5" {...p}/></svg>
    case 'doc':      return <svg viewBox="0 0 24 24" style={s}><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" {...p}/><path d="M14 3v5h5" {...p}/></svg>
    case 'gear':     return <svg viewBox="0 0 24 24" style={s}><circle cx="12" cy="12" r="3" {...p}/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.86l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.86-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.86.34l-.06.06A2 2 0 1 1 4.3 16.93l.06-.06a1.7 1.7 0 0 0 .34-1.86 1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.86l-.06-.06A2 2 0 1 1 7.07 4.3l.06.06a1.7 1.7 0 0 0 1.86.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.86-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.86V9c.34.5.92.84 1.55 1H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" {...p}/></svg>
    case 'plus':     return <svg viewBox="0 0 24 24" style={s}><path d="M12 5v14M5 12h14" {...p}/></svg>
    case 'search':   return <svg viewBox="0 0 24 24" style={s}><circle cx="11" cy="11" r="7" {...p}/><path d="M20 20l-3.5-3.5" {...p}/></svg>
    case 'filter':   return <svg viewBox="0 0 24 24" style={s}><path d="M4 5h16l-6 8v6l-4-2v-4z" {...p}/></svg>
    case 'print':    return <svg viewBox="0 0 24 24" style={s}><path d="M7 9V4h10v5M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z" {...p}/></svg>
    case 'export':   return <svg viewBox="0 0 24 24" style={s}><path d="M12 3v12M7 8l5-5 5 5M5 21h14" {...p}/></svg>
    case 'backup':   return <svg viewBox="0 0 24 24" style={s}><path d="M21 12a9 9 0 1 1-3-6.7" {...p}/><path d="M21 4v5h-5" {...p}/></svg>
    case 'phone':    return <svg viewBox="0 0 24 24" style={s}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z" {...p}/></svg>
    case 'chev-r':   return <svg viewBox="0 0 24 24" style={s}><path d="M9 6l6 6-6 6" {...p}/></svg>
    case 'chev-l':   return <svg viewBox="0 0 24 24" style={s}><path d="M15 6l-6 6 6 6" {...p}/></svg>
    case 'chev-d':   return <svg viewBox="0 0 24 24" style={s}><path d="M6 9l6 6 6-6" {...p}/></svg>
    case 'close':    return <svg viewBox="0 0 24 24" style={s}><path d="M6 6l12 12M18 6L6 18" {...p}/></svg>
    case 'edit':     return <svg viewBox="0 0 24 24" style={s}><path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" {...p}/></svg>
    case 'more':     return <svg viewBox="0 0 24 24" style={s}><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></svg>
    case 'trash':    return <svg viewBox="0 0 24 24" style={s}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" {...p}/></svg>
    case 'calendar': return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="5" width="18" height="16" rx="2" {...p}/><path d="M3 9h18M8 3v4M16 3v4" {...p}/></svg>
    case 'arrow-r':  return <svg viewBox="0 0 24 24" style={s}><path d="M5 12h14M13 6l6 6-6 6" {...p}/></svg>
    default: return null
  }
}
