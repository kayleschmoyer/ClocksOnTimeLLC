import { getDb } from './database'

export interface SettingsRow {
  id: number
  lastBackupAt: string | null
  backupReminderDays: number
}

export function getSettings(): SettingsRow {
  const db = getDb()
  return db.prepare('SELECT * FROM settings WHERE id = 1').get() as SettingsRow
}

export function updateSettings(input: Partial<Omit<SettingsRow, 'id'>>): SettingsRow {
  const db = getDb()
  const fields = Object.keys(input) as (keyof typeof input)[]
  if (fields.length === 0) return getSettings()

  const setClauses = fields.map(f => `${f} = @${f}`).join(', ')
  const params: Record<string, unknown> = { id: 1 }
  for (const f of fields) {
    params[f] = (input as Record<string, unknown>)[f]
  }

  db.prepare(`UPDATE settings SET ${setClauses} WHERE id = @id`).run(params)
  return getSettings()
}
