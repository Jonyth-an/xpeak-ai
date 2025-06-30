// ========================================
// ADAPTIVE LEARNING ENGINE
// ========================================

import { createClient } from '@supabase/supabase-js';
import { 
  UserProgress, 
  BusinessLogicConfig 
} from './index';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AdaptiveConfig {
  performanceWindow: number;
  difficultyAdjustmentRate: number;
  masteryDecayRate: number;
}

export interface UserPerformanceProfile {
  userId: string;
  currentLevel: string;
  learningPace: number;
  accuracyRate: number;
  responseTime: number;
  retentionRate: number;
  preferredTopics: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  strengths: string[];
  weaknesses: string[];
  lastUpdated: Date;
}

export interface PerformanceMetrics {
  wordId: string;
  accuracy: number;
  responseTime: number;
  reviewCount: number;
  lastReviewed: Date;
  difficultyAdjustment: number;
}

export interface AdaptiveRecommendation {
  wordId: string;
  confidence: number;
  reason: string;
  difficulty: string;
  estimatedTime: number;
  learningStrategy: string;
}

export interface DifficultyAdjustment {
  wordId: string;
  currentDifficulty: string;
  newDifficulty: string;
  adjustmentReason: string;
  confidence: number;
}

export class AdaptiveLearningEngine {
  private config: AdaptiveConfig;

  constructor(config: AdaptiveConfig) {
    this.config = config;
  }

  // ========================================
  // MAIN ADAPTIVE METHODS
  // ========================================

  async analyzeUserProgress(userId: string): Promise<UserPerformanceProfile> {
    // 1. Collect recent performance data
    const performanceData = await this.collectPerformanceData(userId);
    
    // 2. Analyze learning patterns
    const learningPatterns = await this.analyzeLearningPatterns(userId, performanceData);
    
    // 3. Calculate current level
    const currentLevel = this.calculateCurrentLevel(performanceData);
    
    // 4. Determine learning pace
    const learningPace = this.calculateLearningPace(performanceData);
    
    // 5. Analyze accuracy and response time
    const accuracyRate = this.calculateAccuracyRate(performanceData);
    const responseTime = this.calculateAverageResponseTime(performanceData);
    
    // 6. Calculate retention rate
    const retentionRate = await this.calculateRetentionRate(userId);
    
    // 7. Identify strengths and weaknesses
    const strengths = this.identifyStrengths(performanceData);
    const weaknesses = this.identifyWeaknesses(performanceData);
    
    // 8. Determine preferred topics
    const preferredTopics = await this.analyzePreferredTopics(userId);
    
    // 9. Determine learning style
    const learningStyle = this.determineLearningStyle(performanceData);

    return {
      userId,
      currentLevel,
      learningPace,
      accuracyRate,
      responseTime,
      retentionRate,
      preferredTopics,
      learningStyle,
      strengths,
      weaknesses,
      lastUpdated: new Date()
    };
  }

  async suggestNextWord(
    userId: string, 
    currentWordId: string, 
    isCorrect: boolean, 
    userProgress: UserProgress
  ): Promise<string | null> {
    // 1. Update performance metrics for current word
    await this.updateWordPerformance(userId, currentWordId, isCorrect, userProgress);
    
    // 2. Get user's performance profile
    const profile = await this.analyzeUserProgress(userId);
    
    // 3. Generate word recommendations
    const recommendations = await this.generateWordRecommendations(userId, profile);
    
    // 4. Filter and rank recommendations
    const filteredRecommendations = this.filterRecommendations(recommendations, profile);
    
    // 5. Select optimal next word
    return this.selectOptimalWord(filteredRecommendations, profile);
  }

  async adjustDifficulty(
    userId: string, 
    wordId: string, 
    performance: PerformanceMetrics
  ): Promise<DifficultyAdjustment> {
    // 1. Analyze current performance
    const performanceAnalysis = this.analyzeWordPerformance(performance);
    
    // 2. Determine if adjustment is needed
    const adjustmentNeeded = this.determineAdjustmentNeeded(performanceAnalysis);
    
    if (!adjustmentNeeded) {
      return {
        wordId,
        currentDifficulty: performance.difficultyAdjustment.toString(),
        newDifficulty: performance.difficultyAdjustment.toString(),
        adjustmentReason: 'No adjustment needed',
        confidence: 0.5
      };
    }
    
    // 3. Calculate new difficulty
    const newDifficulty = this.calculateNewDifficulty(performanceAnalysis);
    
    // 4. Determine confidence in adjustment
    const confidence = this.calculateAdjustmentConfidence(performanceAnalysis);
    
    // 5. Update word difficulty in database
    await this.updateWordDifficulty(wordId, newDifficulty);
    
    return {
      wordId,
      currentDifficulty: performance.difficultyAdjustment.toString(),
      newDifficulty: newDifficulty.toString(),
      adjustmentReason: this.generateAdjustmentReason(performanceAnalysis),
      confidence
    };
  }

