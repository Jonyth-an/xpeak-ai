'use client';
import React from 'react';
import { Button } from '@/app/components/ui';
import WordCardOptimistic from '../../components/molecules/WordCardOptimistic';
import ConfirmationModal from '@/app/components/molecules/ConfirmationModal';
import WordModal from './WordModal';
import BulkImportModal from './BulkImportModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useWordMazeStore } from '../../../lib/stores/wordMazeStore';
import type { WordMazeState } from '../../../lib/stores/wordMazeStore';
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
  } = useWordMazeStore() as WordMazeState;
  
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
    // On; success:
    // setWords([...words, ...newWords]);
    // showFeedback('success', `${newWords.length} words added!`);
    // On error:
    // showFeedback('error', 'Failed to add words.');Onerror
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
    <section className="bg-token-surface-accent-light py-token-16 px-token-4 sm:px-token-6 lg:px-token-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-token-12">
          <h2 className="text-token-heading-xl font-token-bold text-token-text mb-token-4">
            My Word Bank
          </h2>
          <p className="text-token-body-lg text-token-text-secondary max-w-token-2xl mx-auto">
            Your personal collection of words you've learned and want to remember.
          </p>
        </div>

        {/* Smart Check Toggle */}
        <div className="flex items-center gap-token-3 mb-token-6">
          <label className="flex items-center gap-token-2 cursor-pointer">
            <input
              type="checkbox"
              checked={smartCheck}
              onChange={(e) => setSmartCheck(e.target.checked)}
              className="rounded"
            />
            <span className="text-token-body-sm font-token-medium text-token-text">Smart Check (Beta)</span>
          </label>
        </div>

        {/* Header with Action Buttons */}
        <div className="flex justify-between items-center mb-token-8">
          <div>
            <h2 className="text-token-heading-lg font-token-bold text-token-text mb-token-2">My Word Bank</h2>
            <p className="text-token-text-secondary">
              Manage and review your vocabulary collection
              {pendingCount > 0 && (
                <span className="ml-token-2 text-token-warning text-token-body-sm">
                  ({pendingCount} syncing...)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-token-3">
            <Button
              variant="secondary"
              onClick={() => setBulkImportModalOpen(true)}
            >
              Bulk Import
            </Button>
            <Button 
              variant="primary"
              onClick={() => setAddModalOpen(true)}
            >
              Add More Words
            </Button>
          </div>
        </div>

        {/* Word Grid */}
        {storeLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-6 mb-token-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-token-lg shadow-token-md p-token-6 animate-pulse">
                <div className="h-6 bg-token-surface-accent rounded-token mb-token-4"></div>
                <div className="h-4 bg-token-surface-accent rounded-token mb-token-2"></div>
                <div className="h-4 bg-token-surface-accent rounded-token mb-token-2"></div>
                <div className="h-4 bg-token-surface-accent rounded-token w-3/4"></div>
              </div>
            ))}
          </div>
        ) : displayWords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-6 mb-token-8">
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
          <div className="text-center py-token-12">
            <div className="text-token-6xl mb-token-4">📚</div>
            <h3 className="text-token-heading-lg font-token-semibold text-token-text mb-token-2">
              Your Word Bank is Empty
            </h3>
            <p className="text-token-text-secondary mb-token-6 max-w-token-md mx-auto">
              Start building your vocabulary collection by adding your first words.
            </p>
            <Button 
              variant="primary"
              onClick={() => setAddModalOpen(true)}
            >
              Add Your First Word
            </Button>
          </div>
        )}

        {/* Stats Summary */}
        {displayWords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-token-6 mb-token-8">
            <div className="bg-white rounded-token-lg p-token-6 text-center shadow-token-sm">
              <div className="text-token-heading-lg font-token-bold text-token-primary mb-token-2">
                {syncedCount + pendingCount}
              </div>
              <div className="text-token-text-secondary">Total Words</div>
            </div>
            <div className="bg-white rounded-token-lg p-token-6 text-center shadow-token-sm">
              <div className="text-token-heading-lg font-token-bold text-token-success mb-token-2">
                {syncedCount}
              </div>
              <div className="text-token-text-secondary">Synced Words</div>
            </div>
            <div className="bg-white rounded-token-lg p-token-6 text-center shadow-token-sm">
              <div className="text-token-heading-lg font-token-bold text-token-warning mb-token-2">
                {pendingCount}
              </div>
              <div className="text-token-text-secondary">Pending Sync</div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`fixed top-token-4 right-token-4 z-[9999] p-token-4 rounded-token-lg shadow-token-xl border-2 ${
            notification.type === 'success' 
              ? 'bg-token-success text-token-white border-token-success' 
              : 'bg-token-error text-token-white border-token-error'
          }`}>
            <div className="flex items-center gap-token-2">
              <span className="font-token-semibold">
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
              <span>{notification.message}</span>
              <button 
                onClick={clearNotification}
                className="ml-token-2 text-token-white hover:text-token-secondary"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
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
          
          {bulkImportModalOpen && (
            <BulkImportModal
              open={bulkImportModalOpen}
              onClose={() => setBulkImportModalOpen(false)}
              onImportWords={handleBulkImportWords}
              smartCheck={smartCheck}
            />
          )}
          
          {modalOpen && (
            <ConfirmationModal
              open={modalOpen}
              onCancel={cancelDelete}
              onConfirm={confirmDelete}
              title="Delete Word"
              description="Are you sure you want to delete this word? This action cannot be undone."
              confirmLabel="Delete"
              cancelLabel="Cancel"
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
} 