import React from 'react'
import type { WaitingListRecord } from '../../types'
import { formatDate } from '../../utils/dateUtils'

interface PrintRecordProps {
  record: WaitingListRecord
}

export const PrintRecord = React.forwardRef<HTMLDivElement, PrintRecordProps>(
  ({ record }, ref) => {
    const clockDisplay = record.clockType === 'Other'
      ? (record.customClockType ?? 'Other')
      : record.clockType

    return (
      <div ref={ref} style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Clocks on Time LLC</h1>
          <p style={styles.meta}>Printed: {new Date().toLocaleDateString()}</p>
        </div>

        <h2 style={styles.recordTitle}>
          Waiting List Record #{record.number}
        </h2>

        <table style={styles.table}>
          <tbody>
            <Field label="Status" value={record.status} />
            <Field label="Last Name" value={record.lastName} />
            <Field label="First Name" value={record.firstName} />
            <Field label="Phone Number" value={record.phoneNumber} />
            <Field label="Date Entered" value={formatDate(record.dateEntered)} />
            <Field label="Date Called" value={formatDate(record.dateCalled)} />
            <Field label="Clock Type" value={clockDisplay} />
            <Field label="Issue" value={record.issue} />
          </tbody>
        </table>

        <p style={styles.footer}>Clocks on Time LLC — Confidential</p>
      </div>
    )
  }
)
PrintRecord.displayName = 'PrintRecord'

const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <tr>
    <td style={styles.label}>{label}</td>
    <td style={styles.value}>{value || '—'}</td>
  </tr>
)

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, Segoe UI, sans-serif',
    fontSize: 12,
    color: '#000',
    padding: '20px 24px',
    maxWidth: 600,
  },
  header: {
    borderBottom: '2px solid #181d26',
    paddingBottom: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
  },
  meta: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 14,
    color: '#181d26',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 11,
  },
  label: {
    fontWeight: 600,
    padding: '5px 12px 5px 0',
    width: 120,
    verticalAlign: 'top',
    color: '#555',
    borderBottom: '1px solid #eee',
  },
  value: {
    padding: '5px 0',
    verticalAlign: 'top',
    borderBottom: '1px solid #eee',
  },
  footer: {
    marginTop: 20,
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
}
