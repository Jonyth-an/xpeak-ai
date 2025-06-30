// ========================================
// BUSINESS LOGIC LAYER - MAIN ORCHESTRATOR
// ========================================

// Export all business logic components
export { VocabularyManager } from './vocabularyManager';
export { AITaggingEngine } from './aiTaggingEngine';
export { MazeBuilder } from './mazeBuilder';
export { LearningPathGenerator } from './learningPathGenerator';
export { GamificationEngine } from './gamificationEngine';
export { AdaptiveLearningEngine } from './adaptiveLearningEngine';
export { BusinessLogicManager } from './businessLogicManager';

// Export configuration
export { 
  getBusinessLogicConfig, 
  validateBusinessLogicConfig,
  getConfigForUser,
  mergeConfigs 
} from './config';

// ========================================
// BUSINESS LOGIC TYPES
// ========================================

export interface LearningSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  wordsLearned: string[];
  wordsReviewed: string[];
  accuracy: number;
  timeSpent: number;
  difficulty: string;
  sessionType: 'new_words' | 'review' | 'mixed';
}

export interface LearningPath {
  id: string;
  userId: string;
  name: string;
  description: string;
  difficulty: string;
  estimatedDuration: number;
  wordCount: number;
  tags: string[];
  isAdaptive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MazePath {
  id: string;
  learningPathId: string;
  nodes: MazeNode[];
  connections: MazeConnection[];
  difficulty: string;
  estimatedTime: number;
  prerequisites: string[];
  learningObjectives: string[];
}

export interface MazeNode {
  id: string;
  wordId: string;
  nodeType: 'start' | 'word' | 'quiz' | 'review' | 'end';
  difficulty: string;
  position: { x: number; y: number };
  metadata: Record<string, any>;
}

export interface MazeConnection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  condition?: string;
  weight: number;
}

export interface UserProgress {
  userId: string;
  wordId: string;
  masteryLevel: number; // 0-100
  lastReviewed: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  averageTime: number;
  nextReviewDate: Date;
  tags: string[];
}

export interface GamificationMetrics {
  userId: string;
  totalPoints: number;
  level: number;
  streak: number;
  achievements: Achievement[];
  badges: Badge[];
  leaderboardPosition?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// ========================================
// BUSINESS LOGIC CONFIGURATION
// ========================================

export interface BusinessLogicConfig {
  vocabulary: {
    maxWordsPerSession: number;
    reviewIntervalHours: number;
    masteryThreshold: number;
    difficultyWeights: Record<string, number>;
  };
  ai: {
    taggingConfidence: number;
    maxTagsPerWord: number;
    semanticSimilarityThreshold: number;
  };
  maze: {
    maxNodesPerPath: number;
    minConnectionsPerNode: number;
    difficultySpacing: number;
    adaptiveThreshold: number;
  };
  gamification: {
    pointsPerCorrectAnswer: number;
    pointsPerNewWord: number;
    streakMultiplier: number;
    levelUpThreshold: number;
  };
  adaptive: {
    performanceWindow: number;
    difficultyAdjustmentRate: number;
    masteryDecayRate: number;
  };
} 