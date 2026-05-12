import React from 'react'
import type { SortMode, StatusFilter } from '../../types'
import type { SearchParams } from '../../hooks/useSearch'
import { Button } from '../shared/Button'

interface SearchPanelProps {
  params: SearchParams
  sortMode: SortMode
  resultCount: number
  totalCount: number
  isSearchActive: boolean
  onParamsChange: (params: SearchParams) => void
  onSortChange: (mode: SortMode) => void
  onClear: () => void
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  params,
  sortMode,
  resultCount,
  totalCount,
  isSearchActive,
  onParamsChange,
  onSortChange,
  onClear,
}) => {
  const update = (field: keyof SearchParams, value: string) => {
    onParamsChange({ ...params, [field]: value })
  }

  return (
    <div style={styles.panel}>
      <div style={styles.row}>
        {/* Search fields */}
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="search-last">Last Name</label>
          <input
            id="search-last"
            className="field-input"
            style={styles.input}
            type="text"
            placeholder="Partial match OK"
            value={params.lastName}
            onChange={e => update('lastName', e.target.value)}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="search-first">First Name</label>
          <input
            id="search-first"
            className="field-input"
            style={styles.input}
            type="text"
            placeholder="Partial match OK"
            value={params.firstName}
            onChange={e => update('firstName', e.target.value)}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="search-date-from">Date From</label>
          <input
            id="search-date-from"
            className="field-input"
            style={styles.input}
            type="date"
            value={params.dateFrom}
            onChange={e => update('dateFrom', e.target.value)}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="search-date-to">Date To</label>
          <input
            id="search-date-to"
            className="field-input"
            style={styles.input}
            type="date"
            value={params.dateTo}
            onChange={e => update('dateTo', e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            className="field-input"
            style={styles.input}
            value={params.statusFilter}
            onChange={e => update('statusFilter', e.target.value as StatusFilter)}
          >
            <option value="Active">Active</option>
            <option value="Complete">Complete</option>
            <option value="All">All</option>
          </select>
        </div>

        {/* Sort */}
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="sort-mode">Sort By</label>
          <select
            id="sort-mode"
            className="field-input"
            style={styles.input}
            value={sortMode}
            onChange={e => onSortChange(e.target.value as SortMode)}
          >
            <option value="number">Number</option>
            <option value="lastName">Last Name A–Z</option>
            <option value="dateEntered">Date Entered (Oldest)</option>
            <option value="dateCalled">Date Called (Blank First)</option>
          </select>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>&nbsp;</label>
          <Button
            variant="secondary"
            onClick={onClear}
            disabled={!isSearchActive}
            title="Clear all search filters"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Result count */}
      <div style={styles.resultBar}>
        {isSearchActive ? (
          <span style={styles.resultCount}>
            {resultCount} result{resultCount !== 1 ? 's' : ''} found
          </span>
        ) : (
          <span style={styles.resultCount}>
            {totalCount} active record{totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: '#ffffff',
    borderBottom: '1px solid #dddddd',
    padding: '10px 20px 6px',
    flexShrink: 0,
  },
  row: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 120,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#41454d',
    marginBottom: 3,
    whiteSpace: 'nowrap',
  },
  input: {
    height: 32,
    fontSize: 13,
    padding: '4px 8px',
  },
  resultBar: {
    marginTop: 6,
    height: 20,
  },
  resultCount: {
    fontSize: 12,
    color: '#9297a0',
  },
}
