export interface ClockRecord {
  id: string;
  number: number;
  lastName: string;
  firstName: string;
  dateEntered: string; // 'YYYY-MM-DD' or ''
  phoneNumber: string;
  dateCalled: string; // 'YYYY-MM-DD' or ''
  clockType: string;
  issue: string;
}

export type SearchField = 'lastName' | 'firstName' | 'dateEntered';
export type SortMode = 'number' | 'lastName' | 'dateEntered' | 'dateCalled';
export type AppView = 'list' | 'detail';
export type ModalMode = 'add' | 'edit' | null;
