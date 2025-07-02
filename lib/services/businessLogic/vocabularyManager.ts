import { supabase } from '../../supabaseClient';
import { 
  WordEntry, 
  WordDefinition, 
  WordExample, 
  WordTag, 
  WordRelationship,
  UnifiedWordData,
  UserWordMastery
} from '../../types/wordMaze';
import { apiAggregator } from '../apiAggregator';

export interface WordDifficultyAnalysis {
  level: 'beginner' | 'intermediate' | 'advanced';
  score: number; // 0-100
  factors: {
    length: number;
    frequency: number;
    complexity: number;
    etymology: number;
    contextDependency: number;
  };
}

export interface LearningPattern {
  userId: string;
  wordId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  preferredContext: string[];
  retentionRate: number;
  reviewFrequency: number;
  timeOfDay: string;
  sessionDuration: number;
}

export interface WordRecommendation {
  wordId: string;
  confidence: number;
  reason: string;
  difficulty: string;
  tags: string[];
  estimatedTime: number;
}

export class VocabularyManager {
  
  // ========================================
  // ENHANCED WORD ANALYSIS
  // ========================================

  async analyzeWordDifficulty(wordData: UnifiedWordData): Promise<WordDifficultyAnalysis> {
    const factors = {
      length: this.calculateLengthFactor(wordData.word),
      frequency: await this.calculateFrequencyFactor(wordData.word),
      complexity: this.calculateComplexityFactor(wordData),
      etymology: this.calculateEtymologyFactor(wordData),
      contextDependency: this.calculateContextDependencyFactor(wordData)
    };

    const totalScore = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / 5;
    
    let level: 'beginner' | 'intermediate' | 'advanced';
    if (totalScore < 30) level = 'beginner';
    else if (totalScore < 70) level = 'intermediate';
    else level = 'advanced';

    return {
      level,
      score: totalScore,
      factors
    };
  }

  private calculateLengthFactor(word: string): number {
    // Longer words are generally more difficult
    const length = word.length;
    if (length <= 4) return 10;
    if (length <= 6) return 25;
    if (length <= 8) return 40;
    if (length <= 10) return 60;
    if (length <= 12) return 75;
    return 90;
  }

  private async calculateFrequencyFactor(word: string): Promise<number> {
    // Check if word exists in our database (proxy for frequency)
    const existingWord = await this.getWordByText(word);
    if (existingWord) {
      // If word exists, it's more common
      return 30;
    }
    
    // Check word length as proxy for frequency
    const length = word.length;
    if (length <= 3) return 20; // Very common short words
    if (length <= 5) return 40; // Common words
    if (length <= 7) return 60; // Moderate frequency
    if (length <= 9) return 75; // Less common
    return 90; // Rare long words
  }

  private calculateComplexityFactor(wordData: UnifiedWordData): number {
    let complexity = 0;
    
    // Multiple definitions indicate complexity
    if (wordData.definitions.length > 2) complexity += 20;
    
    // Multiple parts of speech
    const partsOfSpeech = new Set(wordData.definitions.map(d => d.part_of_speech));
    if (partsOfSpeech.size > 1) complexity += 15;
    
    // Long definitions
    const avgDefinitionLength = wordData.definitions.reduce((sum, def) => sum + def.text.length, 0) / wordData.definitions.length;
    if (avgDefinitionLength > 100) complexity += 10;
    
    // Special characters or unusual spelling
    if (/[^a-zA-Z]/.test(wordData.word)) complexity += 10;
    
    return Math.min(complexity, 100);
  }

  private calculateEtymologyFactor(wordData: UnifiedWordData): number {
    // Words with Latin/Greek roots are often more complex
    const latinRoots = ['pre', 'post', 'sub', 'super', 'inter', 'trans', 're', 'un', 'dis'];
    const greekRoots = ['phil', 'soph', 'log', 'geo', 'bio', 'psych', 'tele', 'auto'];
    
    let etymologyScore = 0;
    const word = wordData.word.toLowerCase();
    
    latinRoots.forEach(root => {
      if (word.startsWith(root)) etymologyScore += 15;
    });
    
    greekRoots.forEach(root => {
      if (word.startsWith(root)) etymologyScore += 20;
    });
    
    return Math.min(etymologyScore, 100);
  }

