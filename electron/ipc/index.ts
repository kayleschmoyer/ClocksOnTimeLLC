import { registerRecordHandlers } from './recordHandlers'
import { registerSettingsHandlers } from './settingsHandlers'
import { registerBackupHandlers } from './backupHandlers'
import { registerPrintHandlers } from './printHandlers'

export function registerAllHandlers(): void {
  registerRecordHandlers()
  registerSettingsHandlers()
  registerBackupHandlers()
  registerPrintHandlers()
}
