'use client';
import React from 'react';
import { Button } from '@/app/components/ui';
import WordCardOptimistic from '../../components/molecules/WordCardOptimistic';
import ConfirmationModal from '@/app/components/molecules/ConfirmationModal';
import WordModal from './WordModal';
import BulkImportModal from './BulkImportModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordMazeStore } from '../../../lib/stores/wordMazeStore';
import { useWordMazeService } from '../../../lib/services/wordMazeService';

export default function MyWordBankSection() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string|null>(null);
  // Smart Check toggle (beta)
  const [smartCheck, setSmartCheck] = React.useState(false);
  // Add Word Modal state
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  // Edit Word Modal state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingWord, setEditingWord] = React.useState<any>(null);
  // Bulk Import Modal state
  const [bulkImportModalOpen, setBulkImportModalOpen] = React.useState(false);
  const [selectedWordId, setSelectedWordId] = React.useState<string | null>(null);

  // Optimistic UI integration
  const { 
    words, 
    notification, 
    clearNotification, 
    setNotification,
    getPendingWords,
    getSyncedWords,
    isLoading: storeLoading,
    error: storeError,
    removeWord
  } = useWordMazeStore();
  
  const { addWordWithOptimisticUpdate, addWordsBulkWithOptimisticUpdate, deleteWordWithOptimisticUpdate, loadWords } = useWordMazeService();

  // Load words on component mount
  React.useEffect(() => {
    loadWords(50, 0); // Load more words for the word bank
  }, []);

  function requestDelete(id: string) {
    console.log('Delete requested for word ID:', id);
    setPendingDeleteId(id);
    setModalOpen(true);
    console.log('Modal state set to open');
  }

  function confirmDelete() {
    console.log('Confirming delete for word ID:', pendingDeleteId);
    if (pendingDeleteId) {
      // Use optimistic deletion with rollback on error
      deleteWordWithOptimisticUpdate(pendingDeleteId);
      
      setPendingDeleteId(null);
      setModalOpen(false);
      console.log('Word deleted, modal closed');
    }
  }

  function cancelDelete() {
    console.log('Delete cancelled');
    setPendingDeleteId(null);
    setModalOpen(false);
  }

  // Handler to show feedback
  function showFeedback(type: 'success' | 'error', message: string) {
    setNotification({ type, message });
    setTimeout(() => clearNotification(), 3000);
  }

  // Placeholder for add word handler
  function handleAddWord(newWords: any[]) {
    // TODO: Add logic to validate and add words
    // On success:
    // setWords([...words, ...newWords]);
    // showFeedback('success', `${newWords.length} words added!`);
    // On error:
    // showFeedback('error', 'Failed to add words.');
  }

  function handleAddWordModal(newWord: any) {
    // Basic validation
    if (!newWord.word || !newWord.definition) {
      showFeedback('error', 'Word and definition are required.');
      return;
    }
    
    // Use optimistic UI to add word
    addWordWithOptimisticUpdate(newWord.word);
    setAddModalOpen(false);
  }

  function handleEditWordModal(updatedWord: any) {
    // Basic validation
    if (!updatedWord.word || !updatedWord.definition) {
      showFeedback('error', 'Word and definition are required.');
      return;
    }
    // TODO: Implement optimistic update for editing
    showFeedback('success', 'Word updated!');
    setEditModalOpen(false);
    setEditingWord(null);
  }

  function handleEditWord(word: any) {
    setEditingWord(word);
    setEditModalOpen(true);
  }

  function handleBulkImportWords(newWords: any[]) {
    // Use optimistic UI for bulk import
    const wordsToAdd = newWords.map(word => word.word).filter(Boolean);
    addWordsBulkWithOptimisticUpdate(wordsToAdd);
  }

  // Get display words (synced + pending)
  const displayWords = words;
  const pendingCount = getPendingWords().length;
  const syncedCount = getSyncedWords().length;

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            My Word Bank
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your personal collection of words you've learned and want to remember.
          </p>
        </div>

        {/* Smart Check Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={smartCheck}
              onChange={(e) => setSmartCheck(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Smart Check (Beta)</span>
          </label>
        </div>

        {/* Header with Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Word Bank</h2>
            <p className="text-gray-600">
              Manage and review your vocabulary collection
              {pendingCount > 0 && (
                <span className="ml-2 text-orange-600 text-sm">
                  ({pendingCount} syncing...)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setBulkImportModalOpen(true)}
            >
              Bulk Import
            </Button>
            <Button onClick={() => setAddModalOpen(true)}>
              Add More Words
            </Button>
          </div>
        </div>

        {/* Word Grid */}
        {storeLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : displayWords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayWords.map((word) => (
              <WordCardOptimistic
                key={word.id}
                word={word}
                showModal={selectedWordId === word.id}
                setShowModalId={setSelectedWordId}
                cardClassName="h-64"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No words in your bank yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your vocabulary by adding your first word!
            </p>
            <Button
              onClick={() => setAddModalOpen(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Your First Word
            </Button>
          </div>
        )}

        {/* Stats Summary */}
        {displayWords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {syncedCount + pendingCount}
              </div>
              <div className="text-gray-600">Total Words</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {syncedCount}
              </div>
              <div className="text-gray-600">Synced Words</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {pendingCount}
              </div>
              <div className="text-gray-600">Pending Sync</div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-xl border-2 ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white border-green-600' 
              : 'bg-red-500 text-white border-red-600'
          }`}>
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
              <span>{notification.message}</span>
              <button 
                onClick={clearNotification}
                className="ml-2 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          open={modalOpen}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Word"
          description="Are you sure you want to delete this word? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />

        {/* Add Word Modal */}
        {addModalOpen && (
          <WordModal
            open={addModalOpen}
            mode="add"
            onClose={() => setAddModalOpen(false)}
            onAddWord={handleAddWordModal}
            smartCheck={smartCheck}
            initialWord={null}
          />
        )}

        {/* Edit Word Modal */}
        {editModalOpen && editingWord && (
          <WordModal
            open={editModalOpen}
            mode="edit"
            onClose={() => setEditModalOpen(false)}
            onAddWord={handleEditWordModal}
            smartCheck={smartCheck}
            initialWord={editingWord}
          />
        )}

        {/* Bulk Import Modal */}
        {bulkImportModalOpen && (
          <BulkImportModal
            open={bulkImportModalOpen}
            onClose={() => setBulkImportModalOpen(false)}
            onImportWords={handleBulkImportWords}
            smartCheck={smartCheck}
          />
        )}
      </div>
    </section>
  );
} 