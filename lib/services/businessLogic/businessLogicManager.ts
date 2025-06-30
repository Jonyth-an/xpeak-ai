// ========================================
// BUSINESS LOGIC MANAGER - MAIN ORCHESTRATOR
// ========================================

import { VocabularyManager } from './vocabularyManager';
import { AITaggingEngine } from './aiTaggingEngine';
import { AITaggingEngineEnhanced } from './aiTaggingEngineEnhanced';
import { MazeBuilder } from './mazeBuilder';
import { LearningPathGenerator } from './learningPathGenerator';
import { GamificationEngine } from './gamificationEngine';
import { AdaptiveLearningEngine } from './adaptiveLearningEngine';
import { BusinessLogicConfig } from './index';

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
  sessionType: 'practice' | 'review' | 'challenge' | 'exploration';
  tags: string[];
  unlockCriteria?: any[];
}

export interface PersonalizedLearningPath {
  userId: string;
  pathId: string;
  words: string[];
  difficulty: string;
  estimatedTime: number;
  tags: string[];
  unlockCriteria: any[];
  progress: number;
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
  achievements: any[];
  badges: any[];
  leaderboardPosition?: number;
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

export class BusinessLogicManager {
  private vocabularyManager: VocabularyManager;
  private aiTaggingEngine: AITaggingEngine;
  private aiTaggingEngineEnhanced: AITaggingEngineEnhanced;
  private mazeBuilder: MazeBuilder;
  private learningPathGenerator: LearningPathGenerator;
  private gamificationEngine: GamificationEngine;
  private adaptiveLearningEngine: AdaptiveLearningEngine;
  private config: BusinessLogicConfig;

  constructor(config: BusinessLogicConfig) {
    this.config = config;
    
    // Initialize components with correct config structures
    this.vocabularyManager = new VocabularyManager();
    this.aiTaggingEngine = new AITaggingEngine({
      taggingConfidence: config.ai.taggingConfidence,
      maxTagsPerWord: config.ai.maxTagsPerWord,
      semanticSimilarityThreshold: config.ai.semanticSimilarityThreshold,
      enableOpenAI: false,
      openAIModel: 'gpt-3.5-turbo',
      openAITemperature: 0.7,
      openAIMaxTokens: 500
    });
    this.mazeBuilder = new MazeBuilder({
      maxNodesPerPath: config.maze.maxNodesPerPath,
      minConnectionsPerNode: config.maze.minConnectionsPerNode,
      difficultySpacing: config.maze.difficultySpacing,
      adaptiveThreshold: config.maze.adaptiveThreshold
    });
    this.learningPathGenerator = new LearningPathGenerator(config);
    this.gamificationEngine = new GamificationEngine({
      pointsPerCorrectAnswer: config.gamification.pointsPerCorrectAnswer,
      pointsPerNewWord: config.gamification.pointsPerNewWord,
      streakMultiplier: config.gamification.streakMultiplier,
      levelUpThreshold: config.gamification.levelUpThreshold
    });
    this.adaptiveLearningEngine = new AdaptiveLearningEngine({
      performanceWindow: config.adaptive.performanceWindow,
      difficultyAdjustmentRate: config.adaptive.difficultyAdjustmentRate,
      masteryDecayRate: config.adaptive.masteryDecayRate
    });
    
    // Initialize enhanced AI tagging engine with OpenAI
    this.aiTaggingEngineEnhanced = new AITaggingEngineEnhanced({
      taggingConfidence: config.ai.taggingConfidence,
      maxTagsPerWord: config.ai.maxTagsPerWord,
      semanticSimilarityThreshold: config.ai.semanticSimilarityThreshold,
      enableOpenAI: true,
      openAIModel: 'gpt-3.5-turbo',
      openAITemperature: 0.7,
      openAIMaxTokens: 500
    });
  }

  // ========================================
  // ENHANCED WORD PROCESSING WITH OPENAI
  // ========================================

