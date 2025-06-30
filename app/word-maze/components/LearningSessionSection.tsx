"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Text, Badge } from '@/app/components/ui';
import { useAuth } from '@/lib/AuthContext';

interface LearningSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  session_type: string;
  difficulty: string;
  words_learned: string[];
  words_reviewed: string[];
  accuracy: number;
  time_spent: number;
}

interface GamificationData {
  user_id: string;
  total_points: number;
  level: number;
  streak: number;
  achievements: any[];
  badges: any[];
  last_activity: string;
}

const LearningSessionSection = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<LearningSession | null>(null);
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // ========================================
  // LOAD USER DATA
  // ========================================

  useEffect(() => {
    if (user) {
      loadGamificationData();
      loadCurrentSession();
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      // For now, we'll use a simple approach without token
      const response = await fetch('/api/word-maze/gamification');
      const data = await response.json();
      if (data.gamification) {
        setGamificationData(data.gamification);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  };

  const loadCurrentSession = async () => {
    try {
      const response = await fetch('/api/word-maze/sessions?limit=1');
      const data = await response.json();
      if (data.sessions && data.sessions.length > 0) {
        const latestSession = data.sessions[0];
        // Check if session is from today and not ended
        const sessionDate = new Date(latestSession.start_time);
        const today = new Date();
        if (sessionDate.toDateString() === today.toDateString() && !latestSession.end_time) {
          setCurrentSession(latestSession);
        }
      }
    } catch (error) {
      console.error('Error loading current session:', error);
    }
  };

  // ========================================
  // SESSION MANAGEMENT
  // ========================================

  const startNewSession = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await fetch('/api/word-maze/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences: {
            difficulty: 'intermediate',
            sessionLength: 20,
            focusAreas: ['vocabulary', 'comprehension']
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentSession(data.session);
        setMessage('New learning session started!');
      } else {
        setMessage(data.error || 'Failed to start session');
      }
    } catch (error) {
      setMessage('Error starting session');
    } finally {
      setLoading(false);
    }
  };

  const endCurrentSession = async () => {
    if (!currentSession) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/word-maze/sessions?id=${currentSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          timeSpent: currentSession.time_spent + 10 // Add some time
        })
      });

      if (response.ok) {
        setCurrentSession(null);
        setMessage('Session ended successfully!');
        loadGamificationData(); // Refresh gamification data
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to end session');
      }
    } catch (error) {
      setMessage('Error ending session');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER COMPONENTS
  // ========================================

  const renderGamificationStats = () => {
    if (!gamificationData) return null;

    return (
      <Card className="p-6 mb-6">
        <Text variant="h3" className="mb-4">Your Progress</Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Text variant="h2" className="text-blue-600">{gamificationData.level}</Text>
            <Text variant="small" className="text-gray-600">Level</Text>
          </div>
          <div className="text-center">
            <Text variant="h2" className="text-green-600">{gamificationData.total_points}</Text>
            <Text variant="small" className="text-gray-600">Points</Text>
          </div>
          <div className="text-center">
            <Text variant="h2" className="text-orange-600">{gamificationData.streak}</Text>
            <Text variant="small" className="text-gray-600">Day Streak</Text>
          </div>
          <div className="text-center">
            <Text variant="h2" className="text-purple-600">{gamificationData.achievements.length}</Text>
            <Text variant="small" className="text-gray-600">Achievements</Text>
          </div>
        </div>
      </Card>
    );
  };

  const renderCurrentSession = () => {
    if (!currentSession) return null;

    const sessionDuration = Math.floor((Date.now() - new Date(currentSession.start_time).getTime()) / 1000 / 60);

    return (
      <Card className="p-6 mb-6 border-green-200 bg-green-50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Text variant="h3" className="text-green-800">Active Learning Session</Text>
            <Text variant="small" className="text-green-600">
              Started {sessionDuration} minutes ago
            </Text>
          </div>
          <Badge variant="success" className="text-sm">
            {currentSession.session_type}
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Text variant="small" className="text-gray-600">Words Learned</Text>
            <Text variant="h4">{currentSession.words_learned.length}</Text>
          </div>
          <div>
            <Text variant="small" className="text-gray-600">Words Reviewed</Text>
            <Text variant="h4">{currentSession.words_reviewed.length}</Text>
          </div>
          <div>
            <Text variant="small" className="text-gray-600">Accuracy</Text>
            <Text variant="h4">{currentSession.accuracy}%</Text>
          </div>
          <div>
            <Text variant="small" className="text-gray-600">Time Spent</Text>
            <Text variant="h4">{currentSession.time_spent}m</Text>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={endCurrentSession}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Ending...' : 'End Session'}
          </Button>
          <Button 
            variant="primary"
            className="flex-1"
            onClick={() => window.location.href = '/word-maze/practice'}
          >
            Continue Learning
          </Button>
        </div>
      </Card>
    );
  };

  const renderSessionActions = () => {
    if (currentSession) return null;

    return (
      <Card className="p-6">
        <Text variant="h3" className="mb-4">Start Learning</Text>
        <Text variant="body" className="text-gray-600 mb-6">
          Begin a personalized learning session tailored to your current level and progress.
        </Text>
        
        <div className="flex gap-4">
          <Button 
            variant="primary" 
            onClick={startNewSession}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Starting...' : 'Start New Session'}
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => window.location.href = '/word-maze/recommendations'}
          >
            View Recommendations
          </Button>
        </div>

        {message && (
          <Text variant="small" className={`mt-4 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </Text>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderGamificationStats()}
      {renderCurrentSession()}
      {renderSessionActions()}
    </div>
  );
};

export default LearningSessionSection; 