// ========================================
// BUSINESS LOGIC LAYER - SIMPLIFIED CORE
// ========================================

// Export core business logic components
export { VocabularyManager } from '../vocabularyManager';
export { AITaggingEngine } from './aiTaggingEngine';
export { AITaggingEngineEnhanced } from './aiTaggingEngineEnhanced';

// ========================================
// CORE TYPES (SIMPLIFIED)
// ========================================

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

// ========================================
// SIMPLIFIED CONFIGURATION
// ========================================

export interface SimpleBusinessLogicConfig {
  vocabulary: {
    maxWordsPerSession: number;
    reviewIntervalHours: number;
    masteryThreshold: number;
  };
  ai: {
    taggingConfidence: number;
    maxTagsPerWord: number;
    enableOpenAI: boolean;
  };
}

export const defaultSimpleConfig: SimpleBusinessLogicConfig = {
  vocabulary: {
    maxWordsPerSession: 20,
    reviewIntervalHours: 24,
    masteryThreshold: 80
  },
  ai: {
    taggingConfidence: 0.7,
    maxTagsPerWord: 8,
    enableOpenAI: true
  }
}; 