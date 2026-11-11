import { ipcMain, dialog, BrowserWindow } from 'electron'
import { existsSync, renameSync, rmSync } from 'fs'
import { getDb } from '../db/database'
import { getSettings, updateSettings } from '../db/settings'

export function registerBackupHandlers(): void {
  ipcMain.handle('backup:now', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)

    const result = await dialog.showSaveDialog(win!, {
      title: 'Save a Backup Copy',
      defaultPath: `waitinglist-backup-${todayString()}.db`,
      filters: [{ name: 'Waiting List Backup', extensions: ['db'] }],
    })

    if (result.canceled || !result.filePath) {
      return { success: false }
    }

    // VACUUM INTO refuses to write over an existing file, so write a
    // temporary copy next to the target and swap it in once it is complete.
    const target = result.filePath
    const temp = `${target}.tmp-${Date.now()}`
    try {
      getDb().exec(`VACUUM INTO '${temp.replace(/'/g, "''")}'`)
      renameSync(temp, target)
      const lastBackupAt = new Date().toISOString()
      updateSettings({ lastBackupAt })
      return { success: true, path: target, lastBackupAt }
    } catch (err) {
      if (existsSync(temp)) rmSync(temp, { force: true })
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle('backup:getLastTime', () => getSettings().lastBackupAt)
}

function todayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
