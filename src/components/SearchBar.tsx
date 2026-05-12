import React from 'react';
import { SearchField } from '../types';

interface SearchBarProps {
  query: string;
  field: SearchField;
  onQueryChange: (q: string) => void;
  onFieldChange: (f: SearchField) => void;
  resultCount: number;
  isFiltered: boolean;
}

const FIELD_LABELS: Record<SearchField, string> = {
  lastName: 'Last Name',
  firstName: 'First Name',
  dateEntered: 'Date Entered',
};

export function SearchBar({
  query,
  field,
  onQueryChange,
  onFieldChange,
  resultCount,
  isFiltered,
}: SearchBarProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-xs)',
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500 }}>Search by</span>

      <select
        value={field}
        onChange={e => onFieldChange(e.target.value as SearchField)}
        style={{
          height: 36,
          padding: '0 var(--spacing-sm)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--rounded-sm)',
          backgroundColor: 'var(--color-canvas)',
          color: 'var(--color-ink)',
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {(Object.keys(FIELD_LABELS) as SearchField[]).map(f => (
          <option key={f} value={f}>{FIELD_LABELS[f]}</option>
        ))}
      </select>

      <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 320 }}>
        <span style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--color-border-strong)',
          fontSize: 13,
          pointerEvents: 'none',
        }}>
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={`Search by ${FIELD_LABELS[field]}…`}
          style={{
            width: '100%',
            height: 36,
            padding: '0 var(--spacing-sm) 0 32px',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--rounded-sm)',
            backgroundColor: 'var(--color-canvas)',
            fontSize: 13,
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-info-border)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-hairline)')}
        />
      </div>

      {query && (
        <button
          onClick={() => onQueryChange('')}
          title="Clear search"
          style={{
            height: 36,
            padding: '0 var(--spacing-sm)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--rounded-sm)',
            backgroundColor: 'var(--color-canvas)',
            color: 'var(--color-muted)',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          Clear
        </button>
      )}

      {isFiltered && (
        <span style={{
          fontSize: 12,
          color: 'var(--color-muted)',
          paddingLeft: 'var(--spacing-xxs)',
        }}>
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </span>
      )}
    </div>
  );
}
