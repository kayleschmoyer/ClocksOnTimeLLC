import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  records: {
    getAll: () =>
      ipcRenderer.invoke('records:getAll'),
    create: (input: unknown) =>
      ipcRenderer.invoke('records:create', input),
    update: (id: number, input: unknown) =>
      ipcRenderer.invoke('records:update', id, input),
    delete: (id: number) =>
      ipcRenderer.invoke('records:delete', id),
    getNextNumber: () =>
      ipcRenderer.invoke('records:getNextNumber'),
  },
  settings: {
    get: () =>
      ipcRenderer.invoke('settings:get'),
    update: (input: unknown) =>
      ipcRenderer.invoke('settings:update', input),
  },
  backup: {
    now: () =>
      ipcRenderer.invoke('backup:now'),
    getLastTime: () =>
      ipcRenderer.invoke('backup:getLastTime'),
  },
  print: {
    dialog: () =>
      ipcRenderer.invoke('print:dialog'),
  },
  onBackupReminder: (callback: () => void) => {
    ipcRenderer.on('backup:reminder', callback)
    // Return cleanup function
    return () => ipcRenderer.removeListener('backup:reminder', callback)
  },
  readyToQuit: () => {
    ipcRenderer.send('app:ready-to-quit')
  },
})
