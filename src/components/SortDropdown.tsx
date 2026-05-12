import React from 'react';
import { SortMode } from '../types';

interface SortDropdownProps {
  value: SortMode;
  onChange: (mode: SortMode) => void;
}

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'number', label: 'Sort by Number' },
  { value: 'lastName', label: 'Sort by Last Name (A–Z)' },
  { value: 'dateEntered', label: 'Sort by Date Entered (earliest first)' },
  { value: 'dateCalled', label: 'Sort by Date Called (not called first)' },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
      <span style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
        Sort
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortMode)}
        style={{
          height: 36,
          padding: '0 var(--spacing-sm)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--rounded-sm)',
          backgroundColor: 'var(--color-canvas)',
          color: 'var(--color-ink)',
          fontSize: 13,
          fontWeight: 500,
          minWidth: 260,
        }}
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
