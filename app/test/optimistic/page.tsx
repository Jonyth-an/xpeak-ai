'use client';
import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import { Card, Button, Text, Badge } from '@/app/components/ui';
import { useWordMazeStore } from '../../../lib/stores/wordMazeStore';
import { useWordMazeService } from '../../../lib/services/wordMazeService';
import WordCardOptimistic from '../../../app/components/molecules/WordCardOptimistic';
import { WordStatusIndicator, BulkOperationProgress } from '../../../app/components/molecules/WordStatusIndicator';

export default function OptimisticUIDemo() {
  const [newWord, setNewWord] = useState('');
  const [bulkWords, setBulkWords] = useState('');
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState({ total: 0, completed: 0, failed: 0 });

  const { 
    words, 
    notification, 
    clearNotification, 
    getPendingWords,
    getSyncedWords,
    getErrorWords,
    isLoading,
    error
  } = useWordMazeStore();
  
  const { 
    addWordWithOptimisticUpdate,
    addWordsBulkWithOptimisticUpdate,
    deleteWordWithOptimisticUpdate,
    loadWords 
  } = useWordMazeService();

  const handleAddSingleWord = async () => {
    if (!newWord.trim()) return;
    await addWordWithOptimisticUpdate(newWord.trim());
    setNewWord('');
  };

  const handleBulkAdd = async () => {
    if (!bulkWords.trim()) return;
    const wordList = bulkWords.split('\n').map(w => w.trim()).filter(w => w);
    setBulkProgress({ total: wordList.length, completed: 0, failed: 0 });
    await addWordsBulkWithOptimisticUpdate(wordList);
    setBulkWords('');
  };

  const handleDeleteWord = async (wordId: string) => {
    await deleteWordWithOptimisticUpdate(wordId);
  };

  const loadDemoWords = async () => {
    await loadWords(10, 0);
  };

  const pendingWords = getPendingWords();
  const syncedWords = getSyncedWords();
  const errorWords = getErrorWords();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 Optimistic UI Demo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of optimistic UI patterns with instant feedback, 
              real-time status updates, and seamless error recovery.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {words.length}
              </div>
              <div className="text-gray-600">Total Words</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {syncedWords.length}
              </div>
              <div className="text-gray-600">Synced</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {pendingWords.length}
              </div>
              <div className="text-gray-600">Pending</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {errorWords.length}
              </div>
              <div className="text-gray-600">Errors</div>
            </Card>
          </div>

          {/* Notification */}
          {notification && (
            <div className={`mb-6 p-4 rounded-lg shadow-lg border-2 ${
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
                  className="ml-auto text-white hover:text-gray-200"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Demo Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Single Word Addition */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Single Word Addition</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add a single word
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      placeholder="Enter a word..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSingleWord()}
                    />
                    <Button onClick={handleAddSingleWord} disabled={!newWord.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Word appears instantly with "Pending" status</p>
                  <p>• Status changes to "Syncing" during API call</p>
                  <p>• Updates to "Synced" on success or "Error" on failure</p>
                </div>
              </div>
            </Card>

            {/* Bulk Word Addition */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Bulk Word Addition</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add multiple words (one per line)
                  </label>
                  <textarea
                    value={bulkWords}
                    onChange={(e) => setBulkWords(e.target.value)}
                    placeholder="serendipity&#10;ubiquitous&#10;ephemeral&#10;mellifluous"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button 
                    onClick={handleBulkAdd} 
                    disabled={!bulkWords.trim()}
                    className="mt-2"
                  >
                    Add All
                  </Button>
                </div>
                {bulkProgress.total > 0 && (
                  <BulkOperationProgress
                    total={bulkProgress.total}
                    completed={bulkProgress.completed}
                    failed={bulkProgress.failed}
                  />
                )}
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Button onClick={loadDemoWords} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load Demo Words'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => addWordsBulkWithOptimisticUpdate(['serendipity', 'ubiquitous', 'ephemeral'])}
              >
                Add Test Words
              </Button>
              <Button 
                variant="outline" 
                onClick={() => addWordsBulkWithOptimisticUpdate(['invalid-word-123', 'another-invalid-456'])}
              >
                Test Error Handling
              </Button>
            </div>
          </Card>

          {/* Status Legend */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Status Indicators</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <WordStatusIndicator status="pending" />
                <div>
                  <div className="font-medium">Pending</div>
                  <div className="text-sm text-gray-600">Added locally, waiting to sync</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WordStatusIndicator status="syncing" />
                <div>
                  <div className="font-medium">Syncing</div>
                  <div className="text-sm text-gray-600">Communicating with backend</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WordStatusIndicator status="synced" />
                <div>
                  <div className="font-medium">Synced</div>
                  <div className="text-sm text-gray-600">Successfully saved to database</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <WordStatusIndicator status="error" error="Network error" showDetails />
                <div>
                  <div className="font-medium">Error</div>
                  <div className="text-sm text-gray-600">Failed to sync, with retry option</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Word Display */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Word Collection</h2>
                             <div className="flex gap-2">
                 <Badge className="bg-green-100 text-green-800">
                   {syncedWords.length} Synced
                 </Badge>
                 <Badge className="bg-orange-100 text-orange-800">
                   {pendingWords.length} Pending
                 </Badge>
                 <Badge className="bg-red-100 text-red-800">
                   {errorWords.length} Errors
                 </Badge>
               </div>
            </div>

            {words.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No words yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add some words above to see the optimistic UI in action!
                </p>
                <Button onClick={() => addWordsBulkWithOptimisticUpdate(['serendipity', 'ubiquitous', 'ephemeral'])}>
                  Add Demo Words
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {words.map((word) => (
                  <div key={word.id} className="relative">
                    <WordCardOptimistic
                      word={word}
                      showModal={selectedWordId === word.id}
                      setShowModalId={setSelectedWordId}
                      cardClassName="h-64"
                    />
                    <button
                      onClick={() => handleDeleteWord(word.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      title="Delete word"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {errorWords.length > 0 && (
            <Card className="p-6 mt-8 border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold text-red-900 mb-4">Words with Errors</h3>
              <div className="space-y-2">
                {errorWords.map((word) => (
                  <div key={word.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{word.word}</span>
                      <WordStatusIndicator status="error" error={word.error} showDetails />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteWord(word.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
} 