  async processWordWithEnhancedAI(word: string, userId?: string): Promise<{
    wordData: any;
    tags: any[];
    unlockCriteria: any[];
    personalizedTags: any[];
  }> {
    try {
      // 1. Get word data from vocabulary manager
      const wordEntry = await this.vocabularyManager.getWordByText(word);
      if (!wordEntry) {
        // If word doesn't exist, create a basic structure
        const basicWordData = {
          word,
          definitions: [],
          examples: [],
          tags: [],
          relationships: []
        };
        
        return {
          wordData: basicWordData,
          tags: [],
          unlockCriteria: [],
          personalizedTags: []
        };
      }

      const wordData = await this.vocabularyManager.getCompleteWordData(wordEntry.id);
      if (!wordData) {
        throw new Error(`Word data not found for: ${word}`);
      }

      // 2. Generate enhanced tags with OpenAI
      const enhancedTags = await this.aiTaggingEngineEnhanced.generateTags(wordData);
      
      // 3. Generate maze unlock criteria
      const unlockCriteria = await this.aiTaggingEngineEnhanced.generateMazeUnlockCriteria(wordData);
      
      // 4. Generate personalized tags if user ID provided
      let personalizedTags: any[] = [];
      if (userId) {
        personalizedTags = await this.aiTaggingEngineEnhanced.generatePersonalizedTags(userId, wordData);
      }

      return {
        wordData,
        tags: enhancedTags,
        unlockCriteria,
        personalizedTags
      };
    } catch (error) {
      console.error('Error processing word with enhanced AI:', error);
      throw error;
    }
  }

  // ========================================
  // ENHANCED LEARNING SESSION MANAGEMENT
  // ========================================

  async createEnhancedLearningSession(userId: string, sessionType: string, difficulty: string): Promise<LearningSession> {
    try {
      // 1. Get user's learning preferences and progress
      const userProgress = await this.adaptiveLearningEngine.analyzeUserProgress(userId);
      const userPreferences = await this.getUserLearningPreferences(userId);
      
      // 2. Generate personalized word selection
      // const userProgress = await this.adaptiveLearningEngine.analyzeUserProgress(userId);
      // const learningPath = await this.learningPathGenerator.generatePersonalizedPath(
      //   userId,
      //   userProgress
      // );

      // Extract words from the learning path (this would need to be implemented)
      // const recommendedWords = await this.getWordsFromLearningPath(learningPath.id);
      
      // Temporary: use mock data
      const recommendedWords = ['serendipity', 'ephemeral', 'ubiquitous'];

      // 3. Generate enhanced tags for all words
      const enhancedWordData = await Promise.all(
        recommendedWords.map(async (word) => {
          const processed = await this.processWordWithEnhancedAI(word, userId);
          return {
            word,
            ...processed
          };
        })
      );

      // 4. Create gamification elements
      // const sessionRewards = await this.gamificationEngine.calculateSessionRewards(
      //   userId,
      //   sessionType,
      //   difficulty,
      //   recommendedWords.length
      // );

      // 5. Create learning session
      const session: LearningSession = {
        id: `session_${Date.now()}_${userId}`,
        userId,
        startTime: new Date(),
        wordsLearned: [],
        wordsReviewed: [],
        accuracy: 0,
        timeSpent: 0,
        difficulty,
        sessionType: sessionType as any,
        tags: enhancedWordData.flatMap(w => w.tags.map(t => t.tag)),
        unlockCriteria: enhancedWordData.flatMap(w => w.unlockCriteria)
      };

      return session;
    } catch (error) {
      console.error('Error creating enhanced learning session:', error);
      throw error;
    }
  }

  // ========================================
  // ENHANCED MAZE GENERATION
  // ========================================

