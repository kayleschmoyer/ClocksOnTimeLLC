import React, { useState, useCallback, useEffect } from 'react'
import type { WaitingListRecord, NewRecordInput, UpdateRecordInput, NavContext } from './types'
import { useRecords } from './hooks/useRecords'
import { useSearch, defaultSearchParams } from './hooks/useSearch'
import { useSort } from './hooks/useSort'
import { today } from './utils/dateUtils'
import { MainScreen } from './components/MainScreen/MainScreen'
import { RecordDetail } from './components/RecordDetail/RecordDetail'
import { RecordForm } from './components/RecordDetail/RecordForm'
import { ConfirmDialog } from './components/shared/ConfirmDialog'

type AppView = 'list' | 'detail' | 'new'

export default function App() {
  const { records, loading, createRecord, updateRecord, deleteRecord } = useRecords()

  const [view, setView] = useState<AppView>('list')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [navContext, setNavContext] = useState<NavContext>('activeList')
  const [navList, setNavList] = useState<WaitingListRecord[]>([])
  const [backupReminderOpen, setBackupReminderOpen] = useState(false)
  const [nextNumber, setNextNumber] = useState<number | undefined>(undefined)

  // Register backup reminder listener from main process
  useEffect(() => {
    const cleanup = window.electronAPI.onBackupReminder(() => {
      setBackupReminderOpen(true)
    })
    return cleanup
  }, [])

  // Active records list (for use in nav context)
  const activeRecords = useSearch(records, { ...defaultSearchParams, statusFilter: 'Active' })
  const sortedActiveRecords = useSort(activeRecords, 'number')

  const selectedRecord = selectedId != null
    ? records.find(r => r.id === selectedId) ?? null
    : null

  const handleAddNew = useCallback(async () => {
    const num = await window.electronAPI.records.getNextNumber()
    setNextNumber(num)
    setView('new')
  }, [])

  const handleOpenRecord = useCallback((id: number, context: NavContext, list: WaitingListRecord[]) => {
    setSelectedId(id)
    setNavContext(context)
    setNavList(list)
    setView('detail')
  }, [])

  const handleNavigate = useCallback((id: number) => {
    setSelectedId(id)
  }, [])

  const handleBack = useCallback(() => {
    setView('list')
    setSelectedId(null)
  }, [])

  const handleNewSave = useCallback(async (data: NewRecordInput) => {
    const created = await createRecord(data)
    setSelectedId(created.id)
    setNavContext('activeList')
    setView('detail')
  }, [createRecord])

  const handleBackup = useCallback(async () => {
    const result = await window.electronAPI.backup.now()
    if (result.success) {
      alert(`Backup saved to:\n${result.path}`)
    } else if (result.error) {
      alert(`Backup failed: ${result.error}`)
    }
  }, [])

  const handleBackupReminderConfirm = useCallback(async () => {
    setBackupReminderOpen(false)
    const result = await window.electronAPI.backup.now()
    if (result.success) {
      window.electronAPI.readyToQuit()
    } else {
      // Backup failed or was cancelled — stay open
    }
  }, [])

  const handleBackupReminderClose = useCallback(() => {
    setBackupReminderOpen(false)
    window.electronAPI.readyToQuit()
  }, [])

  const handleBackupReminderCancel = useCallback(() => {
    setBackupReminderOpen(false)
    // Don't quit — user cancelled
  }, [])

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading...
      </div>
    )
  }

  return (
    <div style={styles.app}>
      {view === 'list' && (
        <MainScreen
          records={records}
          onAddNew={handleAddNew}
          onOpenRecord={handleOpenRecord}
          onBackup={handleBackup}
        />
      )}

      {view === 'new' && (
        <div style={styles.newForm}>
          <div style={styles.newFormHeader}>
            <h2 style={styles.newFormTitle}>
              Add New Record — #{nextNumber ?? '...'}
            </h2>
            <span style={{ fontSize: 13, color: '#9297a0' }}>
              Today: {today()}
            </span>
          </div>
          <RecordForm
            mode="new"
            nextNumber={nextNumber}
            onSave={handleNewSave as (data: NewRecordInput | UpdateRecordInput) => Promise<void>}
            onCancel={handleBack}
          />
        </div>
      )}

      {view === 'detail' && selectedRecord && (
        <RecordDetail
          record={selectedRecord}
          navList={navContext === 'searchResults' ? navList : sortedActiveRecords}
          navContext={navContext}
          onUpdate={updateRecord}
          onDelete={deleteRecord}
          onNavigate={handleNavigate}
          onBack={handleBack}
        />
      )}

      {/* Backup reminder dialog */}
      <ConfirmDialog
        isOpen={backupReminderOpen}
        title="Database Backup Reminder"
        message="It has been more than 7 days since your last backup. Would you like to back up your database before closing?"
        confirmLabel="Backup Now"
        cancelLabel="Cancel"
        thirdLabel="Close Without Backup"
        onConfirm={handleBackupReminderConfirm}
        onCancel={handleBackupReminderCancel}
        onThird={handleBackupReminderClose}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    fontSize: 14,
    color: '#9297a0',
  },
  newForm: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f8fafc',
    overflow: 'hidden',
  },
  newFormHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: '#ffffff',
    borderBottom: '1px solid #dddddd',
    flexShrink: 0,
  },
  newFormTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#181d26',
    margin: 0,
  },
}
