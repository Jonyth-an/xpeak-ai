'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { Card, Text, Button } from '@/app/components/ui';

// Simple pencil SVG icon
const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block align-middle token-accent-dark">
    <path d="M14.7 2.29a1 1 0 0 1 1.42 0l1.59 1.59a1 1 0 0 1 0 1.42l-9.3 9.3-2.83.71.71-2.83 9.3-9.3zM3 17h14a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2z" fill="currentColor"/>
  </svg>
);

interface Language {
  code: string;
  name: string;
  flag: string;
}

interface LanguageLevel {
  code: string;
  name: string;
  description: string;
}

interface LearningGoal {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface TopicInterest {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const availableLanguages: Language[] = [
  {; code: 'EN',; name: 'English',; flag: '🇺🇸' },
  {; code: 'ES',; name: 'Spanish',; flag: '🇪🇸' },
  {; code: 'FR',; name: 'French',; flag: '🇫🇷' },
  {; code: 'DE',; name: 'German',; flag: '🇩🇪' },
  {; code: 'IT',; name: 'Italian',; flag: '🇮🇹' },
  {; code: 'PT',; name: 'Portuguese',; flag: '🇵🇹' },
  {; code: 'RU',; name: 'Russian',; flag: '🇷🇺' },
  {; code: 'JA',; name: 'Japanese',; flag: '🇯🇵' },
  {; code: 'KO',; name: 'Korean',; flag: '🇰🇷' },
  {; code: 'ZH',; name: 'Chinese',; flag: '🇨🇳' },
  {; code: 'AR',; name: 'Arabic',; flag: '🇸🇦' },
  {; code: 'HI',; name: 'Hindi',; flag: '🇮🇳' },
];

const languageLevels: LanguageLevel[] = [
  {; code: 'beginner',; name: 'Beginner (A1-A2)',; description: 'You can understand basic phrases and introduce yourself' },
  {; code: 'elementary',; name: 'Elementary (A2)',; description: 'You can communicate in simple, routine tasks' },
  {; code: 'intermediate',; name: 'Intermediate (B1-B2)',; description: 'You can hold conversations on familiar topics' },
  {; code: 'upper-intermediate',; name: 'Upper Intermediate (B2)',; description: 'You can discuss complex ideas with some fluency' },
  {; code: 'advanced',; name: 'Advanced (C1)',; description: 'You can express yourself fluently and spontaneously' },
  {; code: 'native-like',; name: 'Native-like (C2)',; description: 'You can understand virtually everything heard or read' },
];

const learningGoals: LearningGoal[] = [
  {; id: 'travel',; name: 'Travel',; description: 'Learn for trips and cultural experiences',; icon: '✈️' },
  {; id: 'work',; name: 'Work',; description: 'Improve for professional opportunities',; icon: '💼' },
  {; id: 'test-prep',; name: 'Test Prep',; description: 'Prepare for language exams',; icon: '📝' },
  {; id: 'fun',; name: 'Fun & Hobby',; description: 'Learn for personal interest',; icon: '🎯' },
  {; id: 'academic',; name: 'Academic',; description: 'Study for educational purposes',; icon: '🎓' },
  {; id: 'relationships',; name: 'Relationships',; description: 'Connect with friends and family',; icon: '❤️' },
];

const topicInterests: TopicInterest[] = [
  {; id: 'culture',; name: 'Culture',; description: 'Traditions, customs, and cultural insights',; icon: '🏛️' },
  {; id: 'business',; name: 'Business',; description: 'Professional and corporate topics',; icon: '💼' },
  {; id: 'pop-culture',; name: 'Pop Culture',; description: 'Movies, music, and entertainment',; icon: '🎬' },
  {; id: 'daily-life',; name: 'Daily Life',; description: 'Everyday conversations and routines',; icon: '🏠' },
  {; id: 'food',; name: 'Food & Cuisine',; description: 'Cooking, restaurants, and culinary culture',; icon: '🍽️' },
  {; id: 'travel',; name: 'Travel',; description: 'Destinations, tourism, and exploration',; icon: '🗺️' },
  {; id: 'sports',; name: 'Sports',; description: 'Athletics, fitness, and recreation',; icon: '⚽' },
  {; id: 'technology',; name: 'Technology',; description: 'Tech trends and digital topics',; icon: '💻' },
];

export default function LanguagePreferences() {
  const { user } = useAuth();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode states
  const [editLanguages, setEditLanguages] = useState(false);
  const [editLevel, setEditLevel] = useState(false);
  const [editGoals, setEditGoals] = useState(false);
  const [editTopics, setEditTopics] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadUserPreferences();
  }, [user]);

