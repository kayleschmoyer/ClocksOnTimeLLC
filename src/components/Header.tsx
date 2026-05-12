import React from 'react';

interface HeaderProps {
  onAddRecord: () => void;
}

export function Header({ onAddRecord }: HeaderProps) {
  return (
    <header style={{
      backgroundColor: 'var(--color-canvas)',
      borderBottom: '1px solid var(--color-hairline)',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--spacing-xl)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 0 var(--color-hairline)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>🕰️</span>
        <h1 style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--color-ink)',
          letterSpacing: '-0.01em',
        }}>
          Clocks on Time LLC
          <span style={{
            fontWeight: 400,
            color: 'var(--color-muted)',
            marginLeft: 'var(--spacing-xs)',
          }}>
            Waiting List Database
          </span>
        </h1>
      </div>

      <button
        onClick={onAddRecord}
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
          fontSize: 14,
          fontWeight: 500,
          padding: '8px 16px',
          borderRadius: 'var(--rounded-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          transition: 'background-color 0.1s',
        }}
        onMouseDown={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary-active)')}
        onMouseUp={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-primary)')}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
        Add Record
      </button>
    </header>
  );
}
