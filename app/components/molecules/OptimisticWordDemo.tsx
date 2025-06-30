'use client';
import React, { useState, useEffect } from 'react';
import { Button, Input, Card } from '../ui';
import { useWordMazeStore, Word } from '../../../lib/stores/wordMazeStore';
import { useWordMazeService } from '../../../lib/services/wordMazeService';
import WordCardOptimistic from './WordCardOptimistic';
import { WordStatusIndicator } from './WordStatusIndicator';

export default function OptimisticWordDemo() {
  const [newWord, setNewWord] = useState('');
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  
  const { 
    words, 
    isLoading, 
    error, 
    getPendingWords, 
    getSyncedWords,
    clearError 
  } = useWordMazeStore();
  
  const { addWordWithOptimisticUpdate, loadWords } = useWordMazeService();

  // Load initial words
  useEffect(() => {
    loadWords();
  }, []);

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    await addWordWithOptimisticUpdate(newWord.trim());
    setNewWord('');
  };

  const handleAddMultipleWords = async () => {
    const testWords = ['serendipity', 'ephemeral', 'mellifluous', 'ubiquitous'];
    
    for (const word of testWords) {
      await addWordWithOptimisticUpdate(word);
      // Small delay to see the optimistic updates
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const pendingWords = getPendingWords();
  const syncedWords = getSyncedWords();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Optimistic UI Demo - Word Maze
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This demo showcases optimistic UI updates using Zustand. Words appear instantly 
          with a "pending" status, then sync with the backend. Watch the status indicators 
          change from "Pending" → "Syncing" → "Synced".
        </p>
      </div>

      {/* Add Word Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Word</h2>
        <form onSubmit={handleAddWord} className="flex gap-4 mb-4">
          <Input
            type="text"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Enter a word..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newWord.trim() || isLoading}>
            Add Word
          </Button>
        </form>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleAddMultipleWords}
            variant="outline"
            disabled={isLoading}
          >
            Add Test Words
          </Button>
          <Button 
            onClick={() => loadWords()}
            variant="outline"
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{words.length}</div>
          <div className="text-sm text-gray-600">Total Words</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingWords.length}</div>
          <div className="text-sm text-gray-600">Pending/Syncing</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{syncedWords.length}</div>
          <div className="text-sm text-gray-600">Synced</div>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex justify-between items-center">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
            <Button onClick={clearError} variant="outline" size="sm">
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading words...</p>
        </Card>
      )}

      {/* Words Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Words</h2>
        {words.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No words yet. Add your first word above!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {words.map((word) => (
              <WordCardOptimistic
                key={word.id}
                word={word}
                showModal={selectedWordId === word.id}
                setShowModalId={setSelectedWordId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Legend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <WordStatusIndicator status="pending" />
            <span className="text-sm">Pending - Word added locally</span>
          </div>
          <div className="flex items-center gap-2">
            <WordStatusIndicator status="syncing" />
            <span className="text-sm">Syncing - Communicating with server</span>
          </div>
          <div className="flex items-center gap-2">
            <WordStatusIndicator status="synced" />
            <span className="text-sm">Synced - Successfully saved</span>
          </div>
          <div className="flex items-center gap-2">
            <WordStatusIndicator status="error" error="Test error" />
            <span className="text-sm">Error - Failed to sync</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