  private calculateContextDependencyFactor(wordData: UnifiedWordData): number {
    // Words that need context are harder to learn
    let contextScore = 0;
    
    // Multiple meanings
    if (wordData.definitions.length > 1) contextScore += 20;
    
    // Abstract concepts
    const abstractWords = ['concept', 'theory', 'philosophy', 'abstract', 'metaphor', 'symbol'];
    if (abstractWords.some(abstract => wordData.word.toLowerCase().includes(abstract))) {
      contextScore += 30;
    }
    
    // Technical terms
    if (wordData.tags.some(tag => tag.includes('technical') || tag.includes('specialized'))) {
      contextScore += 25;
    }
    
    return Math.min(contextScore, 100);
  }

  // ========================================
  // LEARNING PATTERN ANALYSIS
  // ========================================

  async analyzeLearningPattern(userId: string, wordId: string): Promise<LearningPattern> {
    const mastery = await this.getUserWordMastery(userId, wordId);
    if (!mastery) {
      return this.createDefaultLearningPattern(userId, wordId);
    }

    // Analyze user's interaction patterns
    const learningStyle = this.determineLearningStyle(mastery);
    const preferredContext = await this.analyzePreferredContext(userId, wordId);
    const retentionRate = this.calculateRetentionRate(mastery);
    const reviewFrequency = this.calculateReviewFrequency(mastery);
    const timeOfDay = await this.analyzeOptimalTimeOfDay(userId, wordId);
    const sessionDuration = await this.analyzeOptimalSessionDuration(userId, wordId);

    return {
      userId,
      wordId,
      learningStyle,
      preferredContext,
      retentionRate,
      reviewFrequency,
      timeOfDay,
      sessionDuration
    };
  }

