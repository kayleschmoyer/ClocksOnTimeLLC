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
      notes           TEXT NOT NULL DEFAULT '[]',
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

  // Migrate: add notes column if missing (for existing databases)
  const cols = (db.prepare("PRAGMA table_info(records)").all() as { name: string }[]).map(c => c.name)
  if (!cols.includes('notes')) {
    db.exec(`ALTER TABLE records ADD COLUMN notes TEXT NOT NULL DEFAULT '[]'`)
  }

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
       clockType, customClockType, issue, notes, status, isDeleted, createdAt, updatedAt)
    VALUES
      (@number, @lastName, @firstName, @dateEntered, @phoneNumber, @dateCalled,
       @clockType, @customClockType, @issue, @notes, @status, 0, @now, @now)
  `)

  const now = new Date().toISOString()

  const seeds = [
    { number: 184, lastName: 'Achterberg', firstName: 'Margaret', dateEntered: '2026-04-29', phoneNumber: '(231) 555-0142', dateCalled: null, clockType: 'Cuckoo 3 wt.', customClockType: null, issue: 'Bellows replaced last year; cuckoo now silent, weights stop after ~6 hours. Possible bushing wear in the strike train.', notes: '[]', status: 'Active' },
    { number: 183, lastName: 'Bachmann', firstName: 'Henry', dateEntered: '2026-04-22', phoneNumber: '(616) 555-0107', dateCalled: '2026-05-08', clockType: 'Mantle Clock', customClockType: null, issue: 'Westminster chimes out of sequence; runs fast about 4 min per day. Customer called Friday — wants to drop off Tuesday.', notes: JSON.stringify([
      { id: 1001, author: 'Ron', when: 'May 8, 9:14 AM', body: 'Called Henry — left voicemail. Mailbox said he\'s out till Tuesday.', tag: null },
      { id: 1002, author: 'Ron', when: 'May 9, 11:02 AM', body: 'Henry called back. Drop-off Tuesday afternoon. Bringing the original pendulum and a spare key.', tag: null },
      { id: 1003, author: 'Ron', when: 'May 10, 4:48 PM', body: 'Pulled service notes from 2019 — last cleaning was Hermle 451-050. Will need short bushings on the chime train. Ordered from Timesavers.', tag: 'Parts' },
    ]), status: 'Active' },
    { number: 182, lastName: 'Beaumont', firstName: 'Cecilia', dateEntered: '2026-03-14', phoneNumber: '(231) 555-0188', dateCalled: null, clockType: 'Wall Clock', customClockType: null, issue: 'Regulator pendulum will not maintain swing. Cleaned and oiled in 2023.', notes: '[]', status: 'Active' },
    { number: 181, lastName: 'Calderón', firstName: 'Ramón', dateEntered: '2026-02-02', phoneNumber: '(269) 555-0153', dateCalled: '2026-04-30', clockType: 'Other', customClockType: 'Anniversary (400-day)', issue: 'Suspension spring snapped. Needs replacement; verify torsion arm alignment.', notes: '[]', status: 'Active' },
    { number: 180, lastName: 'Delacroix', firstName: 'Yvonne', dateEntered: '2025-11-08', phoneNumber: '(517) 555-0119', dateCalled: null, clockType: 'Cuckoo 2 wt.', customClockType: null, issue: 'Quail call broken; cuckoo door stuck. Customer\'s grandfather brought it from Bavaria 1953 — handle with care.', notes: '[]', status: 'Active' },
    { number: 179, lastName: 'Eberhardt', firstName: 'Walter', dateEntered: '2026-05-04', phoneNumber: '(231) 555-0173', dateCalled: null, clockType: 'Mantle Clock', customClockType: null, issue: 'New customer — Seth Thomas Adamantine, 1898. Strike train binding.', notes: '[]', status: 'Active' },
    { number: 178, lastName: 'Friedland', firstName: 'Anneliese', dateEntered: '2026-04-12', phoneNumber: '(231) 555-0165', dateCalled: '2026-05-06', clockType: 'Wall Clock', customClockType: null, issue: 'Kieninger movement — chimes ring on the half hour but not the hour.', notes: '[]', status: 'Active' },
    { number: 177, lastName: 'Hollister', firstName: 'Tom', dateEntered: '2026-04-30', phoneNumber: '(906) 555-0146', dateCalled: null, clockType: 'Cuckoo 3 wt.', customClockType: null, issue: 'Music box plays slowly — likely governor fly out of true.', notes: '[]', status: 'Active' },
    { number: 176, lastName: 'Iverson', firstName: 'Karin', dateEntered: '2026-03-28', phoneNumber: '(248) 555-0192', dateCalled: '2026-05-10', clockType: 'Mantle Clock', customClockType: null, issue: 'Hands slip on canon pinion. Friction tightening needed.', notes: '[]', status: 'Active' },
    { number: 175, lastName: 'Janowski', firstName: 'Peter', dateEntered: '2026-01-19', phoneNumber: '(231) 555-0181', dateCalled: '2026-04-21', clockType: 'Other', customClockType: "Ship's Bell", issue: "Ship's bell strike out of sync — wants by mid-June for retirement gift.", notes: '[]', status: 'Active' },
    { number: 174, lastName: 'Kowalczyk', firstName: 'Maria', dateEntered: '2026-03-08', phoneNumber: '(269) 555-0144', dateCalled: '2026-05-09', clockType: 'Wall Clock', customClockType: null, issue: 'Howard Miller — case finish damage from sunlight; movement runs fine.', notes: '[]', status: 'Active' },
    { number: 173, lastName: 'Lindqvist', firstName: 'Erik', dateEntered: '2026-04-18', phoneNumber: '(906) 555-0118', dateCalled: null, clockType: 'Cuckoo 2 wt.', customClockType: null, issue: 'Chains slipping off sprockets when raising weights.', notes: '[]', status: 'Active' },
    { number: 172, lastName: 'Morimoto', firstName: 'Junko', dateEntered: '2026-04-09', phoneNumber: '(248) 555-0177', dateCalled: '2026-05-07', clockType: 'Mantle Clock', customClockType: null, issue: 'Ansonia crystal regulator — escape wheel pivot worn. Possible bushing.', notes: '[]', status: 'Active' },
    { number: 171, lastName: 'Norquist', firstName: 'Astrid', dateEntered: '2026-02-26', phoneNumber: '(231) 555-0156', dateCalled: '2026-05-02', clockType: 'Wall Clock', customClockType: null, issue: 'Vienna regulator — second hand sweeps unevenly.', notes: '[]', status: 'Active' },
    { number: 170, lastName: "O'Halloran", firstName: 'Frank', dateEntered: '2026-04-25', phoneNumber: '(616) 555-0133', dateCalled: null, clockType: 'Cuckoo 3 wt.', customClockType: null, issue: "Bird won't pop — sliding wire jammed against gable. Quick fix likely.", notes: '[]', status: 'Active' },
    { number: 169, lastName: 'Pemberton', firstName: 'Diane', dateEntered: '2025-12-04', phoneNumber: '(231) 555-0114', dateCalled: '2026-04-22', clockType: 'Mantle Clock', customClockType: null, issue: 'Cleaned + oiled; new mainspring barrel.', notes: '[]', status: 'Complete' },
    { number: 168, lastName: 'Renfro', firstName: 'Beth', dateEntered: '2025-10-30', phoneNumber: '(269) 555-0102', dateCalled: '2026-03-15', clockType: 'Cuckoo 2 wt.', customClockType: null, issue: 'Bellows replaced; deer + foliage scene refinished.', notes: '[]', status: 'Complete' },
  ]

  const insertMany = db.transaction((records: typeof seeds) => {
    for (const rec of records) {
      insert.run({ ...rec, now })
    }
  })
  insertMany(seeds)
}
