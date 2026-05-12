import React from 'react'
import type { SidebarTab } from '../App'
import { Ico } from './shared/Ico'

interface SidebarProps {
  tab: SidebarTab
  setTab: (t: SidebarTab) => void
  counts: { waiting: number; completed: number; customers: number }
}

export const Sidebar: React.FC<SidebarProps> = ({ tab, setTab, counts }) => {
  const items: { id: SidebarTab; icon: string; label: string; count?: number }[] = [
    { id: 'waiting',   icon: 'list',  label: 'Waiting List', count: counts.waiting },
    { id: 'completed', icon: 'check', label: 'Completed',    count: counts.completed },
    { id: 'reports',   icon: 'doc',   label: 'Reports' },
  ]

  return (
    <aside className="sidebar">
      <div className="sb-section">Workshop</div>
      {items.map(i => (
        <div
          key={i.id}
          className={'sb-item' + (tab === i.id ? ' active' : '')}
          onClick={() => setTab(i.id)}
        >
          <span className="sb-icon"><Ico name={i.icon} /></span>
          <span className="lbl">{i.label}</span>
          {i.count !== undefined && <span className="sb-count">{i.count}</span>}
        </div>
      ))}

      <div className="sb-section">System</div>
      <div className="sb-item" onClick={() => window.electronAPI.backup.now()}>
        <span className="sb-icon"><Ico name="backup" /></span>
        <span className="lbl">Backup &amp; Restore</span>
      </div>
      <div className="sb-item">
        <span className="sb-icon"><Ico name="gear" /></span>
        <span className="lbl">Settings</span>
      </div>

      <div className="sb-foot">
        <div className="avatar">RH</div>
        <div className="meta">
          <div className="name">Ron Hartwell</div>
          <div className="role">Owner · Workshop</div>
        </div>
      </div>
    </aside>
  )
}
