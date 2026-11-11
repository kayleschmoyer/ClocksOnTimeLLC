import { ipcMain, dialog, BrowserWindow } from 'electron'
import { writeFileSync } from 'fs'

export function registerExportHandlers(): void {
  // Saves the page's print layout as a PDF. The renderer shows only the
  // print sheet under @media print, so the PDF matches the paper printout.
  ipcMain.handle('export:pdf', async (event, defaultName: unknown) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return { success: false, error: 'Window not available' }

    const safeName = String(defaultName || 'waiting-list').replace(/[^\w\- ]+/g, '').slice(0, 80) || 'waiting-list'
    const result = await dialog.showSaveDialog(win, {
      title: 'Save as PDF',
      defaultPath: `${safeName}.pdf`,
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }],
    })
    if (result.canceled || !result.filePath) return { success: false }

    try {
      const data = await win.webContents.printToPDF({ pageSize: 'Letter', printBackground: true })
      writeFileSync(result.filePath, data)
      return { success: true, path: result.filePath }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