  async generateEnhancedMaze(userId: string, theme?: string, difficulty?: string): Promise<{
    maze: any;
    unlockCriteria: any[];
    personalizedElements: any[];
  }> {
    try {
      // 1. Get user preferences and progress
      const userPreferences = await this.getUserLearningPreferences(userId);
      const userProgress = await this.adaptiveLearningEngine.analyzeUserProgress(userId);
      
      // 2. Generate personalized word collection
      // const userProgress = await this.adaptiveLearningEngine.analyzeUserProgress(userId);
      // const learningPath = await this.learningPathGenerator.generatePersonalizedPath(
      //   userId,
      //   userProgress
      // );

      // Extract words from the learning path (this would need to be implemented)
      // const recommendedWords = await this.getWordsFromLearningPath(learningPath.id);
      
      // Temporary: use mock data
      const recommendedWords = ['serendipity', 'ephemeral', 'ubiquitous'];

      // 3. Process words with enhanced AI
      const enhancedWords = await Promise.all(
        recommendedWords.map(async (word) => {
          const processed = await this.processWordWithEnhancedAI(word, userId);
          return {
            word,
            ...processed
          };
        })
      );

      // 4. Generate maze structure
      const maze = await this.mazeBuilder.buildAdaptiveMaze(
        enhancedWords.map(w => w.word),
        userProgress
      );

      // 5. Generate unlock criteria for the entire maze
      const unlockCriteria = await this.generateMazeUnlockCriteria(enhancedWords);

      // 6. Generate personalized elements
      const personalizedElements = await this.generatePersonalizedMazeElements(
        userId,
        enhancedWords,
        userPreferences
      );

      return {
        maze,
        unlockCriteria,
        personalizedElements
      };
    } catch (error) {
      console.error('Error generating enhanced maze:', error);
      throw error;
    }
  }

  private async generateMazeUnlockCriteria(enhancedWords: any[]): Promise<any[]> {
    const criteria: any[] = [];
    
    // Level-based unlocks
    criteria.push({
      unlockType: 'level',
      criteria: 'Complete 5 words with 90% accuracy',
      reward: 'Unlock intermediate difficulty words',
      difficulty: 2,
      icon: '🎯',
      color: '#3B82F6'
    });

    // Theme-based unlocks
    const themes = [...new Set(enhancedWords.flatMap(w => w.tags.filter(t => t.category === 'theme').map(t => t.tag)))];
    themes.forEach(theme => {
      criteria.push({
        unlockType: 'theme',
        criteria: `Master 3 words related to ${theme}`,
        reward: `Access ${theme} vocabulary collection`,
        difficulty: 1,
        icon: '🎨',
        color: '#EC4899'
      });
    });

    // Achievement-based unlocks
    criteria.push({
      unlockType: 'achievement',
      criteria: 'Maintain 7-day learning streak',
      reward: 'Premium word collections',
      difficulty: 3,
      icon: '🏆',
      color: '#F59E0B'
    });

    return criteria;
  }

  private async generatePersonalizedMazeElements(userId: string, enhancedWords: any[], userPreferences: any): Promise<any[]> {
    const elements: any[] = [];

    // Generate personalized challenges
    elements.push({
      type: 'challenge',
      title: `Master ${userPreferences.domains[0]} vocabulary`,
      description: `Complete all ${userPreferences.domains[0]} related words`,
      reward: 'Specialized domain badge',
      difficulty: 2
    });

    // Generate learning style specific elements
    if (userPreferences.learningStyle === 'visual') {
      elements.push({
        type: 'visual_aid',
        title: 'Visual learning boost',
        description: 'Enhanced visual associations for all words',
        reward: 'Visual memory bonus',
        difficulty: 1
      });
    }

    return elements;
  }

  // ========================================
  // ENHANCED PROGRESS TRACKING
  // ========================================

