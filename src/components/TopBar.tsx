import React from 'react'
import type { Tab } from '../types'
import { formatAgo } from '../utils/dateUtils'
import { Ico } from './ui/Ico'

export const ZOOM_LEVELS = [1, 1.15, 1.3] as const

interface TopBarProps {
  tab: Tab
  counts: { waiting: number; completed: number }
  lastBackupAt: string | null
  zoom: number
  onTab: (t: Tab) => void
  onBackup: () => void
  onZoom: (z: number) => void
}

export const TopBar: React.FC<TopBarProps> = ({ tab, counts, lastBackupAt, zoom, onTab, onBackup, onZoom }) => (
  <header className="topbar no-print">
    <div className="brand">
      <span className="brand-mark"><Ico name="clock" size={22} /></span>
      <span>
        <span className="brand-name">Clocks on Time LLC</span>
        <span className="brand-sub">Waiting List</span>
      </span>
    </div>

    <nav className="tabs" aria-label="Lists">
      <button className={'tab' + (tab === 'waiting' ? ' on' : '')} aria-current={tab === 'waiting' ? 'page' : undefined} onClick={() => onTab('waiting')}>
        Waiting List <span className="tab-count">{counts.waiting}</span>
      </button>
      <button className={'tab' + (tab === 'completed' ? ' on' : '')} aria-current={tab === 'completed' ? 'page' : undefined} onClick={() => onTab('completed')}>
        Completed <span className="tab-count">{counts.completed}</span>
      </button>
    </nav>

    <div className="topbar-right">
      <div className="textsize" role="group" aria-label="Text size">
        <span className="textsize-label">Text size</span>
        {ZOOM_LEVELS.map((z, i) => (
          <button
            key={z}
            className={'textsize-btn' + (zoom === z ? ' on' : '')}
            style={{ fontSize: 14 + i * 4 }}
            aria-pressed={zoom === z}
            aria-label={['Normal text', 'Large text', 'Largest text'][i]}
            title={['Normal text', 'Large text', 'Largest text'][i]}
            onClick={() => onZoom(z)}
          >A</button>
        ))}
      </div>
      <div className="backup">
        <span className="backup-label">Last backup: <strong>{formatAgo(lastBackupAt)}</strong></span>
        <button className="btn btn-on-dark" onClick={onBackup}><Ico name="backup" size={18} />Back Up Now</button>
      </div>
    </div>
  </header>
)
