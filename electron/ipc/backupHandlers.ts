import { ipcMain, dialog, BrowserWindow } from 'electron'
import { getDb, getDbPath } from '../db/database'
import { updateSettings } from '../db/settings'

export function registerBackupHandlers(): void {
  ipcMain.handle('backup:now', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const dbPath = getDbPath()

    const result = await dialog.showSaveDialog(win!, {
      title: 'Save Database Backup',
      defaultPath: `waitinglist-backup-${todayString()}.db`,
      filters: [{ name: 'SQLite Database', extensions: ['db'] }],
    })

    if (result.canceled || !result.filePath) {
      return { success: false }
    }

    try {
      const db = getDb()
      // VACUUM INTO creates a clean backup even in WAL mode
      db.exec(`VACUUM INTO '${result.filePath.replace(/'/g, "''")}'`)
      updateSettings({ lastBackupAt: new Date().toISOString() })
      return { success: true, path: result.filePath }
    } catch (err) {
      return { success: false, error: String(err) }
    }
  })

  ipcMain.handle('backup:getLastTime', () => {
    const { getSettings } = require('../db/settings')
    return getSettings().lastBackupAt
  })
}

function todayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
