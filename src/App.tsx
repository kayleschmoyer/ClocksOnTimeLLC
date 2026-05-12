import React, { useState, useCallback, useEffect, useRef } from 'react'
import type { WaitingListRecord, Note, NewRecordInput, UpdateRecordInput } from './types'
import { useRecords } from './hooks/useRecords'
import { today } from './utils/dateUtils'
import { Ico } from './components/shared/Ico'
import { Toast } from './components/shared/Toast'
import { Sidebar } from './components/Sidebar'
import { MainScreen } from './components/MainScreen/MainScreen'
import { Detail } from './components/RecordDetail/RecordDetail'
import { RecordFormModal } from './components/RecordDetail/RecordForm'

export type SidebarTab = 'waiting' | 'completed' | 'reports'

export default function App() {
  const { records, loading, createRecord, updateRecord, deleteRecord } = useRecords()
  const [tab, setTab] = useState<SidebarTab>('waiting')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [nextNumber, setNextNumber] = useState<number | undefined>(undefined)
  const [toast, setToast] = useState('')
  const [backupReminderOpen, setBackupReminderOpen] = useState(false)

  const ding = useCallback((msg: string) => setToast(msg), [])

  useEffect(() => {
    const cleanup = window.electronAPI.onBackupReminder(() => setBackupReminderOpen(true))
    return cleanup
  }, [])

  const selected = selectedId != null ? records.find(r => r.id === selectedId) ?? null : null

  const counts = {
    waiting:   records.filter(r => !r.isDeleted && r.status === 'Active').length,
    completed: records.filter(r => !r.isDeleted && r.status === 'Complete').length,
    customers: new Set(records.filter(r => !r.isDeleted).map(r => r.lastName + r.phoneNumber)).size,
  }

  const handleAddNew = useCallback(async () => {
    const num = await window.electronAPI.records.getNextNumber()
    setNextNumber(num)
    setEditingId(null)
    setShowNew(true)
  }, [])

  const handleEdit = useCallback(async (id: number) => {
    setEditingId(id)
    setShowNew(true)
  }, [])

  const handleSave = useCallback(async (data: NewRecordInput | UpdateRecordInput) => {
    if (editingId) {
      await updateRecord(editingId, data as UpdateRecordInput)
      ding('Record updated')
    } else {
      const created = await createRecord(data as NewRecordInput)
      setSelectedId(created.id)
      ding(`Record #${String(created.number).padStart(3,'0')} added`)
    }
    setShowNew(false)
    setEditingId(null)
  }, [editingId, createRecord, updateRecord, ding])

  const handleDelete = useCallback(async (id: number) => {
    await deleteRecord(id)
    setSelectedId(null)
    ding('Record deleted')
  }, [deleteRecord, ding])

  const handleToggleCalled = useCallback(async (id: number) => {
    const rec = records.find(r => r.id === id)
    if (!rec) return
    await updateRecord(id, { dateCalled: rec.dateCalled ? null : today() })
  }, [records, updateRecord])

  const handleToggleComplete = useCallback(async (id: number) => {
    const rec = records.find(r => r.id === id)
    if (!rec) return
    await updateRecord(id, { status: rec.status === 'Complete' ? 'Active' : 'Complete' })
  }, [records, updateRecord])

  const handleAddNote = useCallback(async (id: number, body: string) => {
    const rec = records.find(r => r.id === id)
    if (!rec) return
    const existing: Note[] = JSON.parse(rec.notes || '[]')
    const newNote: Note = {
      id: Date.now(),
      author: 'Ron',
      when: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      body,
      tag: null,
    }
    await window.electronAPI.records.updateNotes(id, [...existing, newNote])
    // Refresh by updating local state via updateRecord
    await updateRecord(id, { notes: JSON.stringify([...existing, newNote]) })
  }, [records, updateRecord])

  const handleDeleteNote = useCallback(async (id: number, noteId: number) => {
    const rec = records.find(r => r.id === id)
    if (!rec) return
    const existing: Note[] = JSON.parse(rec.notes || '[]')
    const updated = existing.filter(n => n.id !== noteId)
    await updateRecord(id, { notes: JSON.stringify(updated) })
  }, [records, updateRecord])

  const handleBackup = useCallback(async () => {
    const result = await window.electronAPI.backup.now()
    if (result.success) {
      ding(`Backup saved · ${records.length} records`)
    } else if (result.error) {
      ding(`Backup failed: ${result.error}`)
    }
  }, [records.length, ding])

  const handleBackupReminderConfirm = useCallback(async () => {
    setBackupReminderOpen(false)
    const result = await window.electronAPI.backup.now()
    if (result.success) window.electronAPI.readyToQuit()
  }, [])

  const handleBackupReminderClose = useCallback(() => {
    setBackupReminderOpen(false)
    window.electronAPI.readyToQuit()
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 14, color: 'var(--ink-3)' }}>
        Loading…
      </div>
    )
  }

  const editRecord = editingId ? records.find(r => r.id === editingId) : undefined

  return (
    <div className="shell">
      <Sidebar tab={tab} setTab={setTab} counts={counts} />

      <main className="main">
        <MainScreen
          records={records}
          tab={tab}
          selectedId={selectedId}
          onSelectRecord={setSelectedId}
          onAddNew={handleAddNew}
          onBackup={handleBackup}
        />

        {selected && (
          <Detail
            record={selected}
            records={records.filter(r => !r.isDeleted && r.status === (tab === 'completed' ? 'Complete' : 'Active'))}
            onClose={() => setSelectedId(null)}
            onNavigate={setSelectedId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleCalled={handleToggleCalled}
            onToggleComplete={handleToggleComplete}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
      </main>

      {showNew && (
        <RecordFormModal
          editRecord={editRecord}
          nextNumber={nextNumber}
          onSave={handleSave}
          onClose={() => { setShowNew(false); setEditingId(null) }}
        />
      )}

      {/* Backup reminder */}
      {backupReminderOpen && (
        <div className="modal-mask open" onClick={() => setBackupReminderOpen(false)}>
          <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="ico"><Ico name="backup" /></div>
              <div>
                <div className="modal-title">Database Backup Reminder</div>
                <div className="modal-sub">It has been more than 7 days since your last backup.</div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn" onClick={() => setBackupReminderOpen(false)}>Cancel</button>
              <button className="btn" onClick={handleBackupReminderClose}>Close Without Backup</button>
              <button className="btn btn-primary" onClick={handleBackupReminderConfirm}>
                <Ico name="backup" size={14} />Backup Now
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} onClear={() => setToast('')} />
    </div>
  )
}
