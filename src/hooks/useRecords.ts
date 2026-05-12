import { useState, useEffect, useCallback } from 'react'
import type { WaitingListRecord, NewRecordInput, UpdateRecordInput } from '../types'

export function useRecords() {
  const [records, setRecords] = useState<WaitingListRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRecords = useCallback(async () => {
    try {
      const data = await window.electronAPI.records.getAll()
      setRecords(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const createRecord = useCallback(async (input: NewRecordInput): Promise<WaitingListRecord> => {
    const created = await window.electronAPI.records.create(input)
    setRecords(prev => [...prev, created])
    return created
  }, [])

  const updateRecord = useCallback(async (id: number, input: UpdateRecordInput): Promise<WaitingListRecord> => {
    const updated = await window.electronAPI.records.update(id, input)
    setRecords(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }, [])

  const deleteRecord = useCallback(async (id: number): Promise<void> => {
    await window.electronAPI.records.delete(id)
    setRecords(prev => prev.filter(r => r.id !== id))
  }, [])

  return { records, loading, error, createRecord, updateRecord, deleteRecord, refresh: loadRecords }
}
