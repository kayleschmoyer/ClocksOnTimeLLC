import React from 'react'
import type { WaitingListRecord } from '../../types'
import { formatDate } from '../../utils/dateUtils'

interface PrintSearchResultsProps {
  records: WaitingListRecord[]
  searchDescription?: string
}

export const PrintSearchResults = React.forwardRef<HTMLDivElement, PrintSearchResultsProps>(
  ({ records, searchDescription }, ref) => {
    return (
      <div ref={ref} style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Clocks on Time LLC</h1>
          <h2 style={styles.subtitle}>Search Results</h2>
          {searchDescription && <p style={styles.searchDesc}>{searchDescription}</p>}
          <p style={styles.meta}>
            Printed: {new Date().toLocaleDateString()} &nbsp;|&nbsp; {records.length} Record{records.length !== 1 ? 's' : ''}
          </p>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              {['#', 'Last Name', 'First Name', 'Date Entered', 'Phone', 'Date Called', 'Clock Type', 'Status', 'Issue'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td style={styles.td}>{r.number}</td>
                <td style={styles.td}>{r.lastName}</td>
                <td style={styles.td}>{r.firstName}</td>
                <td style={styles.td}>{formatDate(r.dateEntered)}</td>
                <td style={styles.td}>{r.phoneNumber}</td>
                <td style={styles.td}>{formatDate(r.dateCalled)}</td>
                <td style={styles.td}>{r.clockType === 'Other' ? (r.customClockType ?? 'Other') : r.clockType}</td>
                <td style={styles.td}>
                  <span style={r.status === 'Active' ? styles.badgeActive : styles.badgeComplete}>
                    {r.status}
                  </span>
                </td>
                <td style={{ ...styles.td, maxWidth: 150 }}>{r.issue}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={styles.footer}>Clocks on Time LLC — Confidential</p>
      </div>
    )
  }
)
PrintSearchResults.displayName = 'PrintSearchResults'

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, Segoe UI, sans-serif',
    fontSize: 11,
    color: '#000',
    padding: '16px 20px',
  },
  header: {
    marginBottom: 16,
    borderBottom: '2px solid #181d26',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 600,
    margin: '2px 0',
    color: '#333',
  },
  searchDesc: {
    fontSize: 10,
    color: '#555',
    margin: '3px 0',
    fontStyle: 'italic',
  },
  meta: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 10,
  },
  th: {
    background: '#181d26',
    color: '#fff',
    fontWeight: 600,
    padding: '5px 6px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '4px 6px',
    borderBottom: '1px solid #eee',
    verticalAlign: 'top',
  },
  rowEven: { background: '#fff' },
  rowOdd: { background: '#f8fafc' },
  badgeActive: {
    background: '#dcfce7',
    color: '#166534',
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
  },
  badgeComplete: {
    background: '#e0e2e6',
    color: '#41454d',
    padding: '1px 5px',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 600,
  },
  footer: {
    marginTop: 16,
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
  },
}
