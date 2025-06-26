'use client';
import React from 'react';
import { Button } from '@/app/components/ui';
import WordCard from '../../components/molecules/WordCard';
import ConfirmationModal from '@/app/components/molecules/ConfirmationModal';
import WordModal from './WordModal';
import BulkImportModal from './BulkImportModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyWordBankSection() {
  const initialWords = [
    {
      id: '1',
      word: 'Serendipity',
      pronunciationUrls: {
        us: '/audio/serendipity-us.mp3',
        uk: '/audio/serendipity-uk.mp3'
      },
      definition: 'The occurrence of events by chance in a happy way.',
      imageUrl: '/images/words/serendipity.jpg',
      dateAdded: '2024-01-15'
    },
    {
      id: '2',
      word: 'Ubiquitous',
      pronunciationUrls: {
        us: '/audio/ubiquitous-us.mp3',
        uk: '/audio/ubiquitous-uk.mp3',
        au: '/audio/ubiquitous-au.mp3'
      },
      definition: 'Present, appearing, or found everywhere.',
      imageUrl: '/images/words/ubiquitous.jpg',
      dateAdded: '2024-01-10'
    },
    {
      id: '3',
      word: 'Ephemeral',
      pronunciationUrls: {
        us: '/audio/ephemeral-us.mp3',
        uk: '/audio/ephemeral-uk.mp3'
      },
      definition: 'Lasting for a very short time.',
      imageUrl: '/images/words/ephemeral.jpg',
      dateAdded: '2024-01-05'
    }
  ];
  const [words, setWords] = React.useState(initialWords);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string|null>(null);
  // Smart Check toggle (beta)
  const [smartCheck, setSmartCheck] = React.useState(false);
  // Feedback state for toast/snackbar
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Add Word Modal state
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  // Edit Word Modal state
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editingWord, setEditingWord] = React.useState<any>(null);
  // Bulk Import Modal state
  const [bulkImportModalOpen, setBulkImportModalOpen] = React.useState(false);

  // Always restore the sample words on mount for demo/testing
  React.useEffect(() => {
    setWords(initialWords);
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
      setWords(words => words.filter(w => w.id !== pendingDeleteId));
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
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
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
    setWords(prev => [...prev, { ...newWord, id: Date.now().toString(), dateAdded: new Date().toISOString().slice(0, 10) }]);
    showFeedback('success', '1 word added!');
    setAddModalOpen(false);
  }

  function handleEditWordModal(updatedWord: any) {
    // Basic validation
    if (!updatedWord.word || !updatedWord.definition) {
      showFeedback('error', 'Word and definition are required.');
      return;
    }
    setWords(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
    showFeedback('success', 'Word updated!');
    setEditModalOpen(false);
    setEditingWord(null);
  }

  function handleEditWord(word: any) {
    setEditingWord(word);
    setEditModalOpen(true);
  }

  function handleBulkImportWords(newWords: any[]) {
    setWords(prev => [...prev, ...newWords]);
    showFeedback('success', `${newWords.length} words imported!`);
  }

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
            <p className="text-gray-600">Manage and review your vocabulary collection</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {words.map((word) => (
            <WordCard
              key={word.id}
              id={word.id}
              word={word.word}
              pronunciationUrls={word.pronunciationUrls}
              definition={word.definition}
              imageUrl={word.imageUrl}
              dateAdded={word.dateAdded}
              onDelete={() => requestDelete(word.id)}
              onClick={() => handleEditWord(word)}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button variant="accent" size="lg" onClick={() => setAddModalOpen(true)}>
            Add More Words
          </Button>
        </div>
        <WordModal
          open={addModalOpen}
          mode="add"
          onClose={() => setAddModalOpen(false)}
          onAddWord={handleAddWordModal}
          smartCheck={smartCheck}
        />
        <WordModal
          open={editModalOpen}
          mode="edit"
          onClose={() => {
            setEditModalOpen(false);
            setEditingWord(null);
          }}
          onAddWord={() => {}} // Not used in edit mode
          onEditWord={handleEditWordModal}
          smartCheck={smartCheck}
          initialWord={editingWord}
        />
        <BulkImportModal
          open={bulkImportModalOpen}
          onClose={() => setBulkImportModalOpen(false)}
          onImportWords={handleBulkImportWords}
          smartCheck={smartCheck}
        />
        <ConfirmationModal
          open={modalOpen}
          title="Delete Word?"
          description="Are you sure you want to delete this word? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />

        {/* Feedback Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
                feedback.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
              }`}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.3 
              }}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? '✅' : '❌'}
                <span className="font-medium">{feedback.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
} 