  private determineLearningStyle(mastery: UserWordMastery): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' {
    // This would be enhanced with actual user interaction data
    // For now, return a default based on performance
    if (mastery.masteryLevel > 80) return 'visual';
    if (mastery.masteryLevel > 60) return 'auditory';
    if (mastery.masteryLevel > 40) return 'kinesthetic';
    return 'mixed';
  }

  private async analyzePreferredContext(userId: string, wordId: string): Promise<string[]> {
    // Analyze which contexts (sentences, examples) user performs best with
    // For now, return common contexts
    return ['everyday conversation', 'academic writing', 'casual reading'];
  }

  private calculateRetentionRate(mastery: UserWordMastery): number {
    if (mastery.reviewCount === 0) return 0;
    return (mastery.correctCount / mastery.reviewCount) * 100;
  }

  private calculateReviewFrequency(mastery: UserWordMastery): number {
    // Calculate how often user needs to review this word
    const daysSinceLastReview = (Date.now() - new Date(mastery.lastReviewed).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(1, Math.ceil(daysSinceLastReview / 7)); // Reviews per week
  }

  private async analyzeOptimalTimeOfDay(userId: string, wordId: string): Promise<string> {
    // This would analyze user's best performance times
    // For now, return a default
    return 'morning';
  }

  private async analyzeOptimalSessionDuration(userId: string, wordId: string): Promise<number> {
    // This would analyze optimal session length for this user/word
    // For now, return a default
    return 15; // minutes
  }

  private createDefaultLearningPattern(userId: string, wordId: string): LearningPattern {
    return {
      userId,
      wordId,
      learningStyle: 'mixed',
      preferredContext: ['everyday conversation'],
      retentionRate: 0,
      reviewFrequency: 1,
      timeOfDay: 'morning',
      sessionDuration: 15
    };
  }

  // ========================================
  // INTELLIGENT WORD RECOMMENDATIONS
  // ========================================

  async generateWordRecommendations(
    userId: string, 
    count: number = 10,
    preferences?: {
      difficulty?: string;
      tags?: string[];
      excludeWords?: string[];
    }
  ): Promise<WordRecommendation[]> {
    // 1. Get user's current level
    const userLevel = await this.getUserLevel(userId);
    
    // 2. Find words at appropriate difficulty
    const candidateWords = await this.getWordsByDifficulty(
      preferences?.difficulty || userLevel, 
      count * 3
    );
    
    // 3. Filter by preferences
    let filteredWords = candidateWords;
    if (preferences?.tags) {
      filteredWords = filteredWords.filter(word => 
        word.tags?.some(tag => preferences.tags!.includes(tag))
      );
    }
    
    if (preferences?.excludeWords) {
      filteredWords = filteredWords.filter(word => 
        !preferences.excludeWords!.includes(word.id)
      );
    }
    
    // 4. Score and rank words
    const recommendations = await Promise.all(
      filteredWords.slice(0, count).map(async word => {
        const confidence = await this.calculateRecommendationConfidence(userId, word);
        const difficulty = await this.analyzeWordDifficulty(await this.getCompleteWordData(word.id) as UnifiedWordData);
        
        return {
          wordId: word.id,
          confidence,
          reason: this.generateRecommendationReason(word, confidence),
          difficulty: difficulty.level,
          tags: word.tags || [],
          estimatedTime: this.estimateLearningTime(word, difficulty)
        };
      })
    );
    
    // 5. Sort by confidence and return
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  private async getUserLevel(userId: string): Promise<string> {
    // Analyze user's performance across all words
    const { data: masteries } = await supabase
      .from('user_word_mastery')
      .select('*')
      .eq('user_id', userId);
    
    if (!masteries || masteries.length === 0) return 'beginner';
    
    const avgMastery = masteries.reduce((sum, mastery) => sum + mastery.mastery_level, 0) / masteries.length;
    
    if (avgMastery < 30) return 'beginner';
    if (avgMastery < 70) return 'intermediate';
    return 'advanced';
  }

  private async calculateRecommendationConfidence(userId: string, word: WordEntry): Promise<number> {
    let confidence = 50; // Base confidence
    
    // Check if user has learned similar words
    const similarWords = await this.findSimilarWords(word);
    const userMastery = await this.getUserWordMastery(userId, word.id);
    
    if (userMastery) {
      // User has already interacted with this word
      confidence += userMastery.masteryLevel * 0.3;
    }
    
    // Boost confidence for words similar to well-known words
    const similarMastery = await this.getAverageMasteryOfSimilarWords(userId, similarWords);
    confidence += similarMastery * 0.2;
    
    return Math.min(confidence, 100);
  }

  private async findSimilarWords(word: WordEntry): Promise<WordEntry[]> {
    // Find words with similar tags or difficulty
    const { data: similarWords } = await supabase
      .from('word_entries')
      .select('*')
      .eq('difficulty_level', word.difficulty_level)
      .limit(10);
    
    return similarWords || [];
  }

  private async getAverageMasteryOfSimilarWords(userId: string, words: WordEntry[]): Promise<number> {
    if (words.length === 0) return 0;
    
    const masteries = await Promise.all(
      words.map(word => this.getUserWordMastery(userId, word.id))
    );
    
    const validMasteries = masteries.filter(m => m !== null);
    if (validMasteries.length === 0) return 0;
    
    return validMasteries.reduce((sum, mastery) => sum + mastery!.masteryLevel, 0) / validMasteries.length;
  }

  private generateRecommendationReason(word: WordEntry, confidence: number): string {
    if (confidence > 80) return `High confidence - matches your learning pattern`;
    if (confidence > 60) return `Good fit for your current level`;
    if (confidence > 40) return `Challenging but achievable`;
    return `New challenge to expand your vocabulary`;
  }

  private estimateLearningTime(word: WordEntry, difficulty: WordDifficultyAnalysis): number {
    // Estimate time in minutes based on difficulty
    const baseTime = 2; // Base 2 minutes per word
    const difficultyMultiplier = difficulty.score / 50; // 0.2 to 2.0
    return Math.round(baseTime * difficultyMultiplier);
  }

  // ========================================
  // INHERIT FROM ORIGINAL VOCABULARY MANAGER
  // ========================================

  // Include all the original methods from the base VocabularyManager
  async createWordEntry(wordData: UnifiedWordData): Promise<WordEntry> {
    // Enhanced with difficulty analysis
    const difficultyAnalysis = await this.analyzeWordDifficulty(wordData);
    
    console.log(`Creating word entry for: ${wordData.word} with difficulty: ${difficultyAnalysis.level}`);

    // Check if word already exists
    const existingWord = await this.getWordByText(wordData.word);
    if (existingWord) {
      console.log(`Word ${wordData.word} already exists, updating...`);
      return await this.updateWordEntry(existingWord.id, wordData);
    }

    // Create new word entry with enhanced difficulty data
    const { data: wordEntry, error } = await supabase
      .from('word_entries')
      .insert({
        word_text: wordData.word,
        type: wordData.type,
        difficulty_level: difficultyAnalysis.level,
        difficulty_score: difficultyAnalysis.score,
        is_verified: wordData.definitions.some(d => d.source === 'oxford'),
        verification_source: wordData.definitions.find(d => d.source === 'oxford')?.source || 'wordnik',
        metadata: {
          ...wordData.metadata,
          difficultyFactors: difficultyAnalysis.factors
        }
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating word entry:', error);
      throw new Error(`Failed to create word entry: ${error.message}`);
    }

    // Create related data (definitions, examples, tags)
    await this.createWordDefinitions(wordEntry.id, wordData.definitions);
    await this.createWordExamples(wordEntry.id, wordData.examples);
    await this.createWordTags(wordEntry.id, wordData.tags);

    return wordEntry;
  }

  // Include all other methods from the original VocabularyManager
  async getWordByText(wordText: string): Promise<WordEntry | null> {
    const { data, error } = await supabase
      .from('word_entries')
      .select('*')
      .eq('word_text', wordText.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching word:', error);
      return null;
    }

    return data;
  }

  async getWordById(id: string): Promise<WordEntry | null> {
    const { data, error } = await supabase
      .from('word_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching word by ID:', error);
      return null;
    }

    return data;
  }

  async updateWordEntry(id: string, wordData: Partial<UnifiedWordData>): Promise<WordEntry> {
    const updateData: any = {};

    if (wordData.type) updateData.type = wordData.type;
    if (wordData.difficulty?.level) updateData.difficulty_level = wordData.difficulty.level;
    if (wordData.difficulty?.score) updateData.difficulty_score = wordData.difficulty.score;
    if (wordData.metadata) updateData.metadata = wordData.metadata;

    const { data, error } = await supabase
      .from('word_entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating word entry:', error);
      throw new Error(`Failed to update word entry: ${error.message}`);
    }

    return data;
  }

  async createWordDefinitions(wordId: string, definitions: UnifiedWordData['definitions']): Promise<void> {
    if (!definitions || definitions.length === 0) return;

    const definitionData = definitions.map((def, index) => ({
      word_id: wordId,
      source_api: def.source,
      definition_text: def.text,
      part_of_speech: def.part_of_speech,
      is_primary: index === 0,
      confidence_score: def.confidence
    }));

    const { error } = await supabase
      .from('word_definitions')
      .insert(definitionData);

    if (error) {
      console.error('Error creating word definitions:', error);
      throw new Error(`Failed to create word definitions: ${error.message}`);
    }
  }

  async getWordDefinitions(wordId: string): Promise<WordDefinition[]> {
    const { data, error } = await supabase
      .from('word_definitions')
      .select('*')
      .eq('word_id', wordId)
      .order('is_primary', { ascending: false })
      .order('confidence_score', { ascending: false });

    if (error) {
      console.error('Error fetching word definitions:', error);
      return [];
    }

    return data || [];
  }

  async createWordExamples(wordId: string, examples: UnifiedWordData['examples']): Promise<void> {
    if (!examples || examples.length === 0) return;

    const exampleData = examples.map((ex, index) => ({
      word_id: wordId,
      source_api: ex.source,
      example_text: ex.text,
      context: ex.context,
      is_primary: index === 0
    }));

    const { error } = await supabase
      .from('word_examples')
      .insert(exampleData);

    if (error) {
      console.error('Error creating word examples:', error);
      throw new Error(`Failed to create word examples: ${error.message}`);
    }
  }

  async getWordExamples(wordId: string): Promise<WordExample[]> {
    const { data, error } = await supabase
      .from('word_examples')
      .select('*')
      .eq('word_id', wordId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching word examples:', error);
      return [];
    }

    return data || [];
  }

  async createWordTags(wordId: string, tags: UnifiedWordData['tags']): Promise<void> {
    if (!tags || tags.length === 0) return;

    const tagData = tags.map(tag => ({
      word_id: wordId,
      tag_name: tag,
      source: 'ai_analysis'
    }));

    const { error } = await supabase
      .from('word_tags')
      .insert(tagData);

    if (error) {
      console.error('Error creating word tags:', error);
      throw new Error(`Failed to create word tags: ${error.message}`);
    }
  }

  async getWordTags(wordId: string): Promise<WordTag[]> {
    const { data, error } = await supabase
      .from('word_tags')
      .select('*')
      .eq('word_id', wordId);

    if (error) {
      console.error('Error fetching word tags:', error);
      return [];
    }

    return data || [];
  }

  async createWordRelationships(wordId: string, relationships: UnifiedWordData['relationships']): Promise<void> {
    if (!relationships || relationships.length === 0) return;

    const relationshipData = relationships.map(rel => ({
      word_id: wordId,
      related_word_id: rel.relatedWordId,
      relationship_type: rel.type,
      strength: rel.strength,
      source: rel.source
    }));

    const { error } = await supabase
      .from('word_relationships')
      .insert(relationshipData);

    if (error) {
      console.error('Error creating word relationships:', error);
      throw new Error(`Failed to create word relationships: ${error.message}`);
    }
  }

  async getWordRelationships(wordId: string): Promise<WordRelationship[]> {
    const { data, error } = await supabase
      .from('word_relationships')
      .select('*')
      .eq('word_id', wordId);

    if (error) {
      console.error('Error fetching word relationships:', error);
      return [];
    }

    return data || [];
  }

  async getUserWordMastery(userId: string, wordId: string): Promise<UserWordMastery | null> {
    const { data, error } = await supabase
      .from('user_word_mastery')
      .select('*')
      .eq('user_id', userId)
      .eq('word_id', wordId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user word mastery:', error);
      return null;
    }

    return data;
  }

  async updateUserWordMastery(
    userId: string, 
    wordId: string, 
    isCorrect: boolean, 
    timeTaken?: number
  ): Promise<UserWordMastery> {
    const existingMastery = await this.getUserWordMastery(userId, wordId);
    
    if (existingMastery) {
      // Update existing mastery
      const newReviewCount = existingMastery.review_count + 1;
      const newCorrectCount = existingMastery.correct_count + (isCorrect ? 1 : 0);
      const newIncorrectCount = existingMastery.incorrect_count + (isCorrect ? 0 : 1);
      
      // Calculate new mastery level using spaced repetition algorithm
      const newMasteryLevel = this.calculateNewMasteryLevel(
        existingMastery.mastery_level,
        isCorrect,
        newReviewCount,
        timeTaken
      );
      
      // Calculate new average time
      const newAverageTime = timeTaken 
        ? (existingMastery.average_time * (newReviewCount - 1) + timeTaken) / newReviewCount
        : existingMastery.average_time;
      
      // Calculate next review date using spaced repetition
      const nextReviewDate = this.calculateNextReviewDate(newMasteryLevel, newReviewCount, isCorrect);
      
      const { data, error } = await supabase
        .from('user_word_mastery')
        .update({
          mastery_level: newMasteryLevel,
          review_count: newReviewCount,
          correct_count: newCorrectCount,
          incorrect_count: newIncorrectCount,
          average_time: newAverageTime,
          next_review_date: nextReviewDate,
          last_reviewed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('word_id', wordId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user word mastery:', error);
        throw new Error(`Failed to update user word mastery: ${error.message}`);
      }

      return data;
    } else {
      // Create new mastery record
      const initialMasteryLevel = isCorrect ? 20 : 5;
      const nextReviewDate = this.calculateNextReviewDate(initialMasteryLevel, 1, isCorrect);
      
      const { data, error } = await supabase
        .from('user_word_mastery')
        .insert({
          user_id: userId,
          word_id: wordId,
          mastery_level: initialMasteryLevel,
          review_count: 1,
          correct_count: isCorrect ? 1 : 0,
          incorrect_count: isCorrect ? 0 : 1,
          average_time: timeTaken || 0,
          next_review_date: nextReviewDate,
          last_reviewed: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user word mastery:', error);
        throw new Error(`Failed to create user word mastery: ${error.message}`);
      }

      return data;
    }
  }

  private calculateNewMasteryLevel(
    currentLevel: number, 
    isCorrect: boolean, 
    reviewCount: number, 
    timeTaken?: number
  ): number {
    // Enhanced spaced repetition algorithm
    let adjustment = 0;
    
    if (isCorrect) {
      // Positive adjustment based on current level and review count
      adjustment = Math.max(5, 20 - currentLevel * 0.1);
      
      // Bonus for quick responses (indicates good recall)
      if (timeTaken && timeTaken < 5000) { // Less than 5 seconds
        adjustment += 5;
      }
    } else {
      // Negative adjustment
      adjustment = -Math.max(10, currentLevel * 0.2);
    }
    
    // Apply adjustment with bounds
    const newLevel = Math.max(0, Math.min(100, currentLevel + adjustment));
    
    return Math.round(newLevel);
  }

  private calculateNextReviewDate(masteryLevel: number, reviewCount: number, isCorrect: boolean): Date {
    // Spaced repetition intervals
    let intervalHours = 1; // Default 1 hour
    
    if (isCorrect) {
      // Progressive intervals based on mastery level
      if (masteryLevel < 30) intervalHours = 4; // 4 hours
      else if (masteryLevel < 50) intervalHours = 12; // 12 hours
      else if (masteryLevel < 70) intervalHours = 24; // 1 day
      else if (masteryLevel < 85) intervalHours = 72; // 3 days
      else intervalHours = 168; // 1 week
    } else {
      // Shorter interval for incorrect answers
      intervalHours = 1;
    }
    
    const nextReview = new Date();
    nextReview.setHours(nextReview.getHours() + intervalHours);
    return nextReview;
  }

  async searchWords(query: string, limit: number = 10): Promise<WordEntry[]> {
    const { data, error } = await supabase
      .from('word_entries')
      .select('*')
      .ilike('word_text', `%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Error searching words:', error);
      return [];
    }

    return data || [];
  }

  async getWordsByDifficulty(level: string, limit: number = 20): Promise<WordEntry[]> {
    const { data, error } = await supabase
      .from('word_entries')
      .select('*')
      .eq('difficulty_level', level)
      .limit(limit);

    if (error) {
      console.error('Error fetching words by difficulty:', error);
      return [];
    }

    return data || [];
  }

  async getWordsByType(type: string, limit: number = 20): Promise<WordEntry[]> {
    const { data, error } = await supabase
      .from('word_entries')
      .select('*')
      .eq('type', type)
      .limit(limit);

    if (error) {
      console.error('Error fetching words by type:', error);
      return [];
    }

    return data || [];
  }

  async getCompleteWordData(wordId: string): Promise<UnifiedWordData | null> {
    const word = await this.getWordById(wordId);
    if (!word) return null;

    const [definitions, examples, tags, relationships] = await Promise.all([
      this.getWordDefinitions(wordId),
      this.getWordExamples(wordId),
      this.getWordTags(wordId),
      this.getWordRelationships(wordId)
    ]);

    return {
      word: word.word_text,
      type: word.type,
      difficulty: {
        level: word.difficulty_level,
        score: word.difficulty_score
      },
      definitions: definitions.map(d => ({
        text: d.definition_text,
        part_of_speech: d.part_of_speech,
        source: d.source_api,
        confidence: d.confidence_score
      })),
      examples: examples.map(e => ({
        text: e.example_text,
        context: e.context,
        source: e.source_api
      })),
      tags: tags.map(t => t.tag_name),
      relationships: relationships.map(r => ({
        relatedWordId: r.related_word_id,
        type: r.relationship_type,
        strength: r.strength,
        source: r.source
      })),
      metadata: word.metadata
    };
  }

  async addWordFromAPI(word: string, userEmail: string = 'unknown'): Promise<WordEntry> {
    const wordData = await apiAggregator.getWordData(word, userEmail);
    if (!wordData) {
      throw new Error(`Could not fetch data for word: ${word}`);
    }
    return await this.createWordEntry(wordData);
  }

  async addWordsFromList(words: string[], userEmail: string = 'unknown'): Promise<WordEntry[]> {
    const results = await Promise.allSettled(
      words.map(word => this.addWordFromAPI(word, userEmail))
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<WordEntry> => result.status === 'fulfilled')
      .map(result => result.value);
  }
} 