import { ipcMain, BrowserWindow } from 'electron'

export function registerPrintHandlers(): void {
  ipcMain.handle('print:dialog', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    win.webContents.print({}, (success, errorType) => {
      if (!success) console.error('Print failed:', errorType)
    })
  })
}