  async trackEnhancedProgress(userId: string, word: string, accuracy: number, timeSpent: number): Promise<{
    progress: any;
    rewards: any[];
    unlockCriteria: any[];
    recommendations: any[];
  }> {
    try {
      // 1. Update adaptive learning progress
      const progress = await this.adaptiveLearningEngine.updateProgress(
        userId,
        word,
        accuracy,
        timeSpent
      );

      // 2. Calculate gamification rewards
      // const rewards = await this.gamificationEngine.calculateWordRewards(
      //   userId,
      //   word,
      //   accuracy,
      //   timeSpent
      // );
      
      // Temporary: use processInteraction instead
      const rewards = await this.gamificationEngine.processInteraction({
        userId,
        wordId: word,
        isCorrect: accuracy > 0.5,
        timeTaken: timeSpent,
        interactionType: 'learn'
      });

      // 3. Check for unlocked criteria
      const unlockCriteria = await this.checkUnlockCriteria(userId, word, accuracy);

      // 4. Generate personalized recommendations
      const recommendations = await this.generatePersonalizedRecommendations(userId, word, accuracy);

      return {
        progress,
        rewards,
        unlockCriteria,
        recommendations
      };
    } catch (error) {
      console.error('Error tracking enhanced progress:', error);
      throw error;
    }
  }

  private async checkUnlockCriteria(userId: string, word: string, accuracy: number): Promise<any[]> {
    const unlocked: any[] = [];
    
    // Check accuracy-based unlocks
    if (accuracy >= 0.9) {
      unlocked.push({
        type: 'accuracy_milestone',
        title: 'High Accuracy Achievement',
        description: `Achieved 90% accuracy on ${word}`,
        reward: 'Accuracy bonus points',
        icon: '🎯',
        color: '#10B981'
      });
    }

    // Check streak-based unlocks
    const userProgress = await this.adaptiveLearningEngine.analyzeUserProgress(userId);
    if (userProgress.streak >= 7) {
      unlocked.push({
        type: 'streak_milestone',
        title: '7-Day Learning Streak',
        description: 'Maintained learning streak for 7 days',
        reward: 'Streak bonus and special badge',
        icon: '🔥',
        color: '#F59E0B'
      });
    }

    return unlocked;
  }

  private async generatePersonalizedRecommendations(userId: string, word: string, accuracy: number): Promise<any[]> {
    const recommendations: any[] = [];
    
    // Get user preferences
    const userPreferences = await this.getUserLearningPreferences(userId);
    
    // Generate difficulty-based recommendations
    if (accuracy < 0.7) {
      recommendations.push({
        type: 'difficulty_adjustment',
        title: 'Consider easier words',
        description: 'Try some beginner-level words to build confidence',
        action: 'switch_to_easier',
        priority: 'high'
      });
    } else if (accuracy > 0.95) {
      recommendations.push({
        type: 'difficulty_adjustment',
        title: 'Ready for a challenge',
        description: 'You\'re doing great! Try some advanced words',
        action: 'switch_to_harder',
        priority: 'medium'
      });
    }

    // Generate domain-based recommendations
    recommendations.push({
      type: 'domain_exploration',
      title: `Explore ${userPreferences.domains[0]} vocabulary`,
      description: `Discover more words in your preferred domain`,
      action: 'explore_domain',
      priority: 'medium'
    });

    return recommendations;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private async getUserLearningPreferences(userId: string): Promise<{
    level: string;
    domains: string[];
    learningStyle: string;
    interests: string[];
  }> {
    try {
      const { data, error } = await this.vocabularyManager.supabase
        .from('user_learning_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return {
          level: 'intermediate',
          domains: ['general'],
          learningStyle: 'visual',
          interests: ['general']
        };
      }

      return {
        level: data.level || 'intermediate',
        domains: data.domains || ['general'],
        learningStyle: data.learning_style || 'visual',
        interests: data.interests || ['general']
      };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {
        level: 'intermediate',
        domains: ['general'],
        learningStyle: 'visual',
        interests: ['general']
      };
    }
  }

  // ========================================
  // PUBLIC API METHODS
  // ========================================

  async getEnhancedWordRecommendations(userId: string, count: number = 10): Promise<any[]> {
    try {
      const userPreferences = await this.getUserLearningPreferences(userId);
      const userProgress = await this.adaptiveLearningEngine.analyzeUserProgress(userId);
      
      const learningPath = await this.learningPathGenerator.generatePersonalizedPath(
        userId,
        userProgress
      );

      // Extract words from the learning path
      const recommendedWords = await this.getWordsFromLearningPath(learningPath.id);

      const enhancedRecommendations = await Promise.all(
        recommendedWords.map(async (word) => {
          const processed = await this.processWordWithEnhancedAI(word, userId);
          return {
            word,
            ...processed,
            estimatedDifficulty: userProgress.currentLevel,
            learningTips: processed.tags.filter(t => t.category === 'learning_tip')
          };
        })
      );

      return enhancedRecommendations;
    } catch (error) {
      console.error('Error getting enhanced word recommendations:', error);
      throw error;
    }
  }

