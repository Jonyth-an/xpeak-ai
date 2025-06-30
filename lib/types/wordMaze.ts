// Word Maze TypeScript Types
// These types correspond to the database schema and API responses

// ========================================
// CORE VOCABULARY TYPES
// ========================================

export interface WordEntry {
  id: string;
  word_text: string;
  type: 'word' | 'idiom' | 'phrase' | 'slang';
  difficulty_level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  difficulty_score?: number; // 1.0-10.0
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  verification_source?: string;
  metadata: Record<string, any>;
}

export interface WordDefinition {
  id: string;
  word_id: string;
  source_api: 'oxford' | 'wordnik' | 'urban' | 'ai' | 'twinword';
  definition_text: string;
  part_of_speech?: string;
  is_primary: boolean;
  confidence_score: number; // 0.0-1.0
  created_at: string;
}

export interface WordExample {
  id: string;
  word_id: string;
  source_api: string;
  example_text: string;
  context?: 'formal' | 'casual' | 'business' | 'academic';
  is_primary: boolean;
  created_at: string;
}

export interface WordTag {
  id: string;
  word_id: string;
  tag_type: 'topic' | 'tone' | 'usage' | 'emotion' | 'game';
  tag_value: string;
  confidence_score: number; // 0.0-1.0
  source: string;
  created_at: string;
}

export interface WordRelationship {
  id: string;
  from_word_id: string;
  to_word_id: string;
  relationship_type: 'synonym' | 'antonym' | 'hypernym' | 'hyponym' | 'related';
  strength_score: number; // 0.0-1.0
  source: string;
  created_at: string;
}

// ========================================
// USER PROGRESS TYPES
// ========================================

export interface UserWordMastery {
  id: string;
  user_id: string;
  word_id: string;
  mastery_score: number; // 0.0-1.0
  attempts_count: number;
  correct_attempts: number;
  last_attempted_at?: string;
  first_encountered_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserLearningSession {
  id: string;
  user_id: string;
  session_type: 'maze' | 'challenge' | 'review';
  started_at: string;
  completed_at?: string;
  words_encountered: number;
  words_mastered: number;
  session_data: Record<string, any>;
}

// ========================================
// MAZE ENGINE TYPES
// ========================================

export interface MazePath {
  id: string;
  name: string;
  description?: string;
  path_type: 'thematic' | 'difficulty' | 'relationship' | 'custom';
  difficulty_level?: string;
  estimated_duration?: number; // minutes
  is_active: boolean;
  created_at: string;
  metadata: Record<string, any>;
}

export interface MazeNode {
  id: string;
  path_id: string;
  word_id: string;
  position: number;
  challenge_type: 'definition' | 'example' | 'synonym' | 'story' | 'emoji';
  unlock_condition: Record<string, any>;
  created_at: string;
}

export interface UserMazeProgress {
  id: string;
  user_id: string;
  path_id: string;
  current_node_position: number;
  completed_nodes: number;
  total_nodes: number;
  started_at: string;
  completed_at?: string;
  is_active: boolean;
  progress_data: Record<string, any>;
}

// ========================================
// CHALLENGE SYSTEM TYPES
// ========================================

export interface ChallengeTemplate {
  id: string;
  name: string;
  challenge_type: 'definition' | 'example' | 'synonym' | 'story' | 'emoji';
  template_data: Record<string, any>;
  difficulty_level?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserChallengeAttempt {
  id: string;
  user_id: string;
  word_id: string;
  challenge_type: string;
  challenge_data: Record<string, any>;
  user_answer?: string;
  is_correct?: boolean;
  time_taken?: number; // seconds
  attempt_number: number;
  created_at: string;
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface OxfordAPIResponse {
  word: string;
  results: Array<{
    id: string;
    language: string;
    lexicalEntries: Array<{
      entries: Array<{
        etymologies?: string[];
        grammaticalFeatures?: Array<{
          id: string;
          text: string;
          type: string;
        }>;
        pronunciations?: Array<{
          audioFile?: string;
          dialects?: string[];
          phoneticNotation?: string;
          phoneticSpelling?: string;
        }>;
        senses: Array<{
          definitions?: string[];
          examples?: Array<{
            text: string;
          }>;
          id: string;
          shortDefinitions?: string[];
        }>;
      }>;
      language: string;
      lexicalCategory: {
        id: string;
        text: string;
      };
      text: string;
    }>;
  }>;
}

export interface WordnikAPIResponse {
  word: string;
  definitions: Array<{
    attributionText: string;
    sourceDictionary: string;
    text: string;
    partOfSpeech: string;
    sequence: string;
    score: number;
  }>;
  examples: Array<{
    provider: {
      id: number;
      name: string;
    };
    year: number;
    rating: number;
    url: string;
    word: string;
    text: string;
    title: string;
    numSyllables: number;
    score: number;
  }>;
  frequency: {
    zipf: number;
    perMillion: number;
    diversity: number;
  };
}

export interface UrbanDictionaryAPIResponse {
  list: Array<{
    definition: string;
    permalink: string;
    thumbs_up: number;
    author: string;
    word: string;
    defid: number;
    current_vote: string;
    written_on: string;
    example: string;
    thumbs_down: number;
  }>;
}

// ========================================
// UNIFIED WORD DATA TYPE
// ========================================

export interface UnifiedWordData {
  word: string;
  type: 'word' | 'idiom' | 'phrase' | 'slang';
  definitions: Array<{
    text: string;
    source: string;
    part_of_speech?: string;
    confidence: number;
  }>;
  examples: Array<{
    text: string;
    source: string;
    context?: string;
  }>;
  tags: Array<{
    type: string;
    value: string;
    confidence: number;
    source: string;
  }>;
  relationships: Array<{
    related_word: string;
    type: string;
    strength: number;
    source: string;
  }>;
  difficulty: {
    level?: string;
    score?: number;
  };
  metadata: Record<string, any>;
}

// ========================================
// MAZE CHALLENGE TYPES
// ========================================

export interface MazeChallenge {
  id: string;
  word_id: string;
  challenge_type: 'definition' | 'example' | 'synonym' | 'story' | 'emoji';
  question: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
  difficulty: number;
  metadata: Record<string, any>;
}

export interface ChallengeResult {
  challenge_id: string;
  user_answer: string;
  is_correct: boolean;
  time_taken: number;
  mastery_gain: number;
}

// ========================================
// API CONFIGURATION TYPES
// ========================================

export interface APIConfig {
  oxford: {
    app_id: string;
    app_key: string;
    base_url: string;
  };
  wordnik: {
    api_key: string;
    base_url: string;
  };
  urban: {
    base_url: string;
    rate_limit: number;
  };
  twinword: {
    api_key: string;
    base_url: string;
  };
}

// ========================================
// CACHE TYPES
// ========================================

export interface APICacheEntry {
  id: string;
  cache_key: string;
  api_source: string;
  response_data: Record<string, any>;
  expires_at: string;
  created_at: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export type WordType = 'word' | 'idiom' | 'phrase' | 'slang';
export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type ChallengeType = 'definition' | 'example' | 'synonym' | 'story' | 'emoji';
export type APISource = 'oxford' | 'wordnik' | 'urban' | 'ai' | 'twinword';
export type TagType = 'topic' | 'tone' | 'usage' | 'emotion' | 'game';
export type RelationshipType = 'synonym' | 'antonym' | 'hypernym' | 'hyponym' | 'related'; 