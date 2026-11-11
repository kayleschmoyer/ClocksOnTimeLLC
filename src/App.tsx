import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { CloseRequestInfo, NewRecordInput, Note, SortMode, Tab, WaitingListRecord } from './types'
import { useRecords } from './hooks/useRecords'
import { agingLevel } from './utils/agingFlag'
import { formatAgo, formatDate } from './utils/dateUtils'
import { describeSearch, EMPTY_SEARCH, isSearchActive, recordsForView, sortRecords, type SearchParams } from './utils/records'
import { ListScreen } from './components/ListScreen'
import { PrintSheet, type PrintJob } from './components/PrintSheet'
import { RecordScreen, type RecordScreenHandle } from './components/RecordScreen'
import { TopBar, ZOOM_LEVELS } from './components/TopBar'
import { Dialog, type DialogSpec } from './components/ui/Dialog'
import { Toast, type ToastSpec } from './components/ui/Toast'

type Screen = { kind: 'list' } | { kind: 'record'; id: number } | { kind: 'new'; number: number }

function readZoom(): number {
  try {
    const z = Number(localStorage.getItem('textZoom'))
    return (ZOOM_LEVELS as readonly number[]).includes(z) ? z : 1
  } catch {
    return 1
  }
}

export default function App() {
  const { records, loading, error, reload, createRecord, updateRecord, deleteRecord, restoreRecord } = useRecords()
  const [tab, setTab] = useState<Tab>('waiting')
  const [screen, setScreen] = useState<Screen>({ kind: 'list' })
  const [search, setSearch] = useState<SearchParams>(EMPTY_SEARCH)
  const [sort, setSort] = useState<SortMode>('number')
  const [toast, setToast] = useState<ToastSpec | null>(null)
  const [dialog, setDialog] = useState<DialogSpec | null>(null)
  const [printJob, setPrintJob] = useState<PrintJob | null>(null)
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null)
  const [zoom, setZoom] = useState<number>(readZoom)
  const formRef = useRef<RecordScreenHandle>(null)

  const say = useCallback((msg: string, extra?: Partial<ToastSpec>) => setToast({ id: Date.now(), msg, ...extra }), [])
  const clearToast = useCallback(() => setToast(null), [])

  useEffect(() => { window.electronAPI.backup.getLastTime().then(setLastBackupAt).catch(() => {}) }, [])

  useEffect(() => {
    window.electronAPI.setZoom?.(zoom)
    try { localStorage.setItem('textZoom', String(zoom)) } catch { /* not remembered; still applied */ }
  }, [zoom])

  // ——— What the list shows, and therefore what Previous/Next, Print and PDF use ———
  const visible = useMemo(() => sortRecords(recordsForView(records, tab, search), sort), [records, tab, search, sort])
  const live = useMemo(() => records.filter(r => !r.isDeleted), [records])
  const counts = useMemo(() => ({
    waiting: live.filter(r => r.status === 'Active').length,
    completed: live.filter(r => r.status === 'Complete').length,
  }), [live])
  const flagCounts = useMemo(() => {
    const active = live.filter(r => r.status === 'Active')
    return {
      yellow: active.filter(r => agingLevel(r) === 'yellow').length,
      red: active.filter(r => agingLevel(r) === 'red').length,
    }
  }, [live])

  // ——— Leaving a record with unsaved changes always asks first ———
  const guard = useCallback((action: () => void) => {
    if (!formRef.current?.isDirty()) { action(); return }
    setDialog({
      title: 'Save your changes?',
      message: 'You changed this record but have not saved it yet.',
      onCancel: () => setDialog(null),
      buttons: [
        { label: 'Save', kind: 'primary', onClick: async () => { setDialog(null); if (await formRef.current?.save()) action() } },
        { label: "Don't Save", onClick: () => { setDialog(null); action() } },
        { label: 'Cancel', onClick: () => setDialog(null) },
      ],
    })
  }, [])

  const goList = useCallback(() => guard(() => setScreen({ kind: 'list' })), [guard])
  const openRecord = useCallback((id: number) => guard(() => setScreen({ kind: 'record', id })), [guard])
  const changeTab = useCallback((t: Tab) => guard(() => { setTab(t); setSearch(EMPTY_SEARCH); setScreen({ kind: 'list' }) }), [guard])
  const newRecord = useCallback(() => guard(async () => {
    const number = await window.electronAPI.records.getNextNumber()
    setScreen({ kind: 'new', number })
  }), [guard])

  // ——— Backup ———
  const runBackup = useCallback(async (): Promise<boolean> => {
    const result = await window.electronAPI.backup.now()
    if (result.success) {
      setLastBackupAt(result.lastBackupAt ?? new Date().toISOString())
      say('Backup saved')
      return true
    }
    if (result.error) say(`The backup could not be saved. ${result.error}`, { kind: 'error' })
    return false
  }, [say])

  // ——— Closing the app: unsaved changes first, then the backup reminder ———
  const onCloseRequested = useRef<(info: CloseRequestInfo) => void>(() => {})
  onCloseRequested.current = (info) => guard(() => {
    if (!info.backupOverdue) { window.electronAPI.readyToQuit(); return }
    setDialog({
      title: 'Back up before closing?',
      message: (
        <>
          <p>{lastBackupAt ? <>Your last backup was <strong>{formatAgo(lastBackupAt)}</strong>.</> : <>You have not made a backup yet.</>}</p>
          <p>A backup is a copy of your waiting list. It protects your records if something happens to this computer.</p>
        </>
      ),
      onCancel: () => setDialog(null),
      buttons: [
        { label: 'Back Up Now', kind: 'primary', onClick: async () => { setDialog(null); if (await runBackup()) window.electronAPI.readyToQuit() } },
        { label: 'Close Without Backup', onClick: () => window.electronAPI.readyToQuit() },
        { label: 'Cancel', onClick: () => setDialog(null) },
      ],
    })
  })
  useEffect(() => window.electronAPI.onCloseRequested(info => onCloseRequested.current(info)), [])

  // ——— Print and PDF share one sheet ———
  const listJob = useCallback((): PrintJob => {
    const searching = isSearchActive(search)
    return {
      kind: 'list',
      title: tab === 'completed' ? 'Completed Records' : searching ? 'Waiting List Search Results' : 'Active Waiting List',
      detail: describeSearch(search, formatDate),
      records: visible,
    }
  }, [search, tab, visible])

  const print = useCallback((job: PrintJob) => {
    flushSync(() => setPrintJob(job))
    window.print()
  }, [])

  const savePdf = useCallback(async () => {
    const job = listJob()
    flushSync(() => setPrintJob(job))
    const result = await window.electronAPI.exportPdf(job.kind === 'list' ? job.title : 'Record')
    if (result.success) say('PDF saved')
    else if (result.error) say(`The PDF could not be saved. ${result.error}`, { kind: 'error' })
  }, [listJob, say])

  // ——— Record actions ———
  const current = screen.kind === 'record' ? records.find(r => r.id === screen.id) : undefined
  const index = current ? visible.findIndex(r => r.id === current.id) : -1

  const saveRecord = useCallback(async (input: NewRecordInput) => {
    try {
      if (screen.kind === 'record') {
        const updated = await updateRecord(screen.id, input)
        say(`Record ${updated.number} saved`)
      } else {
        const created = await createRecord(input)
        setScreen({ kind: 'record', id: created.id })
        say(`Record ${created.number} saved`)
      }
    } catch (e) {
      say(`The record could not be saved. ${e instanceof Error ? e.message : String(e)}`, { kind: 'error' })
      throw e
    }
  }, [screen, updateRecord, createRecord, say])

  const saveNotes = useCallback(async (notes: Note[]) => {
    if (screen.kind !== 'record') return
    await updateRecord(screen.id, { notes: JSON.stringify(notes) })
  }, [screen, updateRecord])

  const askDelete = useCallback((r: WaitingListRecord) => {
    setDialog({
      title: `Delete record ${r.number}?`,
      message: <>This removes <strong>{r.lastName}, {r.firstName}</strong> from your lists.</>,
      onCancel: () => setDialog(null),
      buttons: [
        { label: 'Cancel', onClick: () => setDialog(null) },
        {
          label: 'Delete Record', kind: 'danger', onClick: async () => {
            setDialog(null)
            await deleteRecord(r.id)
            setScreen({ kind: 'list' })
            say(`Record ${r.number} deleted`, { actionLabel: 'Undo', onAction: () => { restoreRecord(r.id) } })
          },
        },
      ],
    })
  }, [deleteRecord, restoreRecord, say])

  // ——— Render ———
  let body: React.ReactNode
  if (loading) {
    body = <div className="screen"><div className="card empty"><h2>Opening your waiting list…</h2></div></div>
  } else if (error) {
    body = (
      <div className="screen">
        <div className="card empty">
          <h2>Your waiting list could not be opened</h2>
          <p>{error}</p>
          <button className="btn btn-primary btn-lg" onClick={reload}>Try Again</button>
        </div>
      </div>
    )
  } else if (screen.kind === 'list' || (screen.kind === 'record' && !current)) {
    body = (
      <ListScreen
        tab={tab}
        records={visible}
        totalInTab={tab === 'waiting' ? counts.waiting : counts.completed}
        flagCounts={flagCounts}
        search={search}
        sort={sort}
        onSearch={setSearch}
        onClearSearch={() => setSearch(EMPTY_SEARCH)}
        onSort={setSort}
        onOpen={openRecord}
        onNew={newRecord}
        onPrint={() => print(listJob())}
        onPdf={savePdf}
      />
    )
  } else {
    body = (
      <RecordScreen
        key={screen.kind === 'record' ? `r${screen.id}` : 'new'}
        ref={formRef}
        record={current}
        newNumber={screen.kind === 'new' ? screen.number : undefined}
        position={index >= 0 ? {
          index, total: visible.length,
          label: isSearchActive(search) ? 'in your search results' : tab === 'completed' ? 'completed' : 'on the waiting list',
        } : null}
        onBack={goList}
        onPrev={index > 0 ? () => openRecord(visible[index - 1].id) : undefined}
        onNext={index >= 0 && index < visible.length - 1 ? () => openRecord(visible[index + 1].id) : undefined}
        onSave={saveRecord}
        onDelete={() => current && askDelete(current)}
        onPrint={record => print({ kind: 'record', record })}
        onSaveNotes={saveNotes}
      />
    )
  }

  return (
    <>
      <div className="app no-print">
        <TopBar tab={tab} counts={counts} lastBackupAt={lastBackupAt} zoom={zoom} onTab={changeTab} onBackup={runBackup} onZoom={setZoom} />
        <main className="main">{body}</main>
        {dialog && <Dialog spec={dialog} />}
        <Toast toast={toast} onClear={clearToast} />
      </div>
      <PrintSheet job={printJob} />
    </>
  )
}
