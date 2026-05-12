import { daysSince } from './dateUtils'

export type AgingLevel = 'fresh' | 'warning' | 'critical'

export function getAgingLevel(dateEntered: string): AgingLevel {
  const days = daysSince(dateEntered)
  if (days <= 44) return 'fresh'
  if (days <= 75) return 'warning'
  return 'critical'
}

export function agingTooltip(level: AgingLevel, dateEntered: string): string {
  const days = daysSince(dateEntered)
  if (level === 'warning') return `${days} days since entered (45–75 days)`
  if (level === 'critical') return `${days} days since entered (76+ days)`
  return `${days} days since entered`
}
