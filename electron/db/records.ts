import { getDb } from './database'

export interface RecordRow {
  id: number
  number: number
  lastName: string
  firstName: string
  dateEntered: string
  phoneNumber: string
  dateCalled: string | null
  clockType: string
  customClockType: string | null
  issue: string
  status: 'Active' | 'Complete'
  isDeleted: number
  createdAt: string
  updatedAt: string
}

export interface NewRecordInput {
  lastName: string
  firstName: string
  dateEntered: string
  phoneNumber: string
  dateCalled: string | null
  clockType: string
  customClockType: string | null
  issue: string
  status: 'Active' | 'Complete'
}

export interface UpdateRecordInput {
  lastName?: string
  firstName?: string
  dateEntered?: string
  phoneNumber?: string
  dateCalled?: string | null
  clockType?: string
  customClockType?: string | null
  issue?: string
  status?: 'Active' | 'Complete'
}

function localNow(): string {
  return new Date().toISOString()
}

export function getAllRecords(): RecordRow[] {
  const db = getDb()
  return db.prepare(
    'SELECT * FROM records WHERE isDeleted = 0 ORDER BY number ASC'
  ).all() as RecordRow[]
}

export function getNextNumber(): number {
  const db = getDb()
  const row = db.prepare('SELECT COALESCE(MAX(number), 0) + 1 AS n FROM records').get() as { n: number }
  return row.n
}

export function createRecord(input: NewRecordInput): RecordRow {
  const db = getDb()

  const create = db.transaction((): RecordRow => {
    const { n } = db.prepare(
      'SELECT COALESCE(MAX(number), 0) + 1 AS n FROM records'
    ).get() as { n: number }

    const now = localNow()
    db.prepare(`
      INSERT INTO records
        (number, lastName, firstName, dateEntered, phoneNumber, dateCalled,
         clockType, customClockType, issue, status, isDeleted, createdAt, updatedAt)
      VALUES
        (@number, @lastName, @firstName, @dateEntered, @phoneNumber, @dateCalled,
         @clockType, @customClockType, @issue, @status, 0, @now, @now)
    `).run({
      number: n,
      lastName: input.lastName,
      firstName: input.firstName,
      dateEntered: input.dateEntered,
      phoneNumber: input.phoneNumber,
      dateCalled: input.dateCalled ?? null,
      clockType: input.clockType,
      customClockType: input.customClockType ?? null,
      issue: input.issue,
      status: input.status,
      now,
    })

    return db.prepare('SELECT * FROM records WHERE id = last_insert_rowid()').get() as RecordRow
  })

  return create()
}

export function updateRecord(id: number, input: UpdateRecordInput): RecordRow {
  const db = getDb()
  const now = localNow()

  const fields = Object.keys(input) as (keyof UpdateRecordInput)[]
  if (fields.length === 0) {
    return db.prepare('SELECT * FROM records WHERE id = ?').get(id) as RecordRow
  }

  const setClauses = fields.map(f => `${f} = @${f}`).join(', ')
  const params: Record<string, unknown> = { id, updatedAt: now }
  for (const f of fields) {
    params[f] = input[f] ?? null
  }

  db.prepare(`UPDATE records SET ${setClauses}, updatedAt = @updatedAt WHERE id = @id`).run(params)
  return db.prepare('SELECT * FROM records WHERE id = ?').get(id) as RecordRow
}

export function softDeleteRecord(id: number): void {
  const db = getDb()
  db.prepare('UPDATE records SET isDeleted = 1, updatedAt = ? WHERE id = ?').run(localNow(), id)
}
