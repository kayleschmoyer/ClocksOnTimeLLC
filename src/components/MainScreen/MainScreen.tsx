import React, { useState, useCallback } from 'react'
import type { WaitingListRecord, SortMode } from '../../types'
import { useSearch, defaultSearchParams, isSearchActive as checkSearchActive } from '../../hooks/useSearch'
import type { SearchParams } from '../../hooks/useSearch'
import { useSort } from '../../hooks/useSort'
import { Toolbar } from './Toolbar'
import { SearchPanel } from './SearchPanel'
import { RecordTable } from './RecordTable'

interface MainScreenProps {
  records: WaitingListRecord[]
  onAddNew: () => void
  onOpenRecord: (id: number, context: 'activeList' | 'searchResults', list: WaitingListRecord[]) => void
  onBackup: () => void
}

export const MainScreen: React.FC<MainScreenProps> = ({
  records,
  onAddNew,
  onOpenRecord,
  onBackup,
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams)
  const [sortMode, setSortMode] = useState<SortMode>('number')

  const searchActive = checkSearchActive(searchParams)

  // Search filters on all non-deleted records
  const searchResults = useSearch(records, searchParams)

  // For the default active list: show Active only, sorted
  const activeOnlyParams: SearchParams = { ...defaultSearchParams, statusFilter: 'Active' }
  const activeRecords = useSearch(records, activeOnlyParams)
  // The displayed records: either sorted active list or sorted search results
  const displayedRecords = useSort(searchActive ? searchResults : activeRecords, sortMode)

  const handleClear = useCallback(() => {
    setSearchParams(defaultSearchParams)
  }, [])

  const handleOpenRecord = useCallback((id: number) => {
    const context = searchActive ? 'searchResults' : 'activeList'
    onOpenRecord(id, context, displayedRecords)
  }, [searchActive, onOpenRecord, displayedRecords])

  return (
    <div style={styles.screen}>
      <Toolbar
        activeRecords={activeRecords}
        searchResults={searchResults}
        isSearchActive={searchActive}
        onAddNew={onAddNew}
        onBackup={onBackup}
      />

      <SearchPanel
        params={searchParams}
        sortMode={sortMode}
        resultCount={searchResults.length}
        totalCount={activeRecords.length}
        isSearchActive={searchActive}
        onParamsChange={setSearchParams}
        onSortChange={setSortMode}
        onClear={handleClear}
      />

      <RecordTable
        records={displayedRecords}
        onOpenRecord={handleOpenRecord}
        isSearchActive={searchActive}
      />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#f8fafc',
  },
}
