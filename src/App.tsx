import React, { useState, useCallback } from 'react';
import { SearchField, SortMode, ModalMode } from './types';
import { useRecords } from './hooks/useRecords';
import { useFilteredRecords } from './hooks/useFilteredRecords';
import { Header } from './components/Header';
import { RecordTable } from './components/RecordTable';
import { RecordDetail } from './components/RecordDetail';
import { RecordModal } from './components/RecordModal';
import { FormValues } from './components/RecordForm';

export default function App() {
  const { records, addRecord, updateRecord, deleteRecord } = useRecords();

  // Search & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('lastName');
  const [sortMode, setSortMode] = useState<SortMode>('number');

  // Detail view state
  const [detailRecordId, setDetailRecordId] = useState<string | null>(null);

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // The filtered + sorted list is the single source of truth for display and navigation
  const { displayRecords, isFiltered } = useFilteredRecords(records, searchQuery, searchField, sortMode);

  // Current detail record and its index within displayRecords
  const detailIndex = detailRecordId ? displayRecords.findIndex(r => r.id === detailRecordId) : -1;
  const detailRecord = detailIndex >= 0 ? displayRecords[detailIndex] : null;

  const openRecord = useCallback((id: string) => {
    setDetailRecordId(id);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailRecordId(null);
  }, []);

  const goToPrev = useCallback(() => {
    if (detailIndex > 0) setDetailRecordId(displayRecords[detailIndex - 1].id);
  }, [detailIndex, displayRecords]);

  const goToNext = useCallback(() => {
    if (detailIndex < displayRecords.length - 1) setDetailRecordId(displayRecords[detailIndex + 1].id);
  }, [detailIndex, displayRecords]);

  const openAddModal = useCallback(() => {
    setEditingRecordId(null);
    setModalMode('add');
  }, []);

  const openEditModal = useCallback(() => {
    if (detailRecord) {
      setEditingRecordId(detailRecord.id);
      setModalMode('edit');
    }
  }, [detailRecord]);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingRecordId(null);
  }, []);

  const handleSave = useCallback((values: FormValues) => {
    if (modalMode === 'add') {
      const newRecord = addRecord(values);
      closeModal();
      setDetailRecordId(newRecord.id);
    } else if (modalMode === 'edit' && editingRecordId) {
      updateRecord(editingRecordId, values);
      closeModal();
    }
  }, [modalMode, editingRecordId, addRecord, updateRecord, closeModal]);

  const handleDelete = useCallback((id: string) => {
    deleteRecord(id);
    closeModal();
    // Navigate away from detail view after delete
    setDetailRecordId(null);
  }, [deleteRecord, closeModal]);

  const editingRecord = editingRecordId ? records.find(r => r.id === editingRecordId) ?? null : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header onAddRecord={openAddModal} />

      <main style={{ flex: 1 }}>
        {detailRecord ? (
          <RecordDetail
            record={detailRecord}
            currentIndex={detailIndex}
            totalCount={displayRecords.length}
            onPrev={goToPrev}
            onNext={goToNext}
            onEdit={openEditModal}
            onBack={closeDetail}
          />
        ) : (
          <RecordTable
            records={displayRecords}
            searchQuery={searchQuery}
            searchField={searchField}
            sortMode={sortMode}
            isFiltered={isFiltered}
            onSearchQueryChange={setSearchQuery}
            onSearchFieldChange={setSearchField}
            onSortModeChange={setSortMode}
            onOpenRecord={openRecord}
          />
        )}
      </main>

      <RecordModal
        mode={modalMode}
        record={editingRecord}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={closeModal}
      />
    </div>
  );
}
