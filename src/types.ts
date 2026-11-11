export interface Note {
  id: number
  /** ISO timestamp. Older notes may hold a display string such as "May 10, 4:48 PM". */
  when: string
  body: string
  author?: string
  tag?: string | null
}

export interface WaitingListRecord {
  id: number
  number: number
  lastName: string
  firstName: string
  dateEntered: string        // 'YYYY-MM-DD'
  phoneNumber: string
  dateCalled: string | null  // 'YYYY-MM-DD' or null
  clockType: string
  customClockType: string | null
  issue: string
  notes: string              // JSON string of Note[]
  status: RecordStatus
  isDeleted: number          // 0 | 1
  createdAt: string
  updatedAt: string
}

export type RecordStatus = 'Active' | 'Complete'

export type NewRecordInput = Pick<WaitingListRecord,
  'lastName' | 'firstName' | 'dateEntered' | 'phoneNumber' |
  'dateCalled' | 'clockType' | 'customClockType' | 'issue' | 'status'>

export type UpdateRecordInput = Partial<NewRecordInput & Pick<WaitingListRecord, 'notes'>>

export type SortMode = 'number' | 'lastName' | 'dateEntered' | 'dateCalled'

export type Tab = 'waiting' | 'completed'

/** The dropdown the shop asked for. "Other" opens a blank to type into. */
export const CLOCK_TYPES = ['Cuckoo 2 wt.', 'Cuckoo 3 wt.', 'Wall Clock', 'Mantle Clock', 'Other'] as const

export interface CloseRequestInfo {
  backupOverdue: boolean
  reminderDays: number
}

export interface FileResult {
  success: boolean
  path?: string
  error?: string
  lastBackupAt?: string
}

export interface ElectronAPI {
  records: {
    getAll: () => Promise<WaitingListRecord[]>
    create: (input: NewRecordInput) => Promise<WaitingListRecord>
    update: (id: number, input: UpdateRecordInput) => Promise<WaitingListRecord>
    delete: (id: number) => Promise<void>
    restore: (id: number) => Promise<WaitingListRecord>
    getNextNumber: () => Promise<number>
  }
  backup: {
    now: () => Promise<FileResult>
    getLastTime: () => Promise<string | null>
  }
  exportPdf: (defaultName: string) => Promise<FileResult>
  setZoom: (factor: number) => void
  onCloseRequested: (callback: (info: CloseRequestInfo) => void) => () => void
  readyToQuit: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
