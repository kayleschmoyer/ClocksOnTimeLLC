import React from 'react'
import type { WaitingListRecord } from '../../types'
import { agingLevel } from '../../utils/agingFlag'
import { daysSince } from '../../utils/dateUtils'

/** Yellow or red marker shown beside the record number. Says the day count so it never relies on colour alone. */
export const Flag: React.FC<{ record: Pick<WaitingListRecord, 'dateEntered' | 'status'>; long?: boolean }> = ({ record, long }) => {
  const level = agingLevel(record)
  if (level === 'none') return null
  const days = daysSince(record.dateEntered)
  return (
    <span className={`flag flag-${level}`} title={level === 'red' ? 'Waiting more than 75 days' : 'Waiting 45 to 75 days'}>
      {long ? `Waiting ${days} days` : `${days} days`}
    </span>
  )
}
