import React from 'react'
import type { WaitingListRecord } from '../../types'
import { RecordRow } from './RecordRow'

interface RecordTableProps {
  records: WaitingListRecord[]
  onOpenRecord: (id: number) => void
  isSearchActive: boolean
}

export const RecordTable: React.FC<RecordTableProps> = ({
  records,
  onOpenRecord,
  isSearchActive,
}) => {
  if (records.length === 0) {
    return (
      <div style={styles.empty}>
        {isSearchActive
          ? 'No records match your search.'
          : 'No active records. Click "Add New Record" to get started.'}
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={{ ...styles.th, width: 24 }}></th>
            <th style={{ ...styles.th, width: 44 }}>#</th>
            <th style={styles.th}>Last Name</th>
            <th style={styles.th}>First Name</th>
            <th style={styles.th}>Date Entered</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Date Called</th>
            <th style={styles.th}>Clock Type</th>
            <th style={{ ...styles.th, minWidth: 120 }}>Issue</th>
            <th style={styles.th}>Status</th>
            <th style={{ ...styles.th, width: 60 }}></th>
          </tr>
        </thead>
        <tbody>
          {records.map(r => (
            <RecordRow
              key={r.id}
              record={r}
              onOpen={onOpenRecord}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'auto',
  },
  headerRow: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  th: {
    padding: '8px 10px',
    fontSize: 11,
    fontWeight: 600,
    color: '#41454d',
    textAlign: 'left',
    background: '#f8fafc',
    borderBottom: '2px solid #dddddd',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9297a0',
    fontSize: 14,
    padding: 40,
  },
}
