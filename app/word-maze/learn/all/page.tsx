'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../../../../components/Layout';
import { Card, Button } from '@/app/components/ui';
import WordCardOptimistic from '@/app/components/molecules/WordCardOptimistic';
import { useWordMazeStore } from '../../../../lib/stores/wordMazeStore';
import { useWordMazeService } from '../../../../lib/services/wordMazeService';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function WordMazeAllWordsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { words, isLoading, getPendingWords, getSyncedWords } = useWordMazeStore();
  const { addWordWithOptimisticUpdate, loadWords: reloadWords, loadWordsloadWords } = useWordMazeService();
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/word-maze');
    } else {
      loadWords(1000, 0); // Load all words (arbitrary high limit)
      setLoading(false);
    }
  }, [user]);

  const handleSync = async () => {
    setLoading(true);
    await reloadWords(1000, 0);
    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">All Words</h1>
              <p className="text-gray-600">Browse and manage your entire vocabulary collection.</p>
            </div>
            <Button onClick={handleSync} variant="outline" className="flex items-center gap-2">
              <span>🔄</span> Sync New Words
            </Button>
          </div>
          {isLoading || loading ? (
            <div className="text-center py-12 text-gray-500">Loading all words...</div>
          ) : words.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No words found. Add some to get started!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {words.map(word => (
                <WordCardOptimistic
                  key={word.id}
                  word={word}
                  showModal={selectedWordId === word.id}
                  setShowModalId={setSelectedWordId}
                  cardClassName="h-64"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
} 