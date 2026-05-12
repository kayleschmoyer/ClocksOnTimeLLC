import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { registerAllHandlers } from './ipc'
import { getSettings } from './db/settings'
import { getDb } from './db/database'

let mainWindow: BrowserWindow | null = null
let quittingConfirmed = false

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: 'Clocks on Time LLC — Waiting List Database',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/public/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Initialize DB before registering handlers
  getDb()
  registerAllHandlers()
  createWindow()
})

// Backup reminder before quit
app.on('before-quit', (event) => {
  if (quittingConfirmed) return  // already confirmed, let it quit

  const settings = getSettings()
  const lastBackup = settings.lastBackupAt
  const reminderDays = settings.backupReminderDays

  const isOverdue =
    !lastBackup ||
    Date.now() - new Date(lastBackup).getTime() > reminderDays * 24 * 60 * 60 * 1000

  if (isOverdue && mainWindow) {
    event.preventDefault()
    mainWindow.webContents.send('backup:reminder')
  }
})

// Renderer signals it is done with backup prompt
ipcMain.on('app:ready-to-quit', () => {
  quittingConfirmed = true
  app.quit()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
