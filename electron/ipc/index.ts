import { registerRecordHandlers } from './recordHandlers'
import { registerBackupHandlers } from './backupHandlers'
import { registerExportHandlers } from './exportHandlers'

export function registerAllHandlers(): void {
  registerRecordHandlers()
  registerBackupHandlers()
  registerExportHandlers()
}
