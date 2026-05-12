import React from 'react';
import { ClockRecord } from '../types';
import { formatDate } from '../hooks/useFilteredRecords';

interface RecordDetailProps {
  record: ClockRecord;
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  onEdit: () => void;
  onBack: () => void;
}

export function RecordDetail({
  record,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  onEdit,
  onBack,
}: RecordDetailProps) {
  return (
    <div style={{ padding: 'var(--spacing-lg) var(--spacing-xl)', maxWidth: 800 }}>
      {/* Top nav bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-lg)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-xs)',
            padding: '8px 14px',
            borderRadius: 'var(--rounded-sm)',
            border: '1px solid var(--color-hairline)',
            backgroundColor: 'var(--color-canvas)',
            color: 'var(--color-ink)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          ← Back to List
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <NavButton onClick={onPrev} disabled={currentIndex === 0} label="← Previous" />
            <span style={{ fontSize: 12, color: 'var(--color-muted)', padding: '0 4px' }}>
              {currentIndex + 1} / {totalCount}
            </span>
            <NavButton onClick={onNext} disabled={currentIndex === totalCount - 1} label="Next →" />
          </div>

          <button
            onClick={onEdit}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--rounded-lg)',
              border: 'none',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Edit Record
          </button>
        </div>
      </div>

      {/* Record card */}
      <div style={{
        backgroundColor: 'var(--color-canvas)',
        borderRadius: 'var(--rounded-lg)',
        border: '1px solid var(--color-hairline)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden',
      }}>
        {/* Card header */}
        <div style={{
          backgroundColor: 'var(--color-surface-soft)',
          borderBottom: '1px solid var(--color-hairline)',
          padding: 'var(--spacing-lg) var(--spacing-xl)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 'var(--spacing-sm)',
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--color-muted)',
          }}>
            Record #{record.number}
          </span>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-ink)' }}>
            {record.lastName}, {record.firstName}
          </h2>
        </div>

        {/* Fields grid */}
        <div style={{
          padding: 'var(--spacing-lg) var(--spacing-xl)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}>
          <DetailField label="Date Entered" value={formatDate(record.dateEntered)} />
          <DetailField label="Phone Number" value={record.phoneNumber || '—'} />
          <DetailField
            label="Date Called"
            value={record.dateCalled ? formatDate(record.dateCalled) : '—'}
            empty={!record.dateCalled}
          />
          <DetailField label="Clock Type" value={record.clockType || '—'} />
        </div>

        <div style={{
          padding: '0 var(--spacing-xl) var(--spacing-xl)',
        }}>
          <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 'var(--spacing-lg)' }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-muted)',
              marginBottom: 'var(--spacing-xs)',
            }}>
              Issue / Description
            </div>
            <p style={{
              fontSize: 14,
              color: 'var(--color-body)',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
            }}>
              {record.issue || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 'var(--spacing-lg)',
      }}>
        <NavButton onClick={onPrev} disabled={currentIndex === 0} label="← Previous Record" />
        <NavButton onClick={onNext} disabled={currentIndex === totalCount - 1} label="Next Record →" />
      </div>
    </div>
  );
}

function DetailField({ label, value, empty }: { label: string; value: string; empty?: boolean }) {
  return (
    <div>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--color-muted)',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14,
        fontWeight: empty ? 400 : 500,
        color: empty ? 'var(--color-border-strong)' : 'var(--color-ink)',
      }}>
        {value}
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 14px',
        borderRadius: 'var(--rounded-sm)',
        border: '1px solid var(--color-hairline)',
        backgroundColor: 'var(--color-canvas)',
        color: disabled ? 'var(--color-border-strong)' : 'var(--color-ink)',
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}
