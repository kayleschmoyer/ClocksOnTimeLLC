import { describe, expect, it } from 'vitest'
import type { WaitingListRecord } from '../types'
import { agingLevel, agingLevelForDays } from './agingFlag'
import { daysSince, formatDate } from './dateUtils'
import { formatPhone } from './phoneFormat'
import { EMPTY_SEARCH, matchesSearch, recordsForView, sortRecords } from './records'

const rec = (o: Partial<WaitingListRecord>): WaitingListRecord => ({
  id: o.number ?? 1, number: 1, lastName: 'Smith', firstName: 'John', dateEntered: '2026-04-01', phoneNumber: '',
  dateCalled: null, clockType: 'Wall Clock', customClockType: null, issue: '', notes: '[]', status: 'Active',
  isDeleted: 0, createdAt: '', updatedAt: '', ...o,
})

describe('aging flag', () => {
  it('is yellow from 45 to 75 days and red after 75', () => {
    expect(agingLevelForDays(44)).toBe('none')
    expect(agingLevelForDays(45)).toBe('yellow')
    expect(agingLevelForDays(75)).toBe('yellow')
    expect(agingLevelForDays(76)).toBe('red')
  })
  it('never flags completed records', () => {
    const now = new Date(2026, 4, 12)
    expect(agingLevel(rec({ dateEntered: '2025-11-08' }), now)).toBe('red')
    expect(agingLevel(rec({ dateEntered: '2025-11-08', status: 'Complete' }), now)).toBe('none')
  })
})

describe('dates', () => {
  it('counts whole days', () => {
    expect(daysSince('2026-03-14', new Date(2026, 4, 12, 15))).toBe(59)
    expect(daysSince('2026-05-12', new Date(2026, 4, 12))).toBe(0)
  })
  it('formats as MM/DD/YYYY', () => expect(formatDate('2026-04-22')).toBe('04/22/2026'))
})

describe('phone', () => {
  it('formats while typing', () => {
    expect(formatPhone('231')).toBe('(231')
    expect(formatPhone('2315550')).toBe('(231) 555-0')
    expect(formatPhone('2315550142')).toBe('(231) 555-0142')
    expect(formatPhone('(231) 555-01429')).toBe('(231) 555-0142')
  })
})

describe('search', () => {
  it('matches partial names', () => {
    expect(matchesSearch(rec({ lastName: 'Smith' }), { ...EMPTY_SEARCH, lastName: 'Smi' })).toBe(true)
    expect(matchesSearch(rec({ lastName: 'Achterberg' }), { ...EMPTY_SEARCH, lastName: 'berg' })).toBe(true)
    expect(matchesSearch(rec({ firstName: 'John' }), { ...EMPTY_SEARCH, firstName: 'jo' })).toBe(true)
    expect(matchesSearch(rec({ lastName: 'Smith' }), { ...EMPTY_SEARCH, lastName: 'Jones' })).toBe(false)
  })
  it('ignores accents either way', () => {
    expect(matchesSearch(rec({ lastName: 'Calderón' }), { ...EMPTY_SEARCH, lastName: 'calderon' })).toBe(true)
    expect(matchesSearch(rec({ lastName: 'Calderón' }), { ...EMPTY_SEARCH, lastName: 'calderón' })).toBe(true)
  })
  it('uses an inclusive date range', () => {
    const r = rec({ dateEntered: '2026-04-10' })
    expect(matchesSearch(r, { ...EMPTY_SEARCH, dateFrom: '2026-04-10', dateTo: '2026-04-10' })).toBe(true)
    expect(matchesSearch(r, { ...EMPTY_SEARCH, dateFrom: '2026-04-11' })).toBe(false)
    expect(matchesSearch(r, { ...EMPTY_SEARCH, dateTo: '2026-04-09' })).toBe(false)
  })
  it('keeps completed records off the waiting list unless asked', () => {
    const all = [rec({ number: 1 }), rec({ number: 2, status: 'Complete' }), rec({ number: 3, isDeleted: 1 })]
    expect(recordsForView(all, 'waiting', EMPTY_SEARCH).map(r => r.number)).toEqual([1])
    expect(recordsForView(all, 'waiting', { ...EMPTY_SEARCH, includeCompleted: true }).map(r => r.number)).toEqual([1, 2])
    expect(recordsForView(all, 'completed', EMPTY_SEARCH).map(r => r.number)).toEqual([2])
  })
})

describe('sorting', () => {
  const list = [
    rec({ number: 3, lastName: 'Baker', dateEntered: '2026-03-01', dateCalled: '2026-04-20' }),
    rec({ number: 1, lastName: 'Young', dateEntered: '2026-04-01', dateCalled: null }),
    rec({ number: 2, lastName: 'adams', dateEntered: '2026-02-01', dateCalled: '2026-04-05' }),
    rec({ number: 4, lastName: 'Cole', dateEntered: '2026-01-15', dateCalled: null }),
  ]
  const nums = (m: Parameters<typeof sortRecords>[1]) => sortRecords(list, m).map(r => r.number)
  it('by number', () => expect(nums('number')).toEqual([1, 2, 3, 4]))
  it('alphabetical by last name', () => expect(nums('lastName')).toEqual([2, 3, 4, 1]))
  it('date entered, earliest first', () => expect(nums('dateEntered')).toEqual([4, 2, 3, 1]))
  it('date called: blanks first by date entered, then by date called', () => expect(nums('dateCalled')).toEqual([4, 1, 2, 3]))
})
