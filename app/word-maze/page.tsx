'use client';
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Card, Button, Text, Badge } from '@/app/components/ui';
import AddWordModal from './components/AddWordModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CompleteWordData } from '../../lib/types/wordMaze';

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

export default function WordMazePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [recentWords, setRecentWords] = useState<CompleteWordData[]>([]);
  const [loadingWords, setLoadingWords] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'learn', label: 'Learn', icon: '🎯' },
    { id: 'review', label: 'Review', icon: '🔄' },
    { id: 'collection', label: 'Collection', icon: '📚' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' }
  ];

  // Fetch the 8 most recently added words
  useEffect(() => {
    fetchRecentWords();
  }, []);

  async function fetchRecentWords() {
    try {
      setLoadingWords(true);
      const res = await fetch('/api/word-maze/words?limit=8');
      const data = await res.json();
      setRecentWords(data.words || []);
    } catch (error) {
      console.error('Error fetching recent words:', error);
    } finally {
      setLoadingWords(false);
    }
  }

  // Helper function to get the primary definition
  function getPrimaryDefinition(word: CompleteWordData): string {
    if (word.definitions && word.definitions.length > 0) {
      // Try to find a primary definition (highest confidence)
      const primaryDef = word.definitions.find(def => def.confidence > 0.8);
      if (primaryDef) {
        return primaryDef.text;
      }
      // Fall back to the first definition
      return word.definitions[0].text;
    }
    return 'No definition available';
  }

  // Helper function to get mastery status (mock for now)
  function getMasteryStatus(word: CompleteWordData): { status: string; color: string } {
    // Use a stable hash of the word to generate consistent status
    const hash = word.word.split('').reduce((a, b) => {
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
      // Call API to add words to user's word bank
      const response = await fetch('/api/word-maze/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to add words`);
      }

      const result = await response.json();
      console.log('API response:', result);
      
      // Handle the new response format
      let successCount = 0;
      let existsCount = 0;
      let errorCount = 0;

      if (result.results) {
        result.results.forEach((item: any) => {
          if (item.status === 'added') successCount++;
          else if (item.status === 'exists') existsCount++;
        });
      }

      if (result.errors) {
        errorCount = result.errors.length;
      }

      // Build notification message
      let message = '';
      if (successCount > 0) {
        message += `Successfully added ${successCount} word${successCount > 1 ? 's' : ''}`;
      }
      if (existsCount > 0) {
        message += `${message ? '; ' : ''}${existsCount} word${existsCount > 1 ? 's' : ''} already existed`;
      }
      if (errorCount > 0) {
        message += `${message ? '; ' : ''}${errorCount} word${errorCount > 1 ? 's' : ''} failed to add`;
      }
      if (!message) message = 'Words processed (no details)';
      console.log('Setting notification:', { type: errorCount === 0 ? 'success' : 'error', message });
      setNotification({
        type: errorCount === 0 ? 'success' : 'error',
        message
      });

      // Refresh the recent words list
      fetchRecentWords();

      // Clear notification after 5 seconds
      setTimeout(() => {
        console.log('Clearing notification');
        setNotification(null);
      }, 5000);

    } catch (error) {
      console.error('Error adding words:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to add words'
      });
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Before rendering notification
  console.log('Notification state:', notification);

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
                onClick={() => setNotification(null)}
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
                  <PlusIcon className="inline w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute top-10 left-10 text-4xl opacity-20 animate-bounce">📚</div>
          <div className="absolute top-20 right-20 text-3xl opacity-20 animate-pulse">🎯</div>
          <div className="absolute bottom-10 left-1/4 text-2xl opacity-20 animate-spin">⚡</div>
        </section>

        {/* Main Content */}
        <div className="min-h-screen bg-gray-50 pb-24">
          {/* Learning Path Progress & Stats */}
          <section className="max-w-3xl mx-auto mt-8 mb-12">
            <div className="flex justify-between items-center mb-2 text-gray-500 text-sm">
              <span>Today's Progress</span>
              <div className="flex items-center gap-4">
                <span>7 day streak</span>
                <span className="flex items-center gap-1"><span className="text-blue-600">•</span> 245 points</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
            </div>
            <div className="flex justify-between text-center mt-4">
              <div className="flex-1">
                <div className="bg-gray-900 text-white rounded-lg py-2 font-bold">Mastered</div>
                <div className="text-2xl font-bold mt-1">24</div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 text-gray-700 rounded-lg py-2 font-bold">Learning</div>
                <div className="text-2xl font-bold mt-1">12</div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 text-gray-700 rounded-lg py-2 font-bold">Review</div>
                <div className="text-2xl font-bold mt-1">6</div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 text-gray-400 rounded-lg py-2 font-bold">Locked</div>
                <div className="text-2xl font-bold mt-1">18</div>
              </div>
            </div>
          </section>

          {/* Current Word Card */}
          <section className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-400">Image</div>
              <h2 className="text-2xl font-bold mb-1">Serendipity</h2>
              <div className="text-gray-500 italic mb-2">/ˌserənˈdipədē/ • noun</div>
              <div className="text-center text-gray-700 mb-2">The occurrence of events by chance in a happy or beneficial way.</div>
              <div className="text-center text-gray-400 text-sm mb-4">"Their meeting was pure serendipity - both were looking for the same book in the library."</div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs">Emotion</span>
                <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs">Advanced</span>
                <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs">Literature</span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-600 text-sm mb-4">
                <div className="font-semibold mb-1">Why this word?</div>
                This word connects to your previous learning about emotions and advanced vocabulary. Perfect for expressing unexpected positive events.
              </div>
              <div className="flex gap-4 w-full">
                <button className="flex-1 border border-gray-300 rounded-lg py-2 font-medium text-gray-700 hover:bg-gray-100">Need a Hint</button>
                <button className="flex-1 bg-gray-900 text-white rounded-lg py-2 font-medium hover:bg-gray-800">I Know This!</button>
              </div>
            </div>
          </section>

          {/* My Word Bank */}
          <section className="max-w-5xl mx-auto mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">My Word Bank</h2>
              <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                <span>Quick Review</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {loadingWords ? (
                <div className="col-span-full text-center py-8 text-gray-500">Loading your words...</div>
              ) : recentWords.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No words in your bank yet. Add your first word to get started!
                </div>
              ) : (
                recentWords.map(word => {
                  const masteryStatus = getMasteryStatus(word);
                  return (
                    <div key={word.id} className="bg-white rounded-lg p-4 shadow flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{word.word}</span>
                        <span className={`rounded-full px-2 py-1 text-xs ${masteryStatus.color}`}>
                          {masteryStatus.status}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm">
                        {getPrimaryDefinition(word)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-center">
              <button 
                onClick={() => window.location.href = '/word-maze/words'}
                className="border border-gray-300 rounded-lg px-6 py-2 text-gray-700 hover:bg-gray-100"
              >
                View All Words
              </button>
            </div>
          </section>

          {/* Recent Achievements */}
          <section className="max-w-5xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-4">Recent Achievements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 shadow flex flex-col items-center">
                <div className="text-3xl mb-2">🏅</div>
                <div className="font-semibold mb-1">Week Warrior</div>
                <div className="text-gray-500 text-sm mb-2">Completed 7 days in a row</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow flex flex-col items-center">
                <div className="text-3xl mb-2">🎓</div>
                <div className="font-semibold mb-1">Word Master</div>
                <div className="text-gray-500 text-sm mb-2">Mastered 25 vocabulary words</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow flex flex-col items-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-semibold mb-1">Fast Learner</div>
                <div className="text-gray-500 text-sm mb-2">Learned 10 words in one session</div>
              </div>
            </div>
          </section>

          {/* How Word Maze Works */}
          <section className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">How Word Maze Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">1</div>
                <div>
                  <div className="font-semibold mb-1">Smart Word Selection</div>
                  <div className="text-gray-600 text-sm">AI analyzes your level and interests to choose the perfect next word for your journey.</div>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">2</div>
                <div>
                  <div className="font-semibold mb-1">Learn & Connect</div>
                  <div className="text-gray-600 text-sm">Each word connects to previous learning, building a network of vocabulary knowledge.</div>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">3</div>
                <div>
                  <div className="font-semibold mb-1">Practice & Review</div>
                  <div className="text-gray-600 text-sm">Spaced repetition ensures words move from learning to mastered in your word bank.</div>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">4</div>
                <div>
                  <div className="font-semibold mb-1">Unlock New Paths</div>
                  <div className="text-gray-600 text-sm">As you progress, new vocabulary areas and advanced words become available.</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Add Word Modal */}
        <AddWordModal
          isOpen={showAddWordModal}
          onClose={() => setShowAddWordModal(false)}
          onAddWords={handleAddWords}
        />
      </div>
    </Layout>
  );
} 