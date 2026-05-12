import React from 'react'
import type { WaitingListRecord } from '../../types'
import { AgingFlag } from '../shared/AgingFlag'
import { formatDate } from '../../utils/dateUtils'

interface RecordRowProps {
  record: WaitingListRecord
  onOpen: (id: number) => void
}

export const RecordRow: React.FC<RecordRowProps> = ({ record, onOpen }) => {
  const clockDisplay = record.clockType === 'Other'
    ? (record.customClockType ?? 'Other')
    : record.clockType

  return (
    <tr style={styles.row}>
      <td style={{ ...styles.td, ...styles.flagCell }}>
        <AgingFlag dateEntered={record.dateEntered} status={record.status} />
      </td>
      <td style={{ ...styles.td, ...styles.numberCell }}>{record.number}</td>
      <td style={styles.td}>{record.lastName}</td>
      <td style={styles.td}>{record.firstName}</td>
      <td style={styles.td}>{formatDate(record.dateEntered)}</td>
      <td style={styles.td}>{record.phoneNumber}</td>
      <td style={styles.td}>{formatDate(record.dateCalled)}</td>
      <td style={styles.td}>{clockDisplay}</td>
      <td style={{ ...styles.td, ...styles.issueCell }} title={record.issue}>
        {record.issue.length > 55 ? record.issue.slice(0, 52) + '...' : record.issue}
      </td>
      <td style={styles.td}>
        <span className={`badge ${record.status === 'Active' ? 'badge-active' : 'badge-complete'}`}>
          {record.status}
        </span>
      </td>
      <td style={{ ...styles.td, ...styles.actionCell }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onOpen(record.id)}
        >
          Open
        </button>
      </td>
    </tr>
  )
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    borderBottom: '1px solid #f0f0f0',
  },
  td: {
    padding: '7px 10px',
    fontSize: 13,
    color: '#333840',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  flagCell: {
    width: 24,
    textAlign: 'center',
    padding: '7px 4px 7px 10px',
  },
  numberCell: {
    width: 44,
    fontWeight: 600,
    color: '#181d26',
  },
  issueCell: {
    whiteSpace: 'normal',
    maxWidth: 220,
    minWidth: 100,
  },
  actionCell: {
    width: 60,
    textAlign: 'center',
  },
}
