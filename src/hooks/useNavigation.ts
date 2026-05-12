import { useMemo } from 'react'
import type { WaitingListRecord } from '../types'

export interface NavigationState {
  currentIndex: number   // -1 if not found
  total: number
  hasPrev: boolean
  hasNext: boolean
  prevId: number | null
  nextId: number | null
}

export function useNavigation(
  list: WaitingListRecord[],
  currentId: number | null
): NavigationState {
  return useMemo(() => {
    const total = list.length
    const currentIndex = currentId != null
      ? list.findIndex(r => r.id === currentId)
      : -1

    const hasPrev = currentIndex > 0
    const hasNext = currentIndex >= 0 && currentIndex < total - 1

    return {
      currentIndex,
      total,
      hasPrev,
      hasNext,
      prevId: hasPrev ? list[currentIndex - 1].id : null,
      nextId: hasNext ? list[currentIndex + 1].id : null,
    }
  }, [list, currentId])
}
