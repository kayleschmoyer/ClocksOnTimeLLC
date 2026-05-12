import React from 'react';
import { ClockRecord, SearchField, SortMode } from '../types';
import { SearchBar } from './SearchBar';
import { SortDropdown } from './SortDropdown';
import { RecordRow } from './RecordRow';

interface RecordTableProps {
  records: ClockRecord[];
  searchQuery: string;
  searchField: SearchField;
  sortMode: SortMode;
  isFiltered: boolean;
  onSearchQueryChange: (q: string) => void;
  onSearchFieldChange: (f: SearchField) => void;
  onSortModeChange: (m: SortMode) => void;
  onOpenRecord: (id: string) => void;
}

const COLUMNS = [
  { label: '#', width: 48 },
  { label: 'Last Name', width: 130 },
  { label: 'First Name', width: 120 },
  { label: 'Date Entered', width: 110 },
  { label: 'Phone', width: 110 },
  { label: 'Date Called', width: 110 },
  { label: 'Clock Type', width: 150 },
  { label: 'Issue', width: undefined },
  { label: '', width: 70 },
];

export function RecordTable({
  records,
  searchQuery,
  searchField,
  sortMode,
  isFiltered,
  onSearchQueryChange,
  onSearchFieldChange,
  onSortModeChange,
  onOpenRecord,
}: RecordTableProps) {
  return (
    <div style={{ padding: 'var(--spacing-lg) var(--spacing-xl)' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-lg)',
        flexWrap: 'wrap',
        marginBottom: 'var(--spacing-md)',
      }}>
        <SearchBar
          query={searchQuery}
          field={searchField}
          onQueryChange={onSearchQueryChange}
          onFieldChange={onSearchFieldChange}
          resultCount={records.length}
          isFiltered={isFiltered}
        />
        <SortDropdown value={sortMode} onChange={onSortModeChange} />
      </div>

      {/* Status banner when filtered */}
      {isFiltered && (
        <div style={{
          backgroundColor: 'var(--color-surface-strong)',
          borderRadius: 'var(--rounded-sm)',
          padding: '6px 12px',
          marginBottom: 'var(--spacing-sm)',
          fontSize: 12,
          color: 'var(--color-muted)',
        }}>
          Showing search results · {records.length} {records.length === 1 ? 'record' : 'records'} found
        </div>
      )}

      {/* Table */}
      <div style={{
        backgroundColor: 'var(--color-canvas)',
        borderRadius: 'var(--rounded-md)',
        border: '1px solid var(--color-hairline)',
        boxShadow: 'var(--shadow-card)',
        overflowX: 'auto',
      }}>
        {records.length === 0 ? (
          <div style={{
            padding: 'var(--spacing-xxl)',
            textAlign: 'center',
            color: 'var(--color-muted)',
            fontSize: 14,
          }}>
            {isFiltered ? 'No records match your search.' : 'No records yet. Click "Add Record" to get started.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-soft)' }}>
                {COLUMNS.map((col, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '9px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-muted)',
                      textAlign: i === COLUMNS.length - 1 ? 'right' : 'left',
                      borderBottom: '1px solid var(--color-hairline)',
                      whiteSpace: 'nowrap',
                      width: col.width,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <RecordRow key={record.id} record={record} onOpen={onOpenRecord} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 12, color: 'var(--color-muted)' }}>
        {records.length} {records.length === 1 ? 'record' : 'records'}
        {isFiltered ? ' (filtered)' : ' total'}
      </div>
    </div>
  );
}
