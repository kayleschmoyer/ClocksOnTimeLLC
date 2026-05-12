import { ipcMain } from 'electron'
import { getAllRecords, createRecord, updateRecord, softDeleteRecord, getNextNumber } from '../db/records'

export function registerRecordHandlers(): void {
  ipcMain.handle('records:getAll', () => getAllRecords())
  ipcMain.handle('records:create', (_e, input) => createRecord(input))
  ipcMain.handle('records:update', (_e, id, input) => updateRecord(id, input))
  ipcMain.handle('records:delete', (_e, id) => softDeleteRecord(id))
  ipcMain.handle('records:getNextNumber', () => getNextNumber())
  ipcMain.handle('records:updateNotes', (_e, id, notes) =>
    updateRecord(id, { notes: JSON.stringify(notes) })
  )
}
