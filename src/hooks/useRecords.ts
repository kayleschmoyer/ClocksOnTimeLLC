import { useState, useEffect } from 'react';
import { ClockRecord } from '../types';
import { seedData } from '../data/seedData';

const STORAGE_KEY = 'cotllc_records';

function generateId(): string {
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useRecords() {
  const [records, setRecords] = useState<ClockRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as ClockRecord[];
    } catch {
      // ignore parse errors, fall through to seed
    }
    return seedData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  function addRecord(data: Omit<ClockRecord, 'id' | 'number'>): ClockRecord {
    const maxNumber = records.length > 0 ? Math.max(...records.map(r => r.number)) : 0;
    const newRecord: ClockRecord = { ...data, id: generateId(), number: maxNumber + 1 };
    setRecords(prev => [...prev, newRecord]);
    return newRecord;
  }

  function updateRecord(id: string, data: Partial<Omit<ClockRecord, 'id' | 'number'>>): void {
    setRecords(prev => prev.map(r => (r.id === id ? { ...r, ...data } : r)));
  }

  function deleteRecord(id: string): void {
    setRecords(prev => prev.filter(r => r.id !== id));
  }

  return { records, addRecord, updateRecord, deleteRecord };
}
