"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, Button, Input, Text } from '@/app/components/ui';
import Layout from '../../components/Layout';
import { UnifiedWordData, WordEntry } from '../../lib/types/wordMaze';
import { useAuth } from '@/lib/AuthContext';
import EnhancedTagsDemo from './enhanced-tags-demo';

interface MazePath {
  id: string;
  name: string;
  description: string;
  difficulty_level: string;
  path_type?: string;
  estimated_duration?: number;
  is_active: boolean;
  created_at: string;
  metadata?: {
    tags?: string[];
    theme?: string;
  };
  maze_nodes?: MazeNode[];
}

interface MazeNode {
  id: string;
  path_id: string;
  word_id: string;
  position: number;
  challenge_type: string;
  unlock_condition: any;
  created_at: string;
  word_entries?: WordEntry;
}

const WordMazeTestPage = () => {
  const { user } = useAuth();
  const [newWord, setNewWord] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [words, setWords] = useState<WordEntry[]>([]);
  const [selectedWord, setSelectedWord] = useState<UnifiedWordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Maze Paths State
  const [mazePaths, setMazePaths] = useState<MazePath[]>([]);
  const [selectedPath, setSelectedPath] = useState<MazePath | null>(null);
  const [pathNodes, setPathNodes] = useState<MazeNode[]>([]);
  const [loadingPaths, setLoadingPaths] = useState(false);

  // Debug state
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Enhanced AI Demo state
  const [showEnhancedDemo, setShowEnhancedDemo] = useState(false);

  // ========================================
  // LOAD INITIAL DATA
  // ========================================

  useEffect(() => {
    setDebugInfo('Component mounted');
    loadWords();
    loadMazePaths();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      setDebugInfo('Loading words...');
      const response = await fetch('/api/word-maze/words?limit=20');
      const data = await response.json();
      setDebugInfo(`Words response: ${JSON.stringify(data).substring(0, 200)}...`);
      if (data.words) {
        setWords(data.words);
      }
    } catch (error) {
      setMessage('Error loading words');
      setDebugInfo(`Error loading words: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMazePaths = async () => {
    try {
      setLoadingPaths(true);
      setDebugInfo('Loading maze paths...');
      const response = await fetch('/api/word-maze/paths');
      const data = await response.json();
      setDebugInfo(`Maze paths response: ${JSON.stringify(data).substring(0, 200)}...`);
      if (data.paths) {
        setMazePaths(data.paths);
      }
    } catch (error) {
      setMessage('Error loading maze paths');
      setDebugInfo(`Error loading maze paths: ${error}`);
    } finally {
      setLoadingPaths(false);
    }
  };

  // ========================================
  // MAZE PATH OPERATIONS
  // ========================================

  const getPathDetails = async (pathId: string) => {
    try {
      setLoadingPaths(true);
      const response = await fetch(`/api/word-maze/paths?id=${pathId}`);
      const data = await response.json();
      if (data.path && data.nodes) {
        setSelectedPath(data.path);
        setPathNodes(data.nodes);
      }
    } catch (error) {
      setMessage('Error getting path details');
    } finally {
      setLoadingPaths(false);
    }
  };

  // ========================================
  // ADD NEW WORD
  // ========================================

  const addWord = async () => {
    if (!newWord.trim()) return;
    try {
      setLoading(true);
      setMessage('');
      const response = await fetch('/api/word-maze/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: newWord.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setNewWord('');
        loadWords();
      } else {
        setMessage(data.error || 'Failed to add word');
      }
    } catch (error) {
      setMessage('Error adding word');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // SEARCH WORDS
  // ========================================

  const searchWords = async () => {
    if (!searchQuery.trim()) {
      loadWords();
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/word-maze/words?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.words) {
        setWords(data.words);
      }
    } catch (error) {
      setMessage('Error searching words');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // GET WORD DETAILS
  // ========================================

  const getWordDetails = async (wordId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/word-maze/words?id=${wordId}`);
      const data = await response.json();
      if (data.word) {
        setSelectedWord(data.word);
      }
    } catch (error) {
      setMessage('Error getting word details');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER WORD CARD
  // ========================================

  const renderWordCard = (word: WordEntry) => (
    <Card key={word.id} className="p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Text variant="h3" className="mb-2">{word.word_text}</Text>
          <div className="flex gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {word.type}
            </span>
            {word.difficulty_level && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {word.difficulty_level}
              </span>
            )}
            {word.is_verified && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                Verified
              </span>
            )}
          </div>
          <Text variant="body" className="text-gray-600">
            Added: {new Date(word.created_at).toLocaleDateString()}
          </Text>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => getWordDetails(word.id)}
        >
          Details
        </Button>
      </div>
    </Card>
  );

  // ========================================
  // RENDER MAZE PATH CARD
  // ========================================

  const renderMazePathCard = (path: MazePath) => (
    <Card key={path.id} className="p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <Text variant="h3" className="mb-2">{path.name}</Text>
          <Text variant="body" className="text-gray-600 mb-2">{path.description}</Text>
          <div className="flex gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {path.difficulty_level}
            </span>
            {path.is_active ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                Inactive
              </span>
            )}
            {path.maze_nodes && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                {path.maze_nodes.length} nodes
              </span>
            )}
          </div>
          {path.metadata?.tags && path.metadata.tags.length > 0 && (
            <div className="flex gap-1 mb-2">
              {path.metadata.tags.map((tag: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <Text variant="body" className="text-gray-600">
            Created: {new Date(path.created_at).toLocaleDateString()}
          </Text>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => getPathDetails(path.id)}
        >
          View Path
        </Button>
      </div>
    </Card>
  );

  // ========================================
  // RENDER MAZE PATH DETAILS
  // ========================================

  const renderMazePathDetails = (path: MazePath, nodes: MazeNode[]) => (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <Text variant="h2" className="mb-2">{path.name}</Text>
          <Text variant="body" className="text-gray-600 mb-4">{path.description}</Text>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setSelectedPath(null);
            setPathNodes([]);
          }}
        >
          Close
        </Button>
      </div>
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
            {path.difficulty_level}
          </span>
          {path.is_active ? (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
              Active
            </span>
          ) : (
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded">
              Inactive
            </span>
          )}
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded">
            {nodes.length} nodes
          </span>
        </div>
        {path.metadata?.tags && path.metadata.tags.length > 0 && (
          <div className="flex gap-2 mb-4">
            {path.metadata.tags.map((tag: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <Text variant="h4" className="mb-4">Path Nodes</Text>
        {nodes.length === 0 ? (
          <Text variant="body" className="text-gray-500">No nodes in this path</Text>
        ) : (
          <div className="space-y-3">
            {nodes.map((node, index) => (
              <div key={node.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {node.position}
                </div>
                <div className="flex-1">
                  {node.word_entries ? (
                    <div>
                      <Text variant="h4" className="mb-1">{node.word_entries.word_text}</Text>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {node.word_entries.type}
                        </span>
                        {node.word_entries.difficulty_level && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {node.word_entries.difficulty_level}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                          {node.challenge_type}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Text variant="body" className="text-gray-500">Word not found</Text>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );

  // ========================================
  // RENDER WORD DETAILS
  // ========================================

  const renderWordDetails = (word: UnifiedWordData) => (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <Text variant="h2">{word.word}</Text>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setSelectedWord(null)}
        >
          Close
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Definitions */}
        <div>
          <Text variant="h4" className="mb-3">Definitions</Text>
          {word.definitions.map((def, index) => (
            <div key={index} className="mb-3 p-3 bg-gray-50 rounded">
              <Text variant="body" className="mb-1">{def.text}</Text>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>Source: {def.source}</span>
                {def.part_of_speech && <span>• {def.part_of_speech}</span>}
                <span>• Confidence: {Math.round(def.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
        {/* Examples */}
        <div>
          <Text variant="h4" className="mb-3">Examples</Text>
          {word.examples.map((ex, index) => (
            <div key={index} className="mb-3 p-3 bg-blue-50 rounded">
              <Text variant="body" className="italic">"{ex.text}"</Text>
              <div className="flex gap-2 text-xs text-gray-500 mt-1">
                <span>Source: {ex.source}</span>
                {ex.context && <span>• {ex.context}</span>}
              </div>
            </div>
          ))}
        </div>
        {/* Tags */}
        <div>
          <Text variant="h4" className="mb-3">Tags</Text>
          <div className="flex flex-wrap gap-2">
            {word.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded"
              >
                {tag.type}: {tag.value} ({Math.round(tag.confidence * 100)}%)
              </span>
            ))}
          </div>
        </div>
        {/* Relationships */}
        <div>
          <Text variant="h4" className="mb-3">Relationships</Text>
          {word.relationships.length > 0 ? (
            word.relationships.map((rel, index) => (
              <div key={index} className="mb-2 text-sm">
                <span className="font-medium">{rel.type}:</span> {rel.related_word}
                <span className="text-gray-500 ml-2">({Math.round(rel.strength * 100)}%)</span>
              </div>
            ))
          ) : (
            <Text variant="body" className="text-gray-500">No relationships found</Text>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Text variant="h1" className="mb-2">Word Maze Test</Text>
          <Text variant="body" className="text-gray-600">
            Test the Word Maze vocabulary system foundation
          </Text>
        </div>
        {/* Debug Info */}
        <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
          <Text variant="h4" className="mb-2">Debug Info</Text>
          <Text variant="body" className="text-sm font-mono">{debugInfo}</Text>
          <div className="mt-2">
            <Text variant="body" className="text-sm">
              Words count: {words.length} | Maze paths count: {mazePaths.length}
            </Text>
          </div>
        </Card>
        {/* Enhanced AI Demo Toggle */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Text variant="h1" className="mb-2">Word Maze Test Page</Text>
              <Text variant="body" className="text-gray-600">
                Test the Word Maze functionality with enhanced AI tagging features
              </Text>
            </div>
            <Button
              onClick={() => setShowEnhancedDemo(!showEnhancedDemo)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {showEnhancedDemo ? 'Hide' : 'Show'} Enhanced AI Demo
            </Button>
          </div>
        </Card>
        {/* Enhanced AI Tagging Demo */}
        {showEnhancedDemo && (
          <div className="mb-8">
            <EnhancedTagsDemo />
          </div>
        )}
        {/* Add Word Section */}
        <Card className="p-6 mb-8">
          <Text variant="h3" className="mb-4">Add New Word</Text>
          <div className="flex gap-4">
            <Input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter a word to add..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && addWord()}
            />
            <Button 
              onClick={addWord} 
              disabled={loading || !newWord.trim()}
            >
              {loading ? 'Adding...' : 'Add Word'}
            </Button>
          </div>
        </Card>
        {/* Search Section */}
        <Card className="p-6 mb-8">
          <Text variant="h3" className="mb-4">Search Words</Text>
          <div className="flex gap-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && searchWords()}
            />
            <Button onClick={searchWords} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                loadWords();
              }}
            >
              Clear
            </Button>
          </div>
        </Card>
        {/* Message Display */}
        {message && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <Text variant="body" className="text-blue-800">{message}</Text>
          </Card>
        )}
        {/* Selected Word Details */}
        {selectedWord && renderWordDetails(selectedWord)}
        {/* Selected Maze Path Details */}
        {selectedPath && renderMazePathDetails(selectedPath, pathNodes)}
        {/* Maze Paths Section */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <Text variant="h3">Maze Paths ({mazePaths.length})</Text>
            <Button 
              variant="outline" 
              onClick={loadMazePaths}
              disabled={loadingPaths}
            >
              {loadingPaths ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
          {loadingPaths ? (
            <div className="text-center py-8">
              <Text variant="body">Loading maze paths...</Text>
            </div>
          ) : mazePaths.length === 0 ? (
            <div className="text-center py-8">
              <Text variant="body" className="text-gray-500">No maze paths found</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {mazePaths.map(renderMazePathCard)}
            </div>
          )}
        </Card>
        {/* Words List */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Text variant="h3">Words ({words.length})</Text>
            <Button 
              variant="outline" 
              onClick={loadWords}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <Text variant="body">Loading words...</Text>
            </div>
          ) : words.length === 0 ? (
            <div className="text-center py-8">
              <Text variant="body" className="text-gray-500">No words found</Text>
            </div>
          ) : (
            <div className="space-y-4">
              {words.map(renderWordCard)}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(WordMazeTestPage), { ssr: false }); 