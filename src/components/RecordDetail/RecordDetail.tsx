import React, { useState, useRef, useCallback } from 'react'
import { useReactToPrint } from 'react-to-print'
import type { WaitingListRecord, UpdateRecordInput, NavContext } from '../../types'
import { useNavigation } from '../../hooks/useNavigation'
import { today, formatDate } from '../../utils/dateUtils'
import { AgingFlag } from '../shared/AgingFlag'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { Button } from '../shared/Button'
import { RecordForm } from './RecordForm'
import { PrintRecord } from '../Print/PrintRecord'

interface RecordDetailProps {
  record: WaitingListRecord
  navList: WaitingListRecord[]     // list this record belongs to (for prev/next)
  navContext: NavContext
  onUpdate: (id: number, input: UpdateRecordInput) => Promise<WaitingListRecord>
  onDelete: (id: number) => Promise<void>
  onNavigate: (id: number) => void  // navigate to another record
  onBack: () => void
}

export const RecordDetail: React.FC<RecordDetailProps> = ({
  record,
  navList,
  navContext,
  onUpdate,
  onDelete,
  onNavigate,
  onBack,
}) => {
  const [editing, setEditing] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [pendingNav, setPendingNav] = useState<'prev' | 'next' | 'back' | null>(null)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Record-${record.number}-${record.lastName}`,
  })

  const nav = useNavigation(navList, record.id)

  const clockDisplay = record.clockType === 'Other'
    ? (record.customClockType ?? 'Other')
    : record.clockType

  // Try to navigate — if dirty, show warning first
  const tryNavigate = useCallback((direction: 'prev' | 'next' | 'back') => {
    if (editing && isDirty) {
      setPendingNav(direction)
      setShowUnsavedDialog(true)
    } else {
      doNavigate(direction)
    }
  }, [editing, isDirty, nav])

  const doNavigate = (direction: 'prev' | 'next' | 'back') => {
    setEditing(false)
    setIsDirty(false)
    if (direction === 'back') {
      onBack()
    } else if (direction === 'prev' && nav.prevId != null) {
      onNavigate(nav.prevId)
    } else if (direction === 'next' && nav.nextId != null) {
      onNavigate(nav.nextId)
    }
  }

  const handleMarkAsCalled = async () => {
    await onUpdate(record.id, { dateCalled: today() })
  }

  const handleMarkComplete = async () => {
    if (!record.dateCalled) {
      setShowCompleteDialog(true)
    } else {
      await onUpdate(record.id, { status: 'Complete' })
    }
  }

  const handleMarkActive = async () => {
    await onUpdate(record.id, { status: 'Active' })
  }

  const handleDelete = async () => {
    await onDelete(record.id)
    onBack()
  }

  const handleFormSave = async (data: UpdateRecordInput) => {
    await onUpdate(record.id, data)
    setEditing(false)
    setIsDirty(false)
  }

  const handleFormCancel = () => {
    setEditing(false)
    setIsDirty(false)
  }

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <Button variant="secondary" size="sm" onClick={() => tryNavigate('back')}>
            ← Back to List
          </Button>
          <span style={styles.navContext}>
            {navContext === 'searchResults' ? 'Search Results' : 'Active List'}
          </span>
        </div>

        <div style={styles.navBlock}>
          <Button
            variant="secondary"
            size="sm"
            disabled={!nav.hasPrev}
            onClick={() => tryNavigate('prev')}
          >
            ← Prev
          </Button>
          <span style={styles.navPos}>
            {nav.currentIndex + 1} / {nav.total}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={!nav.hasNext}
            onClick={() => tryNavigate('next')}
          >
            Next →
          </Button>
        </div>

        <div style={styles.topRight}>
          {!editing && (
            <>
              {record.status === 'Active' && (
                <>
                  {!record.dateCalled && (
                    <Button variant="secondary" size="sm" onClick={handleMarkAsCalled}>
                      Mark as Called
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={handleMarkComplete}>
                    Mark Complete
                  </Button>
                </>
              )}
              {record.status === 'Complete' && (
                <Button variant="secondary" size="sm" onClick={handleMarkActive}>
                  Mark Active
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={handlePrint}>
                🖨 Print
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" size="sm" onClick={() => setShowDeleteDialog(true)}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Record header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.recordNum}>Record #{record.number}</span>
          <AgingFlag dateEntered={record.dateEntered} status={record.status} />
          <span className={`badge ${record.status === 'Active' ? 'badge-active' : 'badge-complete'}`}>
            {record.status}
          </span>
        </div>
        <div style={styles.headerName}>
          {record.lastName}, {record.firstName}
        </div>
      </div>

      {editing ? (
        <RecordForm
          mode="edit"
          record={record}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          onDirtyChange={setIsDirty}
        />
      ) : (
        <div style={styles.fields}>
          <div style={styles.fieldGrid}>
            <FieldRow label="Date Entered" value={formatDate(record.dateEntered)} />
            <FieldRow label="Phone Number" value={record.phoneNumber || '—'} />
            <FieldRow label="Date Called" value={formatDate(record.dateCalled)} />
            <FieldRow label="Clock Type" value={clockDisplay} />
          </div>
          <div style={styles.issueBlock}>
            <span style={styles.issueLabel}>Issue</span>
            <p style={styles.issueText}>{record.issue || '—'}</p>
          </div>
        </div>
      )}

      {/* Hidden print target */}
      <div style={{ display: 'none' }}>
        <PrintRecord ref={printRef} record={record} />
      </div>

      {/* Unsaved changes dialog */}
      <ConfirmDialog
        isOpen={showUnsavedDialog}
        title="Unsaved Changes"
        message="You have unsaved changes. If you leave now, your changes will be lost."
        confirmLabel="Leave Without Saving"
        cancelLabel="Stay and Edit"
        variant="danger"
        onConfirm={() => {
          setShowUnsavedDialog(false)
          if (pendingNav) doNavigate(pendingNav)
          setPendingNav(null)
        }}
        onCancel={() => {
          setShowUnsavedDialog(false)
          setPendingNav(null)
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Record"
        message={`Are you sure you want to delete Record #${record.number} — ${record.lastName}, ${record.firstName}? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          setShowDeleteDialog(false)
          handleDelete()
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />

      {/* Mark complete without date called */}
      <ConfirmDialog
        isOpen={showCompleteDialog}
        title="Mark as Complete"
        message="This record has no Date Called. Do you still want to mark it Complete?"
        confirmLabel="Yes, Mark Complete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          setShowCompleteDialog(false)
          await onUpdate(record.id, { status: 'Complete' })
        }}
        onCancel={() => setShowCompleteDialog(false)}
      />
    </div>
  )
}

const FieldRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={fieldRowStyles.row}>
    <span style={fieldRowStyles.label}>{label}</span>
    <span style={fieldRowStyles.value}>{value}</span>
  </div>
)

const fieldRowStyles: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9297a0',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  value: {
    fontSize: 14,
    color: '#181d26',
  },
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f8fafc',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: '#ffffff',
    borderBottom: '1px solid #dddddd',
    flexShrink: 0,
    gap: 12,
  },
  topLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  navContext: {
    fontSize: 12,
    color: '#9297a0',
  },
  navBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  navPos: {
    fontSize: 13,
    color: '#41454d',
    minWidth: 50,
    textAlign: 'center',
  },
  topRight: {
    display: 'flex',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px',
    background: '#ffffff',
    borderBottom: '1px solid #dddddd',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  recordNum: {
    fontSize: 16,
    fontWeight: 600,
    color: '#181d26',
  },
  headerName: {
    fontSize: 20,
    fontWeight: 500,
    color: '#181d26',
  },
  fields: {
    overflowY: 'auto',
    flex: 1,
  },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    background: '#ffffff',
    borderBottom: '1px solid #dddddd',
  },
  issueBlock: {
    padding: '16px 20px',
    background: '#ffffff',
    marginTop: 8,
  },
  issueLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9297a0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    display: 'block',
    marginBottom: 6,
  },
  issueText: {
    fontSize: 14,
    color: '#181d26',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
  },
}
