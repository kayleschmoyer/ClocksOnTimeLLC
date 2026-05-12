import { useMemo } from 'react'
import type { WaitingListRecord, SortMode } from '../types'

export function useSort(records: WaitingListRecord[], mode: SortMode): WaitingListRecord[] {
  return useMemo(() => {
    const sorted = [...records]

    switch (mode) {
      case 'number':
        sorted.sort((a, b) => a.number - b.number)
        break

      case 'lastName':
        sorted.sort((a, b) => {
          const last = a.lastName.localeCompare(b.lastName)
          if (last !== 0) return last
          return a.firstName.localeCompare(b.firstName)
        })
        break

      case 'dateEntered':
        sorted.sort((a, b) => a.dateEntered.localeCompare(b.dateEntered))
        break

      case 'dateCalled':
        // Blank dateCalled comes FIRST, then sorted by dateEntered
        sorted.sort((a, b) => {
          const aNull = a.dateCalled == null
          const bNull = b.dateCalled == null
          if (aNull && !bNull) return -1
          if (!aNull && bNull) return 1
          // Both null or both non-null: sort by dateEntered
          return a.dateEntered.localeCompare(b.dateEntered)
        })
        break
    }

    return sorted
  }, [records, mode])
}
