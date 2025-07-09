'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../../components/Layout';
import { Card, Button, Badge } from '@/app/components/ui';
import AddWordModal from '../components/AddWordModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useWordMazeStore } from '../../../lib/stores/wordMazeStore';
import { useWordMazeService } from '../../../lib/services/wordMazeService';
import WordCardOptimistic from '../../components/molecules/WordCardOptimistic';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

// Mock data for demonstration
const mockUserStats = {
  totalWords: 247,
  wordsLearned: 89,
  currentStreak: 12,
  totalPoints: 2840,
      level: 'Advanced',
    accuracy: 87
};

const mockAchievements = [
  { id: 1, title: 'Word Collector', description: 'Added 100 words to your bank', icon: '📚', unlocked: true },
  { id: 2, title: 'Streak Master', description: 'Maintained a 7-day learning streak', icon: '🔥', unlocked: true },
  { id: 3, title: 'Perfect Score', description: 'Achieved 100% accuracy in a session', icon: '⭐', unlocked: false }
];

const mockLearningPath = [
  { id: '1', title: 'Beginner Basics', words: 25, completed: 20, difficulty: 'Beginner' },
  { id: '2', title: 'Intermediate Insights', words: 30, completed: 15, difficulty: 'Intermediate' },
  { id: '3', title: 'Advanced Adventures', words: 40, completed: 5, difficulty: 'Advanced' }
];

export default function WordMazeLearnPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  
  // Optimistic UI integration
  const { 
    words, 
    notification, 
    clearNotification, 
    getPendingWords,
    getSyncedWords,
    isLoading: storeLoading,
  } = useWordMazeStore();
  
  const { addWordWithOptimisticUpdate, loadWords } = useWordMazeService();

  // Memoize loadWords to prevent infinite loops
  const memoizedLoadWords = useCallback(async () => {
    if (user) {
      await loadWords(12, 0);
    }
  }, [user, loadWords]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'learn', label: 'Learn', icon: '🎯' },
    { id: 'review', label: 'Review', icon: '🔄' },
    { id: 'collection', label: 'Collection', icon: '📚' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' }
  ];

  // Redirect non-authenticated users
  useEffect(() => {
    if (!user) {
      router.push('/word-maze');
    }
  }, [user, router]);

  // Load words on component mount - only once when user is available
  useEffect(() => {
    if (user) {
      memoizedLoadWords();
    }
  }, [user]); // Remove loadWords from dependencies to prevent infinite loop

  const startLearningSession = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Navigate to learning session or show session modal
    console.log('Starting learning session...');
  };

  const handleAddWords = async (words: string[]) => {
    try {
      console.log('Adding words:', words);
      
      // Use the service for each word to get optimistic updates and reordering
      for (const word of words) {
        await addWordWithOptimisticUpdate(word);
      }

    } catch (error) {
      console.error('Error adding words:', error);
    }
  };

  // Get display words (synced + pending)
  const displayWords = words.slice(0, 8); // Show first 8 words
  const pendingCount = getPendingWords().length;
  const syncedCount = getSyncedWords().length;

  // Show loading if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-token-surface-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary mx-auto mb-4"></div>
          <div className="token-text-secondary">Loading your learning journey...</div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Notification */}
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

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-token-surface token-text-primary py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                🧩 Word Maze
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Smart vocabulary learning that adapts to your journey. Connect words, unlock paths, and build fluency naturally.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={startLearningSession}
                  disabled={isLoading}
                  className="bg-token-primary token-text-inverse hover:bg-token-primary-hover"
                >
                  {isLoading ? 'Loading...' : 'Start Learning Session'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowAddWordModal(true)}
                  className="token-primary-border token-text-primary hover:bg-token-primary-light"
                >
                  Add New Word {" "}
                  <PlusIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Add Word Modal */}
        {showAddWordModal && (
          <AddWordModal
            isOpen={showAddWordModal}
            onClose={() => setShowAddWordModal(false)}
            onAddWords={handleAddWords}
          />
        )}

        {/* Word List Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold token-text-primary mb-6">Your Words</h2>
            {storeLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-64 p-6 animate-pulse bg-token-surface-elevated min-w-[260px] max-w-full" aria-label="Loading word card">
                    <div className="h-6 bg-token-surface-subtle rounded mb-4"></div>
                    <div className="h-4 bg-token-surface-subtle rounded mb-2"></div>
                    <div className="h-4 bg-token-surface-subtle rounded mb-2"></div>
                    <div className="h-4 bg-token-surface-subtle rounded w-3/4"></div>
                  </Card>
                ))}
              </div>
            ) : displayWords.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayWords.map((word) => (
                  <WordCardOptimistic
                    key={word.id}
                    word={word}
                    showModal={selectedWordId === word.id}
                    setShowModalId={setSelectedWordId}
                    cardClassName="h-64 min-w-[260px] max-w-full"
                    aria-label={`Word card for ${word.word}`}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="text-7xl mb-6">🧩</div>
                <h3 className="text-2xl font-semibold token-text-primary mb-2">No words yet</h3>
                <p className="token-text-secondary mb-6 text-center max-w-md">
                  Start building your vocabulary by adding your first word! Your words will appear here as beautiful cards.
                </p>
                <Button
                  onClick={() => setShowAddWordModal(true)}
                  className="bg-token-primary token-text-inverse hover:bg-token-primary-hover px-8 py-3 text-lg"
                >
                  Add Your First Word
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
} 