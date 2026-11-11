# Clocks on Time LLC — Waiting List

A Windows desktop app (Electron, React, SQLite) for one person to keep a clock repair waiting list.

## What it does

- Records: number (assigned automatically), last name, first name, date entered (today by default), phone, date called, clock type, issue, and Active/Complete status.
- Search by last name, first name (partial matches) and a date-entered range.
- Sort by number (default), last name, date entered, or date called (not called first).
- One record per page with Previous/Next through the list or the search results.
- Yellow flag beside the number at 45–75 days waiting, red after 75.
- Completed records leave the waiting list and stay searchable under Completed.
- Print the list, the search results, or one record. Save the list or search results as a PDF.
- Changes are stored only when Save is pressed.
- Back Up Now saves a copy of the database; closing the app reminds you when a backup is more than 7 days old.

## Develop

```bash
npm install
npm run dev        # run the app
npm test           # unit tests
npm run typecheck
npm run dist:win   # build the Windows installer into release/
```

A development run starts with sample customers. An installed copy starts empty at record 1.

The database is `waitinglist.db` in the app's user-data folder (`%APPDATA%` on Windows).

See `DESIGN.md` for the interface rules.
