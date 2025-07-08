"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, Button, Input, Text, Badge } from '@/app/components/ui';
import Layout from '../../../components/Layout';
import { UnifiedWordData, WordEntry } from '../../../lib/types/wordMaze';
import { useAuth } from '@/lib/AuthContext';
import EnhancedTagsDemo from './enhanced-tags-demo';
import clsx from 'clsx';

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

const TABS = [
  { id: 'debug', label: 'Debug Info' },
  { id: 'ai', label: 'Enhanced AI Tagging Demo' },
  { id: 'paths', label: 'Maze Paths' },
  { id: 'words', label: 'Word Bank' },
];

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

  // Tab state
  const [activeTab, setActiveTab] = useState('debug');
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editWordDraft, setEditWordDraft] = useState<Partial<WordEntry>>({});

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
          variant="tertiary" 
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
          variant="tertiary" 
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

  // Inline edit handlers
  const startEditWord = (word: WordEntry) => {
    setEditingWordId(word.id);
    setEditWordDraft({ ...word });
  };
  const cancelEditWord = () => {
    setEditingWordId(null);
    setEditWordDraft({});
  };
  const handleEditChange = (field: keyof WordEntry, value: any) => {
    setEditWordDraft((draft) => ({ ...draft, [field]: value }));
  };
  const saveEditWord = async () => {
    if (!editingWordId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/word-maze/words`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingWordId, ...editWordDraft }),
      });
      if (response.ok) {
        setMessage('Word updated!');
        setEditingWordId(null);
        setEditWordDraft({});
        loadWords();
      } else {
        setMessage('Failed to update word');
      }
    } catch (e) {
      setMessage('Error updating word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text mb-4">
              🧪 Word Maze Test & Debug
            </h1>
            <p className="text-xl text-text-tertiary max-w-3xl mx-auto">
              Test and debug Word Maze functionality, enhanced AI tagging, and maze path management.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-token-primary text-white'
                    : 'bg-token-surface text-text-secondary hover:bg-token-surface-accent-light border border-token-border'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'debug' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-text mb-4">Debug Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-secondary mb-2">User Status</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${user ? 'bg-token-success' : 'bg-token-error'}`}></div>
                    <span className="text-sm text-text-tertiary">
                      {user ? `Authenticated as ${user.email}` : 'Not authenticated'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-text-secondary mb-2">Debug Log</h3>
                  <div className="bg-token-surface-accent p-4 rounded-lg text-sm text-text-secondary font-mono max-h-64 overflow-y-auto">
                    {debugInfo || 'No debug information available'}
                  </div>
                </div>

                {message && (
                  <div className={`p-4 rounded-lg border-2 ${
                    message.includes('Error') 
                      ? 'bg-token-error-light border-token-error-light text-token-error' 
                      : 'bg-token-success-light border-token-success-light text-token-success-dark'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'ai' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-text mb-4">Enhanced AI Tagging Demo</h2>
              <EnhancedTagsDemo />
            </Card>
          )}

          {activeTab === 'paths' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-text mb-4">Maze Paths</h2>
              <div className="space-y-6">
                {loadingPaths ? (
                  <div className="text-center text-text-tertiary">Loading maze paths...</div>
                ) : mazePaths.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mazePaths.map(renderMazePathCard)}
                  </div>
                ) : (
                  <div className="text-center text-text-tertiary">No maze paths found</div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'words' && (
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-text mb-4">Word Bank</h2>
              <div className="space-y-6">
                {/* Add Word Form */}
                <div className="flex gap-4">
                  <Input
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Enter a new word..."
                    onKeyPress={(e) => e.key === 'Enter' && addWord()}
                  />
                  <Button onClick={addWord} disabled={!newWord.trim() || loading}>
                    {loading ? 'Adding...' : 'Add Word'}
                  </Button>
                </div>

                {/* Search */}
                <div className="flex gap-4">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search words..."
                    onKeyPress={(e) => e.key === 'Enter' && searchWords()}
                  />
                  <Button onClick={searchWords} disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {/* Words Grid */}
                {loading ? (
                  <div className="text-center text-text-tertiary">Loading words...</div>
                ) : words.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {words.map(renderWordCard)}
                  </div>
                ) : (
                  <div className="text-center text-text-tertiary">No words found</div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default dynamic(() => Promise.resolve(WordMazeTestPage), { ssr: false }); 