import { ipcMain } from 'electron'
import { getSettings, updateSettings } from '../db/settings'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:update', (_e, input) => updateSettings(input))
}