  async filterWordsByUserPreferences(
    userId: string, 
    words: any[], 
    limit: number
  ): Promise<any[]> {
    // 1. Get user's performance profile
    const profile = await this.analyzeUserProgress(userId);
    
    // 2. Score words based on user preferences
    const scoredWords = words.map(word => ({
      word,
      score: this.calculateWordPreferenceScore(word, profile)
    }));
    
    // 3. Sort by score and return top words
    return scoredWords
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(sw => sw.word);
  }

  // ========================================
  // PERFORMANCE DATA COLLECTION
  // ========================================

  private async collectPerformanceData(userId: string): Promise<any[]> {
    const { data: performanceData, error } = await supabase
      .from('user_word_mastery')
      .select('*')
      .eq('user_id', userId)
      .gte('last_reviewed', new Date(Date.now() - this.config.performanceWindow * 24 * 60 * 60 * 1000).toISOString())
      .order('last_reviewed', { ascending: false });

    if (error) {
      console.error('Error collecting performance data:', error);
      return [];
    }

    return performanceData || [];
  }

  private async updateWordPerformance(
    userId: string, 
    wordId: string, 
    isCorrect: boolean, 
    userProgress: UserProgress
  ): Promise<void> {
    // Update performance metrics for the word
    const performanceMetrics: PerformanceMetrics = {
      wordId,
      accuracy: isCorrect ? 1 : 0,
      responseTime: userProgress.averageTime || 0,
      reviewCount: userProgress.reviewCount,
      lastReviewed: userProgress.lastReviewed,
      difficultyAdjustment: 0
    };

    // Store performance data for analysis
    await supabase
      .from('word_performance_metrics')
      .upsert({
        user_id: userId,
        word_id: wordId,
        accuracy: performanceMetrics.accuracy,
        response_time: performanceMetrics.responseTime,
        review_count: performanceMetrics.reviewCount,
        last_reviewed: performanceMetrics.lastReviewed.toISOString(),
        created_at: new Date().toISOString()
      });
  }

  // ========================================
  // LEARNING PATTERN ANALYSIS
  // ========================================

  private async analyzeLearningPatterns(userId: string, performanceData: any[]): Promise<any> {
    const patterns = {
      timeOfDay: this.analyzeTimeOfDayPatterns(performanceData),
      sessionLength: this.analyzeSessionLengthPatterns(performanceData),
      difficultyProgression: this.analyzeDifficultyProgression(performanceData),
      topicPreferences: await this.analyzeTopicPreferences(userId, performanceData),
      errorPatterns: this.analyzeErrorPatterns(performanceData)
    };

    return patterns;
  }

  private analyzeTimeOfDayPatterns(performanceData: any[]): any {
    const timeSlots: Record<string, { count: number; accuracy: number }> = {};
    
    performanceData.forEach(record => {
      const hour = new Date(record.last_reviewed).getHours();
      const timeSlot = this.getTimeSlot(hour);
      
      if (!timeSlots[timeSlot]) {
        timeSlots[timeSlot] = { count: 0, accuracy: 0 };
      }
      
      timeSlots[timeSlot].count++;
      timeSlots[timeSlot].accuracy += record.mastery_level / 100;
    });

    // Calculate average accuracy for each time slot
    Object.keys(timeSlots).forEach(slot => {
      timeSlots[slot].accuracy /= timeSlots[slot].count;
    });

    return timeSlots;
  }

