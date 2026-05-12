import React from 'react';
import { ClockRecord } from '../types';
import { formatDate } from '../hooks/useFilteredRecords';

interface RecordRowProps {
  record: ClockRecord;
  onOpen: (id: string) => void;
}

export function RecordRow({ record, onOpen }: RecordRowProps) {
  return (
    <tr
      style={{ cursor: 'pointer' }}
      onClick={() => onOpen(record.id)}
      onMouseEnter={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--color-surface-soft)')}
      onMouseLeave={e => ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'var(--color-canvas)')}
    >
      <td style={tdStyle}>{record.number}</td>
      <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--color-ink)' }}>{record.lastName}</td>
      <td style={tdStyle}>{record.firstName}</td>
      <td style={tdStyle}>{formatDate(record.dateEntered)}</td>
      <td style={tdStyle}>{record.phoneNumber}</td>
      <td style={{ ...tdStyle, color: record.dateCalled ? 'var(--color-body)' : 'var(--color-border-strong)' }}>
        {record.dateCalled ? formatDate(record.dateCalled) : '—'}
      </td>
      <td style={tdStyle}>{record.clockType}</td>
      <td style={{ ...tdStyle, maxWidth: 260 }}>
        <span style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {record.issue}
        </span>
      </td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>
        <button
          onClick={e => { e.stopPropagation(); onOpen(record.id); }}
          style={{
            fontSize: 12,
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: 'var(--rounded-sm)',
            border: '1px solid var(--color-hairline)',
            backgroundColor: 'var(--color-canvas)',
            color: 'var(--color-link)',
          }}
        >
          Open
        </button>
      </td>
    </tr>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13,
  borderBottom: '1px solid var(--color-hairline)',
  verticalAlign: 'top',
  color: 'var(--color-body)',
  whiteSpace: 'nowrap',
};
