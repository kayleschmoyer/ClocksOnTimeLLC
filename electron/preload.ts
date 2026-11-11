import { contextBridge, ipcRenderer, webFrame } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  records: {
    getAll: () => ipcRenderer.invoke('records:getAll'),
    create: (input: unknown) => ipcRenderer.invoke('records:create', input),
    update: (id: number, input: unknown) => ipcRenderer.invoke('records:update', id, input),
    delete: (id: number) => ipcRenderer.invoke('records:delete', id),
    restore: (id: number) => ipcRenderer.invoke('records:restore', id),
    getNextNumber: () => ipcRenderer.invoke('records:getNextNumber'),
  },
  backup: {
    now: () => ipcRenderer.invoke('backup:now'),
    getLastTime: () => ipcRenderer.invoke('backup:getLastTime'),
  },
  exportPdf: (defaultName: string) => ipcRenderer.invoke('export:pdf', defaultName),
  setZoom: (factor: number) => webFrame.setZoomFactor(factor),
  onCloseRequested: (callback: (info: { backupOverdue: boolean; reminderDays: number }) => void) => {
    const listener = (_e: unknown, info: { backupOverdue: boolean; reminderDays: number }) => {
      ipcRenderer.send('app:close-ack')
      callback(info)
    }
    ipcRenderer.on('app:close-requested', listener)
    return () => ipcRenderer.removeListener('app:close-requested', listener)
  },
  readyToQuit: () => ipcRenderer.send('app:ready-to-quit'),
})
