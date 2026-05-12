import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import type { WaitingListRecord } from '../../types'
import { Button } from '../shared/Button'
import { PrintActiveList } from '../Print/PrintActiveList'
import { exportSearchResultsToPDF } from '../../utils/pdfExport'

interface ToolbarProps {
  activeRecords: WaitingListRecord[]
  searchResults: WaitingListRecord[]
  isSearchActive: boolean
  onAddNew: () => void
  onBackup: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeRecords,
  searchResults,
  isSearchActive,
  onAddNew,
  onBackup,
}) => {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Clocks on Time LLC — Active Waiting List',
  })

  const handleExportPDF = () => {
    const records = isSearchActive ? searchResults : activeRecords
    const title = isSearchActive ? 'Search Results' : 'Active Waiting List'
    exportSearchResultsToPDF(records, title)
  }

  return (
    <>
      <div style={styles.toolbar}>
        <div style={styles.titleBlock}>
          <h1 style={styles.appTitle}>Clocks on Time LLC</h1>
          <span style={styles.appSubtitle}>Waiting List Database</span>
        </div>

        <div style={styles.actions}>
          <Button variant="primary" onClick={onAddNew}>
            + Add New Record
          </Button>
          <Button variant="secondary" onClick={handlePrint} title="Print the active waiting list">
            🖨 Print Active List
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportPDF}
            title={isSearchActive ? 'Export search results to PDF' : 'Export active list to PDF'}
          >
            ↓ Export PDF
          </Button>
          <Button variant="secondary" onClick={onBackup} title="Back up database to a file">
            💾 Backup Database
          </Button>
        </div>
      </div>

      {/* Hidden print target */}
      <div style={{ display: 'none' }}>
        <PrintActiveList ref={printRef} records={activeRecords} />
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: '#ffffff',
    borderBottom: '1px solid #dddddd',
    flexShrink: 0,
  },
  titleBlock: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#181d26',
    margin: 0,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#9297a0',
  },
  actions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
}