  const loadUserPreferences = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('languages, language_level, learning_goals, topic_interests')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSelectedLanguages(data.languages || []);
        setSelectedLevel(data.language_level || '');
        setSelectedGoals(data.learning_goals || []);
        setSelectedTopics(data.topic_interests || []);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSave = async (section: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const updateData: any = { user_id: user.id,; updated_at: new Date().toISOString() };
      
      switch (section) {
        case 'languages':
          updateData.languages = selectedLanguages;
          break;
        case 'level':
          updateData.language_level = selectedLevel;
          break;
        case 'goals':
          updateData.learning_goals = selectedGoals;
          break;
        case 'topics':
          updateData.topic_interests = selectedTopics;
          break;
      }

      console.log('Saving preferences:', updateData);

      const { error } = await supabase
        .from('user_preferences')
        .upsert(updateData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Close edit mode
      setEditLanguages(false);
      setEditLevel(false);
      setEditGoals(false);
      setEditTopics(false);
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setError(`Failed to save preferences: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (section: string) => {
    // Reset to original values and close edit mode
    loadUserPreferences();
    setEditLanguages(false);
    setEditLevel(false);
    setEditGoals(false);
    setEditTopics(false);
  };

  const getSelectedLanguageNames = () => {
    return selectedLanguages.map(code => 
      availableLanguages.find(lang => lang.code === code)?.name
    ).filter(Boolean).join(', ') || 'None selected';
  };

  const getSelectedGoalNames = () => {
    return selectedGoals.map(id => 
      learningGoals.find(goal => goal.id === id)?.name
    ).filter(Boolean).join(', ') || 'None selected';
  };

  const getSelectedTopicNames = () => {
    return selectedTopics.map(id => 
      topicInterests.find(topic => topic.id === id)?.name
    ).filter(Boolean).join(', ') || 'None selected';
  };

  const getCurrentLevel = () => {
    const level = languageLevels.find(l => l.code === selectedLevel);
    return level ? `${level.name} - ${level.description}` : 'Not set';
  };

  return (
    <div className="space-y-6">
      {/* Current Language Level */}
      <Card>
        <Text as="h3" className="font-semibold mb-2">Current Language Level</Text>
        {!editLevel ? (
          <div className="flex items-center justify-between">
            <div className="text-sm token-text-secondary">
              {getCurrentLevel()}
            </div>
            <button
              className="ml-4 p-2 rounded hover:token-accent-light transition"
              onClick={() => setEditLevel(true)}
            >
              <EditIcon />
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-3 text-sm token-text-secondary">Tell us your current level so we can match you with the right content and tutors:</div>
            <div className="space-y-2">
              {languageLevels.map((level) => (
                <label key={level.code} className="flex items-start cursor-pointer">
                  <input
                    type="radio"
                    name="languageLevel"
                    value={level.code}
                    checked={selectedLevel === level.code}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="mt-1 mr-3 accent-token-accent"
                  />
                  <div>
                    <div className="font-medium token-accent-dark">{level.name}</div>
                    <div className="text-sm token-text-secondary">{level.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => handleSave('level')} disabled={loading} variant="primary">
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={() => handleCancel('level')} variant="secondary">Cancel</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Your Goals */}
      <Card>
        <Text as="h3" className="font-semibold mb-2">Your Goals</Text>
        {!editGoals ? (
          <div className="flex items-center justify-between">
            <div className="text-sm token-text-secondary">
              {getSelectedGoalNames()}
            </div>
            <button
              className="ml-4 p-2 rounded hover:token-purple-light transition"
              onClick={() => setEditGoals(true)}
            >
              <EditIcon />
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-3 text-sm token-text-secondary">Learning for travel, work, test prep, or fun? Help us personalize your experience:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {learningGoals.map((goal) => (
                <label key={goal.id} className="flex items-center cursor-pointer p-3 border border-token-border-purple rounded-lg hover:bg-token-accent-light">
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGoals([...selectedGoals, goal.id]);
                      } else {
                        setSelectedGoals(selectedGoals.filter(id => id !== goal.id));
                      }
                    }}
                    className="mr-3 accent-token-purple"
                  />
                  <div>
                    <div className="font-medium token-purple-dark">{goal.icon} {goal.name}</div>
                    <div className="text-sm token-text-secondary">{goal.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => handleSave('goals')} disabled={loading} variant="primary">
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={() => handleCancel('goals')} variant="secondary">Cancel</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Topics & Interests */}
      <Card>
        <Text as="h3" className="font-semibold mb-2">Topics & Interests</Text>
        {!editTopics ? (
          <div className="flex items-center justify-between">
            <div className="text-sm token-text-secondary">
              {getSelectedTopicNames()}
            </div>
            <button
              className="ml-4 p-2 rounded hover:token-orange-light transition"
              onClick={() => setEditTopics(true)}
            >
              <EditIcon />
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-3 text-sm token-text-secondary">Choose what excites you — culture, business, pop trends, or daily life:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topicInterests.map((topic) => (
                <label key={topic.id} className="flex items-center cursor-pointer p-3 border border-token-border-orange rounded-lg hover:bg-token-accent-light">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTopics([...selectedTopics, topic.id]);
                      } else {
                        setSelectedTopics(selectedTopics.filter(id => id !== topic.id));
                      }
                    }}
                    className="mr-3 accent-token-orange"
                  />
                  <div>
                    <div className="font-medium token-orange-dark">{topic.icon} {topic.name}</div>
                    <div className="text-sm token-text-secondary">{topic.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => handleSave('topics')} disabled={loading} variant="primary">
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={() => handleCancel('topics')} variant="secondary">Cancel</Button>
            </div>
          </div>
        )}
      </Card>

      {error && (
        <div className="token-error text-sm mt-2">{error}</div>
      )}
    </div>
  );
} 