  async getPopularTagsWithEnhancement(limit: number = 20): Promise<any[]> {
    try {
      const popularTags = await this.aiTaggingEngineEnhanced.getPopularTags(limit);
      
      // Add enhancement data
      const enhancedTags = popularTags.map(tag => ({
        ...tag,
        usageCount: tag.count,
        popularity: tag.count > 100 ? 'high' : tag.count > 50 ? 'medium' : 'low',
        category: this.aiTaggingEngineEnhanced['tagStyling'][tag.tag.toLowerCase() as keyof typeof this.aiTaggingEngineEnhanced['tagStyling']]?.category || 'general'
      }));

      return enhancedTags;
    } catch (error) {
      console.error('Error getting popular tags with enhancement:', error);
      throw error;
    }
  }

  // ========================================
  // HIGH-LEVEL BUSINESS OPERATIONS
  // ========================================

  async createPersonalizedLearningSession(userId: string, preferences: any): Promise<LearningSession> {
    // 1. Analyze user's current level and progress
    const userProgress = await this.adaptiveLearningEngine.analyzeUserProgress(userId);
    
    // 2. Generate personalized learning path
    const learningPath = await this.learningPathGenerator.generatePersonalizedPath(userId, userProgress);
    
    // 3. Build adaptive maze
    const mazePath = await this.mazeBuilder.buildAdaptiveMaze(learningPath, userProgress);
    
    // 4. Create learning session
    const session: LearningSession = {
      id: crypto.randomUUID(),
      userId,
      startTime: new Date(),
      wordsLearned: [],
      wordsReviewed: [],
      accuracy: 0,
      timeSpent: 0,
      difficulty: userProgress.currentLevel,
      sessionType: 'mixed'
    };

    return session;
  }

  async processWordInteraction(
    userId: string, 
    wordId: string, 
    isCorrect: boolean, 
    timeTaken: number
  ): Promise<{
    updatedProgress: UserProgress;
    gamificationUpdate: GamificationMetrics;
    nextWord?: string;
  }> {
    // 1. Update user progress
    const updatedProgress = await this.vocabularyManager.updateUserWordMastery(
      userId, wordId, isCorrect, timeTaken
    );

    // 2. Update gamification metrics
    const gamificationUpdate = await this.gamificationEngine.processInteraction({
      userId,
      wordId,
      isCorrect,
      timeTaken,
      interactionType: 'learn'
    });

    // 3. Determine next word based on adaptive learning
    const nextWord = await this.adaptiveLearningEngine.suggestNextWord(
      userId, wordId, isCorrect, updatedProgress
    );

    return {
      updatedProgress,
      gamificationUpdate,
      nextWord
    };
  }

  async generateWordRecommendations(userId: string, count: number = 10): Promise<string[]> {
    // 1. Get user's current level and preferences
    const userProgress = await this.adaptiveLearningEngine.analyzeUserProgress(userId);
    
    // 2. Find words at appropriate difficulty level
    const recommendedWords = await this.vocabularyManager.getWordsByDifficulty(
      userProgress.currentLevel, count * 2
    );
    
    // 3. Filter based on user's learning history and preferences
    const filteredWords = await this.adaptiveLearningEngine.filterWordsByUserPreferences(
      userId, recommendedWords, count
    );

    return filteredWords.map(word => word.id);
  }

