import { useCallback, useEffect, useState } from 'react'
import type { NewRecordInput, UpdateRecordInput, WaitingListRecord } from '../types'

export function useRecords() {
  const [records, setRecords] = useState<WaitingListRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRecords(await window.electronAPI.records.getAll())
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const createRecord = useCallback(async (input: NewRecordInput) => {
    const created = await window.electronAPI.records.create(input)
    setRecords(prev => [...prev, created])
    return created
  }, [])

  const updateRecord = useCallback(async (id: number, input: UpdateRecordInput) => {
    const updated = await window.electronAPI.records.update(id, input)
    setRecords(prev => prev.map(r => (r.id === id ? updated : r)))
    return updated
  }, [])

  const deleteRecord = useCallback(async (id: number) => {
    await window.electronAPI.records.delete(id)
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  const restoreRecord = useCallback(async (id: number) => {
    const restored = await window.electronAPI.records.restore(id)
    setRecords(prev => [...prev.filter(r => r.id !== id), restored])
    return restored
  }, [])

  return { records, loading, error, reload: load, createRecord, updateRecord, deleteRecord, restoreRecord }
}
