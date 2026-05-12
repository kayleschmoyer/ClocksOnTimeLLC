import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database | null = null
let dbPath: string = ''

export function getDb(): Database.Database {
  if (db) return db

  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }

  dbPath = join(userDataPath, 'waitinglist.db')
  db = new Database(dbPath)

  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  initSchema(db)

  return db
}

export function getDbPath(): string {
  return dbPath
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      number          INTEGER NOT NULL UNIQUE,
      lastName        TEXT NOT NULL,
      firstName       TEXT NOT NULL,
      dateEntered     TEXT NOT NULL,
      phoneNumber     TEXT NOT NULL DEFAULT '',
      dateCalled      TEXT,
      clockType       TEXT NOT NULL DEFAULT '',
      customClockType TEXT,
      issue           TEXT NOT NULL DEFAULT '',
      status          TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active','Complete')),
      isDeleted       INTEGER NOT NULL DEFAULT 0 CHECK(isDeleted IN (0,1)),
      createdAt       TEXT NOT NULL,
      updatedAt       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id                  INTEGER PRIMARY KEY CHECK(id = 1),
      lastBackupAt        TEXT,
      backupReminderDays  INTEGER NOT NULL DEFAULT 7
    );

    INSERT OR IGNORE INTO settings (id, lastBackupAt, backupReminderDays)
    VALUES (1, NULL, 7);
  `)

  // Seed on first run
  const count = (db.prepare('SELECT COUNT(*) AS n FROM records').get() as { n: number }).n
  if (count === 0) {
    seedDatabase(db)
  }
}

function seedDatabase(db: Database.Database): void {
  const insert = db.prepare(`
    INSERT INTO records
      (number, lastName, firstName, dateEntered, phoneNumber, dateCalled,
       clockType, customClockType, issue, status, isDeleted, createdAt, updatedAt)
    VALUES
      (@number, @lastName, @firstName, @dateEntered, @phoneNumber, @dateCalled,
       @clockType, @customClockType, @issue, @status, 0, @now, @now)
  `)

  const now = new Date().toISOString()

  // Dates relative to 2026-05-12 (app build date) to test all aging bands:
  // Fresh (0-44 days): after 2026-03-29
  // Warning (45-75 days): 2026-02-26 to 2026-03-28
  // Critical (76+ days): before 2026-02-26
  const seeds = [
    { number: 1, lastName: 'Anderson', firstName: 'Margaret', dateEntered: '2025-11-10', phoneNumber: '(555) 234-5678', dateCalled: '2025-12-15', clockType: 'Grandfather Clock', customClockType: null, issue: 'Pendulum not swinging consistently. Movement needs cleaning and oiling.', status: 'Complete' },
    { number: 2, lastName: 'Bernhardt', firstName: 'Paul', dateEntered: '2025-12-03', phoneNumber: '(555) 345-6789', dateCalled: null, clockType: 'Wall Clock', customClockType: null, issue: 'Clock runs fast by about 10 minutes per day.', status: 'Active' },
    { number: 3, lastName: 'Chen', firstName: 'Li', dateEntered: '2026-01-14', phoneNumber: '(555) 456-7890', dateCalled: '2026-02-01', clockType: 'Mantel Clock', customClockType: null, issue: 'Chime mechanism broken. Clock chimes on the wrong hour.', status: 'Complete' },
    { number: 4, lastName: 'Dorsey', firstName: 'Ruth', dateEntered: '2026-01-28', phoneNumber: '(555) 567-8901', dateCalled: null, clockType: 'Cuckoo Clock', customClockType: null, issue: 'Cuckoo bird door will not open. Weights need adjustment.', status: 'Active' },
    { number: 5, lastName: 'Ellison', firstName: 'Frank', dateEntered: '2026-02-12', phoneNumber: '(555) 678-9012', dateCalled: null, clockType: 'Wall Clock', customClockType: null, issue: 'Clock stopped running. Mainspring may be broken.', status: 'Active' },
    { number: 6, lastName: 'Fischer', firstName: 'Greta', dateEntered: '2026-02-20', phoneNumber: '(555) 789-0123', dateCalled: null, clockType: 'Other', customClockType: 'Ship Clock', issue: 'Bell strike mechanism jammed. Second hand also loose.', status: 'Active' },
    { number: 7, lastName: 'Garza', firstName: 'Manuel', dateEntered: '2026-03-05', phoneNumber: '(555) 890-1234', dateCalled: '2026-03-20', clockType: 'Grandfather Clock', customClockType: null, issue: 'Moon phase dial not advancing correctly. Needs calibration.', status: 'Active' },
    { number: 8, lastName: 'Huang', firstName: 'Wei', dateEntered: '2026-03-18', phoneNumber: '(555) 901-2345', dateCalled: null, clockType: 'Mantel Clock', customClockType: null, issue: 'Glass door cracked. Pendulum bob missing.', status: 'Active' },
    { number: 9, lastName: 'Ingram', firstName: 'Sylvia', dateEntered: '2026-04-10', phoneNumber: '(555) 012-3456', dateCalled: null, clockType: 'Cuckoo Clock', customClockType: null, issue: 'Clock runs slow. Cuckoo call sounds weak.', status: 'Active' },
    { number: 10, lastName: 'Jensen', firstName: 'Karl', dateEntered: '2026-04-28', phoneNumber: '(555) 123-4567', dateCalled: null, clockType: 'Wall Clock', customClockType: null, issue: 'New customer. Clock has never run properly since purchase.', status: 'Active' },
  ]

  const insertMany = db.transaction((records: typeof seeds) => {
    for (const rec of records) {
      insert.run({ ...rec, now })
    }
  })
  insertMany(seeds)
}