  async createCustomLearningPath(
    userId: string, 
    name: string, 
    description: string, 
    wordIds: string[]
  ): Promise<LearningPath> {
    // 1. Validate words and get their data
    const words = await Promise.all(
      wordIds.map(id => this.vocabularyManager.getWordById(id))
    );
    
    const validWords = words.filter(word => word !== null);
    
    // 2. Calculate path properties
    const difficulty = this.calculateAverageDifficulty(validWords);
    const estimatedDuration = this.calculateEstimatedDuration(validWords);
    const tags = this.extractCommonTags(validWords);
    
    // 3. Create learning path
    const learningPath: LearningPath = {
      id: crypto.randomUUID(),
      userId,
      name,
      description,
      difficulty,
      estimatedDuration,
      wordCount: validWords.length,
      tags,
      isAdaptive: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return learningPath;
  }

  // ========================================
  // VOCABULARY MANAGEMENT DELEGATION
  // ========================================

  async addWordToVocabulary(word: string, source?: string): Promise<any> {
    return await this.vocabularyManager.addWordFromAPI(word);
  }

  async getWordDetails(wordId: string): Promise<any> {
    return await this.vocabularyManager.getCompleteWordData(wordId);
  }

  async searchWords(query: string, limit: number = 10): Promise<any[]> {
    return await this.vocabularyManager.searchWords(query, limit);
  }

  // ========================================
  // AI TAGGING DELEGATION
  // ========================================

  async tagWord(wordId: string): Promise<any> {
    return await this.aiTaggingEngine.tagWord(wordId);
  }

  async getWordTags(wordId: string): Promise<any[]> {
    return await this.aiTaggingEngine.getWordTags(wordId);
  }

  // ========================================
  // MAZE BUILDING DELEGATION
  // ========================================

  async buildMazeForPath(learningPathId: string): Promise<any> {
    return await this.mazeBuilder.buildMazeForPath(learningPathId);
  }

  async getMazePath(mazeId: string): Promise<any> {
    return await this.mazeBuilder.getMazePath(mazeId);
  }

  // ========================================
  // LEARNING PATH DELEGATION
  // ========================================

  async generatePath(userId: string, preferences: any): Promise<LearningPath> {
    const userProgress = await this.adaptiveLearningEngine.analyzeUserProgress(userId);
    return await this.learningPathGenerator.generatePersonalizedPath(userId, userProgress);
  }

  async getLearningPaths(userId: string): Promise<LearningPath[]> {
    return await this.learningPathGenerator.getUserLearningPaths(userId);
  }

  // ========================================
  // GAMIFICATION DELEGATION
  // ========================================

  async getUserGamification(userId: string): Promise<GamificationMetrics> {
    return await this.gamificationEngine.getUserGamification(userId);
  }

  async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    return await this.gamificationEngine.awardPoints(userId, points, reason);
  }

  // ========================================
  // ADAPTIVE LEARNING DELEGATION
  // ========================================

  async analyzeUserProgress(userId: string): Promise<any> {
    return await this.adaptiveLearningEngine.analyzeUserProgress(userId);
  }

  async adjustDifficulty(userId: string, performance: any): Promise<string> {
    return await this.adaptiveLearningEngine.adjustDifficulty(userId, performance);
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private calculateAverageDifficulty(words: any[]): string {
    if (words.length === 0) return 'beginner';
    
    const difficultyScores = words.map(word => {
      switch (word.difficulty_level) {
        case 'beginner': return 1;
        case 'intermediate': return 2;
        case 'advanced': return 3;
        default: return 1;
      }
    });
    
    const average = difficultyScores.reduce((sum, score) => sum + score, 0) / words.length;
    
    if (average < 1.5) return 'beginner';
    if (average < 2.5) return 'intermediate';
    return 'advanced';
  }

  private calculateEstimatedDuration(words: any[]): number {
    // Estimate 2 minutes per word for learning
    return words.length * 2;
  }

  private extractCommonTags(words: any[]): string[] {
    const allTags = words.flatMap(word => word.tags || []);
    const tagCounts = allTags.reduce((counts, tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  private async getWordsFromLearningPath(pathId: string): Promise<string[]> {
    // Implementation of getWordsFromLearningPath method
    throw new Error('Method not implemented');
  }
} 