// ========================================
// BUSINESS LOGIC CONFIGURATION
// ========================================

import { BusinessLogicConfig } from './index';

export const defaultBusinessLogicConfig: BusinessLogicConfig = {
  vocabulary: {
    maxWordsPerSession: 20,
    reviewIntervalHours: 24,
    masteryThreshold: 80,
    difficultyWeights: {
      beginner: 0.3,
      intermediate: 0.5,
      advanced: 0.8
    }
  },
  ai: {
    taggingConfidence: 0.7,
    maxTagsPerWord: 8,
    semanticSimilarityThreshold: 0.8
  },
  maze: {
    maxNodesPerPath: 50,
    minConnectionsPerNode: 2,
    difficultySpacing: 0.2,
    adaptiveThreshold: 0.6
  },
  gamification: {
    pointsPerCorrectAnswer: 10,
    pointsPerNewWord: 25,
    streakMultiplier: 1.5,
    levelUpThreshold: 100
  },
  adaptive: {
    performanceWindow: 30, // days
    difficultyAdjustmentRate: 10,
    masteryDecayRate: 0.05
  }
};

// ========================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ========================================

export const developmentConfig: BusinessLogicConfig = {
  ...defaultBusinessLogicConfig,
  vocabulary: {
    ...defaultBusinessLogicConfig.vocabulary,
    maxWordsPerSession: 10, // Smaller sessions for testing
    reviewIntervalHours: 1 // Faster reviews for testing
  },
  gamification: {
    ...defaultBusinessLogicConfig.gamification,
    pointsPerCorrectAnswer: 5, // Lower points for testing
    levelUpThreshold: 50 // Faster level ups for testing
  }
};

export const productionConfig: BusinessLogicConfig = {
  ...defaultBusinessLogicConfig,
  vocabulary: {
    ...defaultBusinessLogicConfig.vocabulary,
    maxWordsPerSession: 30, // Larger sessions for production
    reviewIntervalHours: 48 // Longer intervals for production
  },
  gamification: {
    ...defaultBusinessLogicConfig.gamification,
    pointsPerCorrectAnswer: 15, // Higher points for production
    levelUpThreshold: 150 // Slower level ups for production
  }
};

// ========================================
// CONFIGURATION FACTORY
// ========================================

export function getBusinessLogicConfig(): BusinessLogicConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return productionConfig;
    case 'development':
    case 'test':
      return developmentConfig;
    default:
      return defaultBusinessLogicConfig;
  }
}

// ========================================
// CONFIGURATION VALIDATION
// ========================================

export function validateBusinessLogicConfig(config: BusinessLogicConfig): boolean {
  try {
    // Validate vocabulary config
    if (config.vocabulary.maxWordsPerSession <= 0) return false;
    if (config.vocabulary.reviewIntervalHours <= 0) return false;
    if (config.vocabulary.masteryThreshold < 0 || config.vocabulary.masteryThreshold > 100) return false;
    
    // Validate AI config
    if (config.ai.taggingConfidence < 0 || config.ai.taggingConfidence > 1) return false;
    if (config.ai.maxTagsPerWord <= 0) return false;
    if (config.ai.semanticSimilarityThreshold < 0 || config.ai.semanticSimilarityThreshold > 1) return false;
    
    // Validate maze config
    if (config.maze.maxNodesPerPath <= 0) return false;
    if (config.maze.minConnectionsPerNode <= 0) return false;
    if (config.maze.difficultySpacing < 0 || config.maze.difficultySpacing > 1) return false;
    if (config.maze.adaptiveThreshold < 0 || config.maze.adaptiveThreshold > 1) return false;
    
    // Validate gamification config
    if (config.gamification.pointsPerCorrectAnswer < 0) return false;
    if (config.gamification.pointsPerNewWord < 0) return false;
    if (config.gamification.streakMultiplier < 1) return false;
    if (config.gamification.levelUpThreshold <= 0) return false;
    
    // Validate adaptive config
    if (config.adaptive.performanceWindow <= 0) return false;
    if (config.adaptive.difficultyAdjustmentRate < 0) return false;
    if (config.adaptive.masteryDecayRate < 0 || config.adaptive.masteryDecayRate > 1) return false;
    
    return true;
  } catch (error) {
    console.error('Configuration validation error:', error);
    return false;
  }
}

// ========================================
// CONFIGURATION HELPERS
// ========================================

export function getConfigForUser(userLevel: string): Partial<BusinessLogicConfig> {
  const baseConfig = getBusinessLogicConfig();
  
  switch (userLevel) {
    case 'beginner':
      return {
        vocabulary: {
          ...baseConfig.vocabulary,
          maxWordsPerSession: Math.round(baseConfig.vocabulary.maxWordsPerSession * 0.7),
          masteryThreshold: 70
        },
        gamification: {
          ...baseConfig.gamification,
          pointsPerCorrectAnswer: Math.round(baseConfig.gamification.pointsPerCorrectAnswer * 1.2),
          levelUpThreshold: Math.round(baseConfig.gamification.levelUpThreshold * 0.8)
        }
      };
    
    case 'advanced':
      return {
        vocabulary: {
          ...baseConfig.vocabulary,
          maxWordsPerSession: Math.round(baseConfig.vocabulary.maxWordsPerSession * 1.3),
          masteryThreshold: 85
        },
        gamification: {
          ...baseConfig.gamification,
          pointsPerCorrectAnswer: Math.round(baseConfig.gamification.pointsPerCorrectAnswer * 0.8),
          levelUpThreshold: Math.round(baseConfig.gamification.levelUpThreshold * 1.2)
        }
      };
    
    default:
      return baseConfig;
  }
}

export function mergeConfigs(
  baseConfig: BusinessLogicConfig, 
  overrides: Partial<BusinessLogicConfig>
): BusinessLogicConfig {
  return {
    vocabulary: { ...baseConfig.vocabulary, ...overrides.vocabulary },
    ai: { ...baseConfig.ai, ...overrides.ai },
    maze: { ...baseConfig.maze, ...overrides.maze },
    gamification: { ...baseConfig.gamification, ...overrides.gamification },
    adaptive: { ...baseConfig.adaptive, ...overrides.adaptive }
  };
} 