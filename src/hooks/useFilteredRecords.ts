import { useMemo } from 'react';
import { ClockRecord, SearchField, SortMode } from '../types';

export function useFilteredRecords(
  records: ClockRecord[],
  searchQuery: string,
  searchField: SearchField,
  sortMode: SortMode,
) {
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter(r => {
      switch (searchField) {
        case 'lastName':
          return r.lastName.toLowerCase().includes(q);
        case 'firstName':
          return r.firstName.toLowerCase().includes(q);
        case 'dateEntered':
          // Accept both ISO (2024-01-05) and display format (01/05/2024) fragments
          return r.dateEntered.includes(q) || formatDate(r.dateEntered).includes(q);
        default:
          return true;
      }
    });
  }, [records, searchQuery, searchField]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (sortMode) {
        case 'number':
          return a.number - b.number;
        case 'lastName':
          return a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName);
        case 'dateEntered':
          return a.dateEntered.localeCompare(b.dateEntered);
        case 'dateCalled': {
          const aBlank = !a.dateCalled;
          const bBlank = !b.dateCalled;
          if (aBlank && bBlank) return a.dateEntered.localeCompare(b.dateEntered);
          if (aBlank) return -1;
          if (bBlank) return 1;
          return a.dateEntered.localeCompare(b.dateEntered);
        }
        default:
          return 0;
      }
    });
  }, [filtered, sortMode]);

  return { displayRecords: sorted, isFiltered: !!searchQuery.trim() };
}

// Shared formatting helper exported so components can reuse it
export function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
