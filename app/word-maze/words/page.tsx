"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import WordCard from '../../components/molecules/WordCard';
import AddWordModal from '../components/AddWordModal';
import { CompleteWordData } from '../../../lib/types/wordMaze';
import { useWordMazeStore } from '../../../lib/stores/wordMazeStore';
import { useWordMazeService } from '../../../lib/services/wordMazeService';

const PAGE_SIZE = 12;

export default function WordMazeWordsPage() {
  const [words, setWords] = useState<CompleteWordData[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModalId, setShowModalId] = useState<string | null>(null);
  const { notification, clearNotification } = useWordMazeStore();
  const { addWordWithOptimisticUpdate } = useWordMazeService();

  useEffect(() => {
    fetchWords();
    // eslint-disable-next-line
  }, [page]);

  async function fetchWords() {
    setLoading(true);
    console.log(`Fetching words: page=${page}, limit=${PAGE_SIZE}, offset=${(page - 1) * PAGE_SIZE}`);
    
    const res = await fetch(`/api/word-maze/words?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}`);
    const data = await res.json();
    
    console.log('API response:', data);
    
    setWords(data.words || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  async function handleDelete(wordId: string) {
    if (!confirm('Delete this word?')) return;
    await fetch(`/api/word-maze/words?id=${wordId}`, { method: 'DELETE' });
    fetchWords();
  }

  async function handleAddWords(words: string[]) {
    try {
      // Use the service for each word to get optimistic updates and reordering
      for (const word of words) {
        await addWordWithOptimisticUpdate(word);
      }
      
      setShowAddModal(false);
      fetchWords(); // Refresh the list to show updated order
    } catch (error) {
      console.error('Error adding words:', error);
    }
  }

  // Helper function to get the primary definition
  function getPrimaryDefinition(word: CompleteWordData): string {
    if (word.definitions && word.definitions.length > 0) {
      // Try to find a primary definition (is_primary = true or highest confidence)
      const primaryDef = word.definitions.find(def => def.confidence > 0.8);
      if (primaryDef) {
        return primaryDef.text;
      }
      // Fall back to the first definition
      return word.definitions[0].text;
    }
    return 'No definition available';
  }

  // Detect duplicate IDs
  const idCount: Record<string, number> = {};
  words.forEach(word => {
    idCount[word.id] = (idCount[word.id] || 0) + 1;
  });
  const duplicateIds = Object.keys(idCount).filter(id => idCount[id] > 1);
  if (duplicateIds.length > 0) {
    // eslint-disable-next-line no-console
    console.warn('Duplicate word IDs detected:', duplicateIds);
  }

  return (
    <div className="min-h-screen bg-token-surface-subtle">
      {/* Shared Notification UI */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-xl border-2 ${
          notification.type === 'success'
            ? 'bg-token-success text-token-text-inverse border-token-success-dark'
            : 'bg-token-error text-token-text-inverse border-token-error-dark'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            <span>{notification.message}</span>
                          <button
                onClick={clearNotification}
                className="ml-2 text-token-text-inverse hover:text-token-text-inverse/80"
              >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Word Maze Words</h1>
          <Button onClick={() => setShowAddModal(true)} variant="outline">Add New Word</Button>
        </div>
        <AddWordModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAddWords={handleAddWords} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-8">
              <div className="text-gray-600">Loading words...</div>
              <div className="text-sm text-gray-500 mt-2">Page {page} • {total} total words</div>
            </div>
          ) : words.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-8">
              {page === 1 ? 'No words found.' : 'No more words on this page.'}
            </div>
          ) : (
            words.map(word => (
              <WordCard
                key={word.id}
                id={word.id}
                word={word.word}
                definition={getPrimaryDefinition(word)}
                dateAdded={word.created_at}
                onDelete={() => handleDelete(word.id)}
                showModal={false}
                setShowModalId={setShowModalId}
                cardClassName={`h-64 p-6 ${duplicateIds.includes(word.id) ? 'border-red-500 border-2' : ''}`}
              />
            ))
          )}
        </div>
        {showModalId && (() => {
          const word = words.find(w => w.id === showModalId);
          if (!word) return null;
          // Safely extract pronunciationUrls and imageUrl from metadata if present
          let pronunciationUrls = undefined;
          let imageUrl = undefined;
          if (word.metadata) {
            if (word.metadata.pronunciationUrls) {
              pronunciationUrls = word.metadata.pronunciationUrls;
            }
            if (word.metadata.imageUrl) {
              imageUrl = word.metadata.imageUrl;
            }
          }
          return (
            <div className="fixed inset-0 bg-token-surface bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-lg">
                <WordCard
                  id={word.id}
                  word={word.word}
                  definition={getPrimaryDefinition(word)}
                  dateAdded={word.created_at}
                  onDelete={() => handleDelete(word.id)}
                  showModal={true}
                  setShowModalId={setShowModalId}
                  cardClassName={`h-64 p-6 ${duplicateIds.includes(word.id) ? 'border-red-500 border-2' : ''}`}
                  {...(pronunciationUrls ? { pronunciationUrls } : {})}
                  {...(imageUrl ? { imageUrl } : {})}
                />
              </div>
            </div>
          );
        })()}
        <div className="flex justify-between items-center mt-8">
          <Button 
            onClick={() => {
              console.log('Previous button clicked, current page:', page);
              setPage(p => Math.max(1, p - 1));
            }} 
            disabled={page === 1}
          >
            Previous
          </Button>
          <span>Page {page} of {Math.ceil(total / PAGE_SIZE) || 1}</span>
          <Button 
            onClick={() => {
              console.log('Next button clicked, current page:', page, 'total:', total, 'PAGE_SIZE:', PAGE_SIZE);
              setPage(p => (p * PAGE_SIZE < total ? p + 1 : p));
            }} 
            disabled={page * PAGE_SIZE >= total}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 