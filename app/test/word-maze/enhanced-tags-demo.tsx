"use client";

import React, { useState, useEffect } from 'react';
import { Card, Button, Text, Badge } from '@/app/components/ui';
import { useAuth } from '@/lib/AuthContext';

interface EnhancedTag {
  tag: string;
  confidence: number;
  source: string;
  reasoning: string;
  category?: string;
  color?: string;
  emoji?: string;
}

interface UnlockCriteria {
  unlockType: string;
  criteria: string;
  reward: string;
  difficulty: number;
  icon?: string;
  color?: string;
}

interface EnhancedTagData {
  word: string;
  tags: EnhancedTag[];
  unlockCriteria: UnlockCriteria[];
  personalizedTags: EnhancedTag[];
  wordData: any;
}

const EnhancedTagsDemo = () => {
  const { user } = useAuth();
  const [word, setWord] = useState('');
  const [enhancedData, setEnhancedData] = useState<EnhancedTagData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetEnhancedTags = async () => {
    if (!word.trim()) {
      setError('Please enter a word');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/word-maze/enhanced-tags?word=${encodeURIComponent(word)}&userId=${user?.id || ''}`);
      const result = await response.json();

      if (result.success) {
        setEnhancedData(result.data);
      } else {
        setError(result.error || 'Failed to get enhanced tags');
      }
    } catch (err) {
      setError('Error fetching enhanced tags');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetUnlockCriteria = async () => {
    if (!word.trim()) {
      setError('Please enter a word');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/word-maze/unlock-criteria?word=${encodeURIComponent(word)}&userId=${user?.id || ''}`);
      const result = await response.json();

      if (result.success) {
        console.log('Unlock criteria:', result.data);
        // You can display unlock criteria here
      } else {
        setError(result.error || 'Failed to get unlock criteria');
      }
    } catch (err) {
      setError('Error fetching unlock criteria');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTagStyle = (tag: EnhancedTag) => ({
    backgroundColor: tag.color || '#6B7280',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    margin: '2px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  });

  const getUnlockStyle = (criteria: UnlockCriteria) => ({
    border: `2px solid ${criteria.color || '#6B7280'}`,
    backgroundColor: `${criteria.color || '#6B7280'}20`,
    padding: '12px',
    borderRadius: '8px',
    margin: '8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6 mb-6">
        <Text variant="h2" className="mb-4">🤖 Enhanced AI Tagging Engine Demo</Text>
        <Text variant="body" className="mb-4">
          Experience the power of OpenAI-enhanced tagging with visual elements, unlock criteria, and personalized learning features!
        </Text>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter a word (e.g., serendipity, ephemeral, quintessential)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleGetEnhancedTags}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Get Enhanced Tags'}
          </Button>
          <Button
            onClick={handleGetUnlockCriteria}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Get Unlock Criteria'}
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </Card>

      {enhancedData && (
        <div className="space-y-6">
          {/* Word Information */}
          <Card className="p-6">
            <Text variant="h3" className="mb-4">📚 Word: {enhancedData.word}</Text>
            
            {enhancedData.wordData && (
              <div className="mb-4">
                <Text variant="body" className="font-semibold mb-2">Definitions:</Text>
                {enhancedData.wordData.definitions?.map((def: any, index: number) => (
                  <div key={index} className="mb-2 p-3 bg-gray-50 rounded-lg">
                    <Text variant="small" className="text-gray-600 mb-1">
                      {def.part_of_speech} • {def.source}
                    </Text>
                    <Text variant="body">{def.text}</Text>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Enhanced Tags */}
          <Card className="p-6">
            <Text variant="h3" className="mb-4">🏷️ Enhanced AI Tags</Text>
            <Text variant="body" className="mb-4">
              AI-generated tags with visual styling, confidence scores, and categorization
            </Text>
            
            <div className="mb-4">
              <Text variant="body" className="font-semibold mb-2">All Tags:</Text>
              <div className="flex flex-wrap gap-2">
                {enhancedData.tags.map((tag, index) => (
                  <div key={index} style={getTagStyle(tag)}>
                    {tag.emoji && <span>{tag.emoji}</span>}
                    <span>{tag.tag}</span>
                    <span className="text-xs opacity-80">({Math.round(tag.confidence * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags by Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['difficulty', 'domain', 'emotion', 'theme', 'formality'].map(category => {
                const categoryTags = enhancedData.tags.filter(tag => tag.category === category);
                if (categoryTags.length === 0) return null;
                
                return (
                  <div key={category} className="p-4 border border-gray-200 rounded-lg">
                    <Text variant="body" className="font-semibold mb-2 capitalize">
                      {category} Tags:
                    </Text>
                    <div className="flex flex-wrap gap-1">
                      {categoryTags.map((tag, index) => (
                        <div key={index} style={getTagStyle(tag)}>
                          {tag.emoji && <span>{tag.emoji}</span>}
                          <span>{tag.tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Unlock Criteria */}
          <Card className="p-6">
            <Text variant="h3" className="mb-4">🔓 Maze Unlock Criteria</Text>
            <Text variant="body" className="mb-4">
              AI-generated unlock criteria for engaging learning progression
            </Text>
            
            <div className="space-y-3">
              {enhancedData.unlockCriteria.map((criteria, index) => (
                <div key={index} style={getUnlockStyle(criteria)}>
                  <span className="text-2xl">{criteria.icon}</span>
                  <div className="flex-1">
                    <Text variant="body" className="font-semibold">
                      {criteria.criteria}
                    </Text>
                    <Text variant="small" className="text-gray-600">
                      Reward: {criteria.reward} • Difficulty: {criteria.difficulty}/5
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Personalized Tags */}
          {enhancedData.personalizedTags.length > 0 && (
            <Card className="p-6">
              <Text variant="h3" className="mb-4">🎯 Personalized Tags</Text>
              <Text variant="body" className="mb-4">
                Tags customized based on your learning preferences and progress
              </Text>
              
              <div className="flex flex-wrap gap-2">
                {enhancedData.personalizedTags.map((tag, index) => (
                  <div key={index} style={getTagStyle(tag)}>
                    {tag.emoji && <span>{tag.emoji}</span>}
                    <span>{tag.tag}</span>
                    <span className="text-xs opacity-80">(personalized)</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Tag Sources */}
          <Card className="p-6">
            <Text variant="h3" className="mb-4">📊 Tag Analysis</Text>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Text variant="h4" className="text-blue-600">
                  {enhancedData.tags.filter(t => t.source === 'openai').length}
                </Text>
                <Text variant="small">AI-Generated Tags</Text>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Text variant="h4" className="text-green-600">
                  {enhancedData.tags.filter(t => t.source === 'definition').length}
                </Text>
                <Text variant="small">Definition-Based Tags</Text>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Text variant="h4" className="text-purple-600">
                  {enhancedData.personalizedTags.length}
                </Text>
                <Text variant="small">Personalized Tags</Text>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Feature Highlights */}
      <Card className="p-6 mt-6">
        <Text variant="h3" className="mb-4">✨ Enhanced Features</Text>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <Text variant="body" className="font-semibold mb-2">🤖 OpenAI Integration</Text>
            <Text variant="small" className="text-gray-600">
              Advanced AI-powered tagging with creative, engaging, and educational tags
            </Text>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <Text variant="body" className="font-semibold mb-2">🎨 Visual Styling</Text>
            <Text variant="small" className="text-gray-600">
              Color-coded tags with emojis for better visual recognition and engagement
            </Text>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <Text variant="body" className="font-semibold mb-2">🔓 Unlock Criteria</Text>
            <Text variant="small" className="text-gray-600">
              Dynamic unlock mechanics for gamified learning progression
            </Text>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <Text variant="body" className="font-semibold mb-2">🎯 Personalization</Text>
            <Text variant="small" className="text-gray-600">
              User-specific tags based on learning preferences and progress
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedTagsDemo; 