  private getTimeSlot(hour: number): string {
    if (hour < 6) return 'early_morning';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private analyzeSessionLengthPatterns(performanceData: any[]): any {
    // Group performance data by sessions
    const sessions = this.groupBySessions(performanceData);
    
    return sessions.map(session => ({
      duration: session.duration,
      wordCount: session.wordCount,
      accuracy: session.accuracy,
      efficiency: session.wordCount / session.duration
    }));
  }

  private groupBySessions(performanceData: any[]): any[] {
    const sessions: any[] = [];
    let currentSession: any = null;
    
    performanceData.forEach(record => {
      const recordTime = new Date(record.last_reviewed);
      
      if (!currentSession || 
          recordTime.getTime() - currentSession.endTime.getTime() > 30 * 60 * 1000) { // 30 min gap
        if (currentSession) {
          sessions.push(currentSession);
        }
        
        currentSession = {
          startTime: recordTime,
          endTime: recordTime,
          wordCount: 1,
          accuracy: record.mastery_level / 100,
          duration: 0
        };
      } else {
        currentSession.endTime = recordTime;
        currentSession.wordCount++;
        currentSession.accuracy += record.mastery_level / 100;
      }
    });
    
    if (currentSession) {
      currentSession.duration = (currentSession.endTime.getTime() - currentSession.startTime.getTime()) / (1000 * 60);
      currentSession.accuracy /= currentSession.wordCount;
      sessions.push(currentSession);
    }
    
    return sessions;
  }

  private analyzeDifficultyProgression(performanceData: any[]): any {
    // Analyze how user performs with different difficulty levels
    const difficultyPerformance: Record<string, { count: number; accuracy: number }> = {};
    
    performanceData.forEach(record => {
      const difficulty = record.difficulty_level || 'medium';
      
      if (!difficultyPerformance[difficulty]) {
        difficultyPerformance[difficulty] = { count: 0, accuracy: 0 };
      }
      
      difficultyPerformance[difficulty].count++;
      difficultyPerformance[difficulty].accuracy += record.mastery_level / 100;
    });

    // Calculate average accuracy for each difficulty
    Object.keys(difficultyPerformance).forEach(difficulty => {
      difficultyPerformance[difficulty].accuracy /= difficultyPerformance[difficulty].count;
    });

    return difficultyPerformance;
  }

  private async analyzeTopicPreferences(userId: string, performanceData: any[]): Promise<any> {
    // Analyze which topics user performs best in
    const topicPerformance: Record<string, { count: number; accuracy: number }> = {};
    
    // Get word details for performance data
    const wordIds = performanceData.map(record => record.word_id);
    const { data: words } = await supabase
      .from('word_entries')
      .select('id, tags')
      .in('id', wordIds);

    if (!words) return {};

    // Map performance to topics
    performanceData.forEach(record => {
      const word = words.find(w => w.id === record.word_id);
      if (word && word.tags) {
        word.tags.forEach((tag: string) => {
          if (!topicPerformance[tag]) {
            topicPerformance[tag] = { count: 0, accuracy: 0 };
          }
          
          topicPerformance[tag].count++;
          topicPerformance[tag].accuracy += record.mastery_level / 100;
        });
      }
    });

    // Calculate average accuracy for each topic
    Object.keys(topicPerformance).forEach(topic => {
      topicPerformance[topic].accuracy /= topicPerformance[topic].count;
    });

    return topicPerformance;
  }

  private analyzeErrorPatterns(performanceData: any[]): any {
    // Analyze patterns in user's mistakes
    const errorPatterns = {
      commonMistakes: this.identifyCommonMistakes(performanceData),
      timeBasedErrors: this.analyzeTimeBasedErrors(performanceData),
      difficultyBasedErrors: this.analyzeDifficultyBasedErrors(performanceData)
    };

    return errorPatterns;
  }

  private identifyCommonMistakes(performanceData: any[]): any[] {
    const mistakes = performanceData.filter(record => record.mastery_level < 50);
    
    // Group mistakes by word characteristics
    const mistakeTypes: Record<string, number> = {};
    
    mistakes.forEach(mistake => {
      // This would analyze the actual word to categorize the mistake
      // For now, use a simple categorization
      const mistakeType = mistake.mastery_level < 25 ? 'severe' : 'moderate';
      mistakeTypes[mistakeType] = (mistakeTypes[mistakeType] || 0) + 1;
    });

    return Object.entries(mistakeTypes).map(([type, count]) => ({ type, count }));
  }

  private analyzeTimeBasedErrors(performanceData: any[]): any {
    // Analyze if errors occur more at certain times
    const timeErrors: Record<string, number> = {};
    
    performanceData
      .filter(record => record.mastery_level < 50)
      .forEach(record => {
        const hour = new Date(record.last_reviewed).getHours();
        const timeSlot = this.getTimeSlot(hour);
        timeErrors[timeSlot] = (timeErrors[timeSlot] || 0) + 1;
      });

    return timeErrors;
  }

  private analyzeDifficultyBasedErrors(performanceData: any[]): any {
    // Analyze if errors occur more with certain difficulty levels
    const difficultyErrors: Record<string, number> = {};
    
    performanceData
      .filter(record => record.mastery_level < 50)
      .forEach(record => {
        const difficulty = record.difficulty_level || 'medium';
        difficultyErrors[difficulty] = (difficultyErrors[difficulty] || 0) + 1;
      });

    return difficultyErrors;
  }

  // ========================================
  // LEVEL AND PACE CALCULATION
  // ========================================

  private calculateCurrentLevel(performanceData: any[]): string {
    if (performanceData.length === 0) return 'beginner';
    
    const avgMastery = performanceData.reduce((sum, record) => sum + record.mastery_level, 0) / performanceData.length;
    
    if (avgMastery < 30) return 'beginner';
    if (avgMastery < 70) return 'intermediate';
    return 'advanced';
  }

  private calculateLearningPace(performanceData: any[]): number {
    if (performanceData.length < 2) return 1.0;
    
    // Calculate how quickly user improves
    const recentData = performanceData.slice(0, 10); // Last 10 interactions
    const olderData = performanceData.slice(10, 20); // Previous 10 interactions
    
    if (olderData.length === 0) return 1.0;
    
    const recentAvg = recentData.reduce((sum, record) => sum + record.mastery_level, 0) / recentData.length;
    const olderAvg = olderData.reduce((sum, record) => sum + record.mastery_level, 0) / olderData.length;
    
    const improvement = recentAvg - olderAvg;
    const pace = 1.0 + (improvement / 100); // Base pace of 1.0
    
    return Math.max(0.5, Math.min(2.0, pace)); // Clamp between 0.5 and 2.0
  }

  private calculateAccuracyRate(performanceData: any[]): number {
    if (performanceData.length === 0) return 0;
    
    const correctAnswers = performanceData.filter(record => record.mastery_level > 50).length;
    return correctAnswers / performanceData.length;
  }

  private calculateAverageResponseTime(performanceData: any[]): number {
    if (performanceData.length === 0) return 0;
    
    const totalTime = performanceData.reduce((sum, record) => sum + (record.average_time || 0), 0);
    return totalTime / performanceData.length;
  }

  private async calculateRetentionRate(userId: string): Promise<number> {
    // Calculate how well user retains words over time
    const { data: retentionData } = await supabase
      .from('user_word_mastery')
      .select('mastery_level, last_reviewed')
      .eq('user_id', userId)
      .gte('last_reviewed', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last week

    if (!retentionData || retentionData.length === 0) return 0;
    
    const retainedWords = retentionData.filter(record => record.mastery_level > 70).length;
    return retainedWords / retentionData.length;
  }

  // ========================================
  // STRENGTHS AND WEAKNESSES ANALYSIS
  // ========================================

  private identifyStrengths(performanceData: any[]): string[] {
    const strengths: string[] = [];
    
    if (performanceData.length === 0) return strengths;
    
    const avgMastery = performanceData.reduce((sum, record) => sum + record.mastery_level, 0) / performanceData.length;
    
    if (avgMastery > 80) strengths.push('high_accuracy');
    if (avgMastery > 70) strengths.push('good_retention');
    
    const recentData = performanceData.slice(0, 5);
    const recentAvg = recentData.reduce((sum, record) => sum + record.mastery_level, 0) / recentData.length;
    
    if (recentAvg > avgMastery) strengths.push('improving_performance');
    
    return strengths;
  }

  private identifyWeaknesses(performanceData: any[]): string[] {
    const weaknesses: string[] = [];
    
    if (performanceData.length === 0) return weaknesses;
    
    const avgMastery = performanceData.reduce((sum, record) => sum + record.mastery_level, 0) / performanceData.length;
    
    if (avgMastery < 50) weaknesses.push('low_accuracy');
    if (avgMastery < 60) weaknesses.push('retention_issues');
    
    const difficultWords = performanceData.filter(record => record.mastery_level < 30);
    if (difficultWords.length > performanceData.length * 0.3) {
      weaknesses.push('struggles_with_difficult_words');
    }
    
    return weaknesses;
  }

  private async analyzePreferredTopics(userId: string): Promise<string[]> {
    // Analyze which topics user performs best in
    const { data: topicPerformance } = await supabase
      .from('word_performance_metrics')
      .select(`
        word_id,
        accuracy,
        word_entries!inner(tags)
      `)
      .eq('user_id', userId);

    if (!topicPerformance) return ['general'];

    const topicScores: Record<string, number> = {};
    
    topicPerformance.forEach(record => {
      const tags = record.word_entries?.[0]?.tags || [];
      tags.forEach((tag: string) => {
        if (!topicScores[tag]) topicScores[tag] = 0;
        topicScores[tag] += record.accuracy;
      });
    });

    // Return top 3 preferred topics
    return Object.entries(topicScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  private determineLearningStyle(performanceData: any[]): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
    // This would analyze actual learning patterns
    // For now, return a default based on performance
    if (performanceData.length === 0) return 'mixed';
    
    const avgMastery = performanceData.reduce((sum, record) => sum + record.mastery_level, 0) / performanceData.length;
    
    if (avgMastery > 80) return 'visual';
    if (avgMastery > 60) return 'auditory';
    if (avgMastery > 40) return 'kinesthetic';
    return 'mixed';
  }

  // ========================================
  // WORD RECOMMENDATIONS
  // ========================================

  private async generateWordRecommendations(
    userId: string, 
    profile: UserPerformanceProfile
  ): Promise<AdaptiveRecommendation[]> {
    // Get words at appropriate difficulty level
    const { data: words } = await supabase
      .from('word_entries')
      .select('*')
      .eq('difficulty_level', profile.currentLevel)
      .limit(50);

    if (!words) return [];

    // Generate recommendations for each word
    const recommendations = await Promise.all(
      words.map(async word => {
        const confidence = await this.calculateRecommendationConfidence(word, profile);
        const reason = this.generateRecommendationReason(word, profile);
        const learningStrategy = this.determineLearningStrategy(word, profile);
        
        return {
          wordId: word.id,
          confidence,
          reason,
          difficulty: word.difficulty_level,
          estimatedTime: this.estimateLearningTime(word, profile),
          learningStrategy
        };
      })
    );

    return recommendations;
  }

  private async calculateRecommendationConfidence(
    word: any, 
    profile: UserPerformanceProfile
  ): Promise<number> {
    let confidence = 50; // Base confidence
    
    // Check if user has already learned this word
    const { data: existingMastery } = await supabase
      .from('user_word_mastery')
      .select('mastery_level')
      .eq('user_id', profile.userId)
      .eq('word_id', word.id)
      .single();

    if (existingMastery) {
      if (existingMastery.mastery_level > 80) {
        confidence -= 30; // Already mastered
      } else if (existingMastery.mastery_level > 50) {
        confidence += 10; // Good for review
      }
    } else {
      confidence += 20; // New word
    }
    
    // Boost confidence for preferred topics
    const tags: string[] = Array.isArray(word.tags) ? word.tags : [];
    if (tags.length && profile.preferredTopics.some(topic => 
      tags.includes(topic)
    )) {
      confidence += 15;
    }
    
    // Adjust for difficulty match
    if (word.difficulty_level === profile.currentLevel) {
      confidence += 10;
    }
    
    return Math.min(confidence, 100);
  }

  private generateRecommendationReason(word: any, profile: UserPerformanceProfile): string {
    const reasons: string[] = [];
    
    if (word.difficulty_level === profile.currentLevel) {
      reasons.push('matches your current level');
    }
    
    const tags: string[] = Array.isArray(word.tags) ? word.tags : [];
    if (tags.length && profile.preferredTopics.some(topic => tags.includes(topic))) {
      reasons.push('in your preferred topic area');
    }
    
    if (reasons.length === 0) {
      reasons.push('good for expanding vocabulary');
    }
    
    return reasons.join(', ');
  }

  private determineLearningStrategy(word: any, profile: UserPerformanceProfile): string {
    switch (profile.learningStyle) {
      case 'visual':
        return 'focus on visual associations and word patterns';
      case 'auditory':
        return 'practice pronunciation and listen to examples';
      case 'kinesthetic':
        return 'use interactive exercises and writing practice';
      default:
        return 'mixed approach with various learning methods';
    }
  }

  private estimateLearningTime(word: any, profile: UserPerformanceProfile): number {
    // Base time: 2 minutes per word
    let baseTime = 2;
    
    // Adjust for user's learning pace
    baseTime /= profile.learningPace;
    
    // Adjust for word difficulty
    if (word.difficulty_level === 'advanced') baseTime *= 1.5;
    if (word.difficulty_level === 'beginner') baseTime *= 0.8;
    
    return Math.round(baseTime);
  }

  private filterRecommendations(
    recommendations: AdaptiveRecommendation[], 
    profile: UserPerformanceProfile
  ): AdaptiveRecommendation[] {
    return recommendations
      .filter(rec => rec.confidence > 30) // Minimum confidence threshold
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Top 10 recommendations
  }

  private selectOptimalWord(
    recommendations: AdaptiveRecommendation[], 
    profile: UserPerformanceProfile
  ): string | null {
    if (recommendations.length === 0) return null;
    
    // Select word with highest confidence
    return recommendations[0].wordId;
  }

  // ========================================
  // DIFFICULTY ADJUSTMENT
  // ========================================

  private analyzeWordPerformance(performance: PerformanceMetrics): any {
    return {
      accuracy: performance.accuracy,
      responseTime: performance.responseTime,
      reviewCount: performance.reviewCount,
      trend: this.calculatePerformanceTrend(performance)
    };
  }

  private calculatePerformanceTrend(performance: PerformanceMetrics): 'improving' | 'declining' | 'stable' {
    // This would analyze performance over time
    // For now, use a simple heuristic
    if (performance.accuracy > 0.8) return 'improving';
    if (performance.accuracy < 0.4) return 'declining';
    return 'stable';
  }

  private determineAdjustmentNeeded(analysis: any): boolean {
    // Determine if difficulty adjustment is needed
    if (analysis.accuracy > 0.9 && analysis.responseTime < 5000) {
      return true; // Too easy
    }
    
    if (analysis.accuracy < 0.3 && analysis.responseTime > 15000) {
      return true; // Too hard
    }
    
    return false;
  }

  private calculateNewDifficulty(analysis: any): number {
    let adjustment = 0;
    
    if (analysis.accuracy > 0.9) {
      adjustment = this.config.difficultyAdjustmentRate; // Increase difficulty
    } else if (analysis.accuracy < 0.3) {
      adjustment = -this.config.difficultyAdjustmentRate; // Decrease difficulty
    }
    
    return Math.max(0, Math.min(100, analysis.difficultyAdjustment + adjustment));
  }

  private calculateAdjustmentConfidence(analysis: any): number {
    // Calculate confidence in the adjustment based on data quality
    let confidence = 0.5; // Base confidence
    
    if (analysis.reviewCount > 5) confidence += 0.2;
    if (analysis.reviewCount > 10) confidence += 0.2;
    
    // Higher confidence for more extreme performance
    if (analysis.accuracy > 0.95 || analysis.accuracy < 0.2) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private generateAdjustmentReason(analysis: any): string {
    if (analysis.accuracy > 0.9) {
      return 'High accuracy indicates word is too easy';
    } else if (analysis.accuracy < 0.3) {
      return 'Low accuracy indicates word is too difficult';
    }
    
    return 'Performance analysis suggests adjustment needed';
  }

  private async updateWordDifficulty(wordId: string, newDifficulty: number): Promise<void> {
    // Update word difficulty in database
    await supabase
      .from('word_entries')
      .update({ difficulty_score: newDifficulty })
      .eq('id', wordId);
  }

  // ========================================
  // WORD PREFERENCE SCORING
  // ========================================
  private calculateWordPreferenceScore(word: any, profile: UserPerformanceProfile): number {
    let score = 0;
    const tags: string[] = Array.isArray(word.tags) ? word.tags : [];
    // Score for preferred topics
    if (profile.preferredTopics && tags.some(tag => profile.preferredTopics.includes(tag))) {
      score += 50;
    }
    // Score for matching difficulty
    if (word.difficulty_level && word.difficulty_level === profile.currentLevel) {
      score += 20;
    }
    // Penalty for weaknesses
    if (profile.weaknesses && tags.some(tag => profile.weaknesses.includes(tag))) {
      score -= 20;
    }
    // Bonus for strengths
    if (profile.strengths && tags.some(tag => profile.strengths.includes(tag))) {
      score += 10;
    }
    return score;
  }
} 