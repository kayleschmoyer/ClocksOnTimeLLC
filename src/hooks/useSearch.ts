import { useMemo } from 'react'
import type { WaitingListRecord, StatusFilter } from '../types'

export interface SearchParams {
  lastName: string
  firstName: string
  dateFrom: string
  dateTo: string
  statusFilter: StatusFilter
}

export const defaultSearchParams: SearchParams = {
  lastName: '',
  firstName: '',
  dateFrom: '',
  dateTo: '',
  statusFilter: 'Active',
}

export function useSearch(records: WaitingListRecord[], params: SearchParams): WaitingListRecord[] {
  return useMemo(() => {
    return records.filter(r => {
      // Exclude soft-deleted
      if (r.isDeleted) return false

      // Status filter
      if (params.statusFilter !== 'All' && r.status !== params.statusFilter) return false

      // Last name partial match (case-insensitive)
      if (params.lastName.trim()) {
        const query = params.lastName.trim().toLowerCase()
        if (!r.lastName.toLowerCase().includes(query)) return false
      }

      // First name partial match
      if (params.firstName.trim()) {
        const query = params.firstName.trim().toLowerCase()
        if (!r.firstName.toLowerCase().includes(query)) return false
      }

      // Date range — dateEntered
      if (params.dateFrom && r.dateEntered < params.dateFrom) return false
      if (params.dateTo && r.dateEntered > params.dateTo) return false

      return true
    })
  }, [records, params])
}

/** Returns true if any search field is non-default */
export function isSearchActive(params: SearchParams): boolean {
  return (
    params.lastName.trim() !== '' ||
    params.firstName.trim() !== '' ||
    params.dateFrom !== '' ||
    params.dateTo !== '' ||
    params.statusFilter !== 'Active'
  )
}
