'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { Card, Button, Text, Badge } from '@/app/components/ui';
import AddWordModal from '../components/AddWordModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CompleteWordData } from '../../../lib/types/wordMaze';
import { useWordMazeStore } from '../../../lib/stores/wordMazeStore';
import { useWordMazeService } from '../../../lib/services/wordMazeService';
import WordModal from '../components/WordModal';
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
  const [loadingWords, setLoadingWords] = useState(true);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  
  // Optimistic UI integration
  const { 
    words, 
    notification, 
    clearNotification, 
    setNotification,
    getPendingWords,
    getSyncedWords,
    isLoading: storeLoading,
    error: storeError
  } = useWordMazeStore();
  
  const { addWordWithOptimisticUpdate, loadWords } = useWordMazeService();

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

  // Load words on component mount
  useEffect(() => {
    if (user) {
      loadWords(12, 0);
    }
  }, [user]);

  // Helper function to get the primary definition
  function getPrimaryDefinition(word: any): string {
    if (word.definition) {
      return word.definition;
    }
    return 'No definition available';
  }

  // Helper function to get mastery status (mock for now)
  function getMasteryStatus(word: any): { status: string; color: string } {
    // Use a stable hash of the word to generate consistent status
    const hash = word.word.split('').reduce((a: number, b: string) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const normalized = Math.abs(hash) % 100;
    
    if (normalized > 70) {
      return { status: 'Mastered', color: 'bg-gray-900 text-white' };
    } else if (normalized > 40) {
      return { status: 'Learning', color: 'bg-blue-100 text-blue-700' };
    } else {
      return { status: 'Review', color: 'bg-yellow-100 text-yellow-700' };
    }
  }

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

  const handleDeleteWord = async (wordId: string) => {
    try {
      const response = await fetch(`/api/word-maze/words/${wordId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Show success notification
        setNotification({ type: 'success', message: 'Word deleted successfully!' });
      } else {
        console.error('Failed to delete word');
        setNotification({ type: 'error', message: 'Failed to delete word' });
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      setNotification({ type: 'error', message: 'Error deleting word' });
    }
  };

  // Get display words (synced + pending)
  const displayWords = words.slice(0, 8); // Show first 8 words
  const pendingCount = getPendingWords().length;
  const syncedCount = getSyncedWords().length;

  // Show loading if user is not authenticated
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white text-gray-900 py-20 px-4 sm:px-6 lg:px-8">
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
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isLoading ? 'Loading...' : 'Start Learning Session'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setShowAddWordModal(true)}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Add New Word {" "}
                  <PlusIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce">📚</div>
          <div className="absolute top-20 right-20 text-3xl opacity-20 animate-pulse">🎯</div>
          <div className="absolute bottom-10 left-1/4 text-2xl opacity-20 animate-spin">⚡</div>
        </section>

        {/* Stats Overview */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {syncedCount + pendingCount}
                </div>
                <div className="text-gray-600">Total Words</div>
                {pendingCount > 0 && (
                  <div className="text-sm text-orange-600 mt-1">
                    {pendingCount} syncing...
                  </div>
                )}
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {mockUserStats.wordsLearned}
                </div>
                <div className="text-gray-600">Words Learned</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {mockUserStats.currentStreak}
                </div>
                <div className="text-gray-600">Day Streak</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {mockUserStats.totalPoints}
                </div>
                <div className="text-gray-600">Total Points</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-12">
                {/* Recent Words Section */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Words</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddWordModal(true)}
                        className="flex items-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Word
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => router.push('/word-maze/learn/all')}
                        className="flex items-center gap-2"
                      >
                        <span>View All</span>
                      </Button>
                    </div>
                  </div>

                  {storeLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i} className="h-64 p-6 animate-pulse">
                          <div className="h-6 bg-gray-200 rounded mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </Card>
                      ))}
                    </div>
                  ) : displayWords.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Card className="p-12 text-center">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No words yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Start building your vocabulary by adding your first word!
                      </p>
                      <Button
                        onClick={() => setShowAddWordModal(true)}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Add Your First Word
                      </Button>
                    </Card>
                  )}
                </div>

                {/* Learning Path Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Paths</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mockLearningPath.map((path) => (
                      <Card key={path.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {path.title}
                          </h3>
                          <Badge variant="outline">{path.difficulty}</Badge>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{path.completed}/{path.words}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(path.completed / path.words) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={path.completed === path.words}
                        >
                          {path.completed === path.words ? 'Completed' : 'Continue'}
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Achievements Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mockAchievements.map((achievement) => (
                      <Card
                        key={achievement.id}
                        className={`p-6 text-center transition-all duration-300 ${
                          achievement.unlocked
                            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`text-4xl mb-4 ${
                          achievement.unlocked ? '' : 'grayscale opacity-50'
                        }`}>
                          {achievement.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {achievement.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && (
                          <div className="mt-4">
                            <Badge className="bg-green-100 text-green-800">
                              Unlocked
                            </Badge>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'learn' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Sessions</h2>
                <p className="text-gray-600 mb-8">
                  Interactive learning sessions coming soon...
                </p>
                <Button
                  size="lg"
                  onClick={startLearningSession}
                  disabled={isLoading}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isLoading ? 'Loading...' : 'Start Learning Session'}
                </Button>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Mode</h2>
                <p className="text-gray-600 mb-8">
                  Spaced repetition review system coming soon...
                </p>
              </div>
            )}

            {activeTab === 'collection' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Word Collection</h2>
                <p className="text-gray-600 mb-8">
                  Full word collection management coming soon...
                </p>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h2>
                <p className="text-gray-600 mb-8">
                  Achievement system coming soon...
                </p>
              </div>
            )}
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
      </div>
    </Layout>
  );
} 