import { createClient } from '@supabase/supabase-js';
import { CEFRWordBank, DifficultyLevel, WordEntry } from '../types/wordMaze';
import { CEFRValidationService } from './cefrValidationService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class CEFRWordBankService {
  private cefrService = new CEFRValidationService();

  /**
   * Get word bank for a specific CEFR level
   */
  async getWordBank(level: DifficultyLevel, userId?: string): Promise<CEFRWordBank> {
    console.log(`[CEFR Word Bank] Getting words for level: ${level}`);

    let query = supabase
      .from('word_entries')
      .select(`
        *,
        word_definitions(*),
        word_examples(*),
        word_tags(*),
        user_word_mastery(*)
      `)
      .eq('difficulty_level', level)
      .order('difficulty_score', { ascending: true });

    // If user is provided, filter to their words
    if (userId) {
      query = query.eq('user_word_mastery.user_id', userId);
    }

    const { data: words, error } = await query;

    if (error) {
      console.error('Error fetching CEFR word bank:', error);
      throw new Error(`Failed to fetch word bank: ${error.message}`);
    }

    const wordEntries = words as WordEntry[];
    const estimatedLearningTime = this.calculateEstimatedLearningTime(wordEntries);
    const prerequisites = this.getPrerequisites(level);

    return {
      level,
      words: wordEntries,
      count: wordEntries.length,
      estimatedLearningTime,
      prerequisites
    };
  }

  /**
   * Get all CEFR word banks
   */
  async getAllWordBanks(userId?: string): Promise<Record<DifficultyLevel, CEFRWordBank>> {
    const levels = CEFRValidationService.getAllCEFRLevels();
    const wordBanks: Record<DifficultyLevel, CEFRWordBank> = {} as Record<DifficultyLevel, CEFRWordBank>;

    await Promise.all(
      levels.map(async (level) => {
        wordBanks[level] = await this.getWordBank(level, userId);
      })
    );

    return wordBanks;
  }

  /**
   * Get user's progress across CEFR levels
   */
  async getUserCEFRProgress(userId: string): Promise<{
    level: DifficultyLevel;
    totalWords: number;
    masteredWords: number;
    inProgressWords: number;
    notStartedWords: number;
    progressPercentage: number;
  }[]> {
    const levels = CEFRValidationService.getAllCEFRLevels();
    const progress = [];

    for (const level of levels) {
      const wordBank = await this.getWordBank(level, userId);
      
      const masteredWords = wordBank.words.filter(word => 
        word.user_word_mastery?.some(mastery => mastery.mastery_level >= 80)
      ).length;

      const inProgressWords = wordBank.words.filter(word => 
        word.user_word_mastery?.some(mastery => 
          mastery.mastery_level > 0 && mastery.mastery_level < 80
        )
      ).length;

      const notStartedWords = wordBank.words.filter(word => 
        !word.user_word_mastery || word.user_word_mastery.length === 0
      ).length;

      const progressPercentage = wordBank.count > 0 
        ? (masteredWords / wordBank.count) * 100 
        : 0;

      progress.push({
        level,
        totalWords: wordBank.count,
        masteredWords,
        inProgressWords,
        notStartedWords,
        progressPercentage
      });
    }

    return progress;
  }

  /**
   * Get recommended words for a user based on their CEFR level
   */
  async getRecommendedWords(
    userId: string, 
    count: number = 10,
    targetLevel?: DifficultyLevel
  ): Promise<WordEntry[]> {
    // Get user's current level
    const userProgress = await this.getUserCEFRProgress(userId);
    const currentLevel = this.determineUserLevel(userProgress);
    
    // Use target level or current level
    const level = targetLevel || currentLevel;

    // Get words at this level that the user hasn't mastered
    const wordBank = await this.getWordBank(level, userId);
    
    const recommendedWords = wordBank.words
      .filter(word => {
        const mastery = word.user_word_mastery?.[0];
        return !mastery || mastery.mastery_level < 80;
      })
      .sort((a, b) => {
        // Sort by difficulty score (easier first)
        return (a.difficulty_score || 0) - (b.difficulty_score || 0);
      })
      .slice(0, count);

    return recommendedWords;
  }

  /**
   * Get learning path for a user (sequence of words to learn)
   */
  async getLearningPath(
    userId: string, 
    targetLevel: DifficultyLevel,
    wordsPerLevel: number = 20
  ): Promise<{
    level: DifficultyLevel;
    words: WordEntry[];
    estimatedTime: number;
  }[]> {
    const levels = CEFRValidationService.getAllCEFRLevels();
    const targetIndex = levels.indexOf(targetLevel);
    const learningPath = [];

    for (let i = 0; i <= targetIndex; i++) {
      const level = levels[i];
      const wordBank = await this.getWordBank(level, userId);
      
      // Get words not yet mastered
      const availableWords = wordBank.words.filter(word => {
        const mastery = word.user_word_mastery?.[0];
        return !mastery || mastery.mastery_level < 80;
      });

      // Take the specified number of words
      const selectedWords = availableWords
        .sort((a, b) => (a.difficulty_score || 0) - (b.difficulty_score || 0))
        .slice(0, wordsPerLevel);

      const estimatedTime = this.calculateEstimatedLearningTime(selectedWords);

      learningPath.push({
        level,
        words: selectedWords,
        estimatedTime
      });
    }

    return learningPath;
  }

  /**
   * Calculate estimated learning time for a set of words
   */
  private calculateEstimatedLearningTime(words: WordEntry[]): number {
    // Base time: 2 minutes per word
    const baseTimePerWord = 2;
    
    // Adjust based on difficulty
    const totalTime = words.reduce((total, word) => {
      const difficultyMultiplier = (word.difficulty_score || 50) / 50; // 0.2 to 2.0
      return total + (baseTimePerWord * difficultyMultiplier);
    }, 0);

    // Convert to hours
    return Math.round(totalTime / 60);
  }

  /**
   * Get prerequisites for a CEFR level
   */
  private getPrerequisites(level: DifficultyLevel): DifficultyLevel[] {
    const levels = CEFRValidationService.getAllCEFRLevels();
    const levelIndex = levels.indexOf(level);
    
    if (levelIndex <= 0) return [];
    
    return levels.slice(0, levelIndex);
  }

  /**
   * Determine user's current CEFR level based on progress
   */
  private determineUserLevel(progress: any[]): DifficultyLevel {
    // Find the highest level where user has mastered at least 70% of words
    for (let i = progress.length - 1; i >= 0; i--) {
      if (progress[i].progressPercentage >= 70) {
        return progress[i].level;
      }
    }
    
    return 'A1'; // Default to A1 if no level meets criteria
  }

  /**
   * Get CEFR level statistics
   */
  async getCEFRStatistics(): Promise<{
    level: DifficultyLevel;
    totalWords: number;
    averageDifficulty: number;
    wordTypes: Record<string, number>;
  }[]> {
    const levels = CEFRValidationService.getAllCEFRLevels();
    const statistics = [];

    for (const level of levels) {
      const { data: words, error } = await supabase
        .from('word_entries')
        .select('*')
        .eq('difficulty_level', level);

      if (error) {
        console.error(`Error fetching statistics for level ${level}:`, error);
        continue;
      }

      const wordEntries = words as WordEntry[];
      const averageDifficulty = wordEntries.length > 0 
        ? wordEntries.reduce((sum, word) => sum + (word.difficulty_score || 0), 0) / wordEntries.length
        : 0;

      // Count word types
      const wordTypes: Record<string, number> = {};
      wordEntries.forEach(word => {
        const type = word.type || 'unknown';
        wordTypes[type] = (wordTypes[type] || 0) + 1;
      });

      statistics.push({
        level,
        totalWords: wordEntries.length,
        averageDifficulty,
        wordTypes
      });
    }

    return statistics;
  }
} 