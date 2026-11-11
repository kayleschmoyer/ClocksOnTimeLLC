import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { registerAllHandlers } from './ipc'
import { getSettings } from './db/settings'
import { getDb } from './db/database'

let mainWindow: BrowserWindow | null = null
let closeConfirmed = false
let closeAckTimer: NodeJS.Timeout | null = null

function isBackupOverdue(): boolean {
  const settings = getSettings()
  const { n } = getDb().prepare('SELECT COUNT(*) AS n FROM records').get() as { n: number }
  if (n === 0) return false
  if (!settings.lastBackupAt) return true
  const age = Date.now() - new Date(settings.lastBackupAt).getTime()
  return age > settings.backupReminderDays * 24 * 60 * 60 * 1000
}

function buildMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    { label: 'File', submenu: [{ role: 'quit', label: 'Exit' }] },
    {
      label: 'View',
      submenu: [
        { role: 'zoomIn', label: 'Larger Text' },
        { role: 'zoomOut', label: 'Smaller Text' },
        { role: 'resetZoom', label: 'Normal Text Size' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Full Screen' },
        ...(app.isPackaged ? [] : [{ type: 'separator' as const }, { role: 'toggleDevTools' as const }, { role: 'reload' as const }]),
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

function createWindow(): void {
  closeConfirmed = false
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 640,
    title: 'Clocks on Time LLC — Waiting List',
    backgroundColor: '#f7f5f0',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/public/index.html'))
  }

  // Closing goes through the window so unsaved edits and an overdue backup
  // are both checked, whichever way the user closes the app.
  mainWindow.on('close', (event) => {
    if (closeConfirmed || !mainWindow) return
    const wc = mainWindow.webContents
    if (wc.isCrashed() || wc.isLoading()) return

    event.preventDefault()
    wc.send('app:close-requested', { backupOverdue: isBackupOverdue(), reminderDays: getSettings().backupReminderDays })

    // If the page never answers, do not trap the user in the app.
    if (closeAckTimer) clearTimeout(closeAckTimer)
    closeAckTimer = setTimeout(() => {
      closeConfirmed = true
      mainWindow?.close()
    }, 2000)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.on('app:close-ack', () => {
  if (closeAckTimer) clearTimeout(closeAckTimer)
  closeAckTimer = null
})

ipcMain.on('app:ready-to-quit', () => {
  closeConfirmed = true
  mainWindow?.close()
})

app.whenReady().then(() => {
  getDb()
  registerAllHandlers()
  buildMenu()
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
