import type { WaitingListRecord } from '../types'
import { daysSince } from './dateUtils'

export type AgingLevel = 'none' | 'yellow' | 'red'

/** Yellow at 45–75 days since the date entered, red after 75. */
export function agingLevelForDays(days: number): AgingLevel {
  if (days > 75) return 'red'
  if (days >= 45) return 'yellow'
  return 'none'
}

/** Completed records are never flagged. */
export function agingLevel(record: Pick<WaitingListRecord, 'dateEntered' | 'status'>, now?: Date): AgingLevel {
  if (record.status === 'Complete') return 'none'
  return agingLevelForDays(daysSince(record.dateEntered, now))
}
