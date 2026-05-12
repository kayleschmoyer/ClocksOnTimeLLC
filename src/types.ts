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
  status: 'Active' | 'Complete'
  isDeleted: number          // 0 | 1
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  id: number
  lastBackupAt: string | null
  backupReminderDays: number
}

export type NewRecordInput = Omit<WaitingListRecord,
  'id' | 'number' | 'isDeleted' | 'createdAt' | 'updatedAt'>

export type UpdateRecordInput = Partial<Pick<WaitingListRecord,
  'lastName' | 'firstName' | 'dateEntered' | 'phoneNumber' |
  'dateCalled' | 'clockType' | 'customClockType' | 'issue' | 'status'>>

export type SortMode = 'number' | 'lastName' | 'dateEntered' | 'dateCalled'

export type StatusFilter = 'Active' | 'Complete' | 'All'

export type NavContext = 'activeList' | 'searchResults'

export const CLOCK_TYPES = [
  'Cuckoo 2 wt.',
  'Cuckoo 3 wt.',
  'Wall Clock',
  'Mantle Clock',
  'Other',
] as const

export type ClockType = typeof CLOCK_TYPES[number]

export interface ElectronAPI {
  records: {
    getAll: () => Promise<WaitingListRecord[]>
    create: (input: NewRecordInput) => Promise<WaitingListRecord>
    update: (id: number, input: UpdateRecordInput) => Promise<WaitingListRecord>
    delete: (id: number) => Promise<void>
    getNextNumber: () => Promise<number>
  }
  settings: {
    get: () => Promise<AppSettings>
    update: (input: Partial<AppSettings>) => Promise<AppSettings>
  }
  backup: {
    now: () => Promise<{ success: boolean; path?: string; error?: string }>
    getLastTime: () => Promise<string | null>
  }
  print: {
    dialog: () => Promise<void>
  }
  onBackupReminder: (callback: () => void) => () => void
  readyToQuit: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
