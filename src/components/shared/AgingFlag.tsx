import React from 'react'
import { getAgingLevel, agingTooltip } from '../../utils/agingFlag'

interface AgingFlagProps {
  dateEntered: string
  status: 'Active' | 'Complete'
}

export const AgingFlag: React.FC<AgingFlagProps> = ({ dateEntered, status }) => {
  // Only show flags for Active records
  if (status === 'Complete') return null

  const level = getAgingLevel(dateEntered)
  if (level === 'fresh') return null

  const tooltip = agingTooltip(level, dateEntered)

  const dotStyle: React.CSSProperties =
    level === 'warning'
      ? { background: '#f59e0b', border: '1.5px solid #d97706' }
      : { background: '#ef4444', border: '1.5px solid #dc2626' }

  return (
    <span
      title={tooltip}
      aria-label={tooltip}
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        flexShrink: 0,
        ...dotStyle,
      }}
    />
  )
}
