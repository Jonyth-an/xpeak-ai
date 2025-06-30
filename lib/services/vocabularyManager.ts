import { createClient } from '@supabase/supabase-js';
import { 
  WordEntry, 
  WordDefinition, 
  WordExample, 
  WordTag, 
  WordRelationship,
  UnifiedWordData,
  UserWordMastery
} from '../types/wordMaze';
import { apiAggregator } from './apiAggregator';

// ========================================
// DATABASE CLIENT
// ========================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================
// VOCABULARY MANAGER CLASS
// ========================================

export class VocabularyManager {
  
  // ========================================
  // WORD ENTRY OPERATIONS
  // ========================================

  async createWordEntry(wordData: UnifiedWordData): Promise<WordEntry> {
    console.log(`Creating word entry for: ${wordData.word}`);

    // Check if word already exists
    const existingWord = await this.getWordByText(wordData.word);
    if (existingWord) {
      console.log(`Word ${wordData.word} already exists, updating...`);
      return await this.updateWordEntry(existingWord.id, wordData);
    }

    // Create new word entry
    const { data: wordEntry, error } = await supabase
      .from('word_entries')
      .insert({
        word_text: wordData.word,
        type: wordData.type,
        difficulty_level: wordData.difficulty.level,
        difficulty_score: wordData.difficulty.score,
        is_verified: wordData.definitions.some(d => d.source === 'oxford'),
        verification_source: wordData.definitions.find(d => d.source === 'oxford')?.source || 'wordnik',
        metadata: wordData.metadata
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

  // ========================================
  // DEFINITION OPERATIONS
  // ========================================

  async createWordDefinitions(wordId: string, definitions: UnifiedWordData['definitions']): Promise<void> {
    if (!definitions || definitions.length === 0) return;

    const definitionData = definitions.map((def, index) => ({
      word_id: wordId,
      source_api: def.source,
      definition_text: def.text,
      part_of_speech: def.part_of_speech,
      is_primary: index === 0, // First definition is primary
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

  // ========================================
  // EXAMPLE OPERATIONS
  // ========================================

  async createWordExamples(wordId: string, examples: UnifiedWordData['examples']): Promise<void> {
    if (!examples || examples.length === 0) return;

    const exampleData = examples.map((ex, index) => ({
      word_id: wordId,
      source_api: ex.source,
      example_text: ex.text,
      context: ex.context,
      is_primary: index === 0 // First example is primary
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

  // ========================================
  // TAG OPERATIONS
  // ========================================

  async createWordTags(wordId: string, tags: UnifiedWordData['tags']): Promise<void> {
    if (!tags || tags.length === 0) return;

    const tagData = tags.map(tag => ({
      word_id: wordId,
      tag_type: tag.type,
      tag_value: tag.value,
      confidence_score: tag.confidence,
      source: tag.source
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
      .eq('word_id', wordId)
      .order('confidence_score', { ascending: false });

    if (error) {
      console.error('Error fetching word tags:', error);
      return [];
    }

    return data || [];
  }

  // ========================================
  // RELATIONSHIP OPERATIONS
  // ========================================

  async createWordRelationships(wordId: string, relationships: UnifiedWordData['relationships']): Promise<void> {
    if (!relationships || relationships.length === 0) return;

    // Get or create related words first
    const relationshipPromises = relationships.map(async (rel) => {
      // Check if related word exists
      let relatedWord = await this.getWordByText(rel.related_word);
      
      if (!relatedWord) {
        // Fetch data for related word
        const relatedWordData = await apiAggregator.getWordData(rel.related_word);
        relatedWord = await this.createWordEntry(relatedWordData);
      }

      return {
        from_word_id: wordId,
        to_word_id: relatedWord.id,
        relationship_type: rel.type,
        strength_score: rel.strength,
        source: rel.source
      };
    });

    const relationshipData = await Promise.all(relationshipPromises);

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
      .eq('from_word_id', wordId)
      .order('strength_score', { ascending: false });

    if (error) {
      console.error('Error fetching word relationships:', error);
      return [];
    }

    return data || [];
  }

  // ========================================
  // USER MASTERY OPERATIONS
  // ========================================

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
    // Get existing mastery or create new one
    let mastery = await this.getUserWordMastery(userId, wordId);
    
    if (!mastery) {
      // Create new mastery record
      const { data, error } = await supabase
        .from('user_word_mastery')
        .insert({
          user_id: userId,
          word_id: wordId,
          mastery_score: isCorrect ? 0.1 : 0.0,
          attempts_count: 1,
          correct_attempts: isCorrect ? 1 : 0,
          last_attempted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user word mastery:', error);
        throw new Error(`Failed to create user word mastery: ${error.message}`);
      }

      return data;
    }

    // Update existing mastery
    const newAttempts = mastery.attempts_count + 1;
    const newCorrectAttempts = mastery.correct_attempts + (isCorrect ? 1 : 0);
    
    // Calculate new mastery score (simple algorithm - can be improved)
    const newMasteryScore = Math.min(1.0, newCorrectAttempts / newAttempts);

    const { data, error } = await supabase
      .from('user_word_mastery')
      .update({
        mastery_score: newMasteryScore,
        attempts_count: newAttempts,
        correct_attempts: newCorrectAttempts,
        last_attempted_at: new Date().toISOString()
      })
      .eq('id', mastery.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user word mastery:', error);
      throw new Error(`Failed to update user word mastery: ${error.message}`);
    }

    return data;
  }

  // ========================================
  // SEARCH AND QUERY OPERATIONS
  // ========================================

  async searchWords(query: string, limit: number = 10): Promise<WordEntry[]> {
    const { data, error } = await supabase
      .from('word_entries')
      .select('*')
      .ilike('word_text', `%${query}%`)
      .limit(limit)
      .order('word_text');

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
      .limit(limit)
      .order('word_text');

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
      .limit(limit)
      .order('word_text');

    if (error) {
      console.error('Error fetching words by type:', error);
      return [];
    }

    return data || [];
  }

  // ========================================
  // COMPLETE WORD DATA OPERATIONS
  // ========================================

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
      definitions: definitions.map(d => ({
        text: d.definition_text,
        source: d.source_api,
        part_of_speech: d.part_of_speech,
        confidence: d.confidence_score
      })),
      examples: examples.map(e => ({
        text: e.example_text,
        source: e.source_api,
        context: e.context as any
      })),
      tags: tags.map(t => ({
        type: t.tag_type,
        value: t.tag_value,
        confidence: t.confidence_score,
        source: t.source
      })),
      relationships: relationships.map(r => ({
        related_word: '', // Would need to fetch the related word text
        type: r.relationship_type,
        strength: r.strength_score,
        source: r.source
      })),
      difficulty: {
        level: word.difficulty_level,
        score: word.difficulty_score
      },
      metadata: word.metadata
    };
  }

  // ========================================
  // BULK OPERATIONS
  // ========================================

  async addWordFromAPI(word: string): Promise<WordEntry> {
    console.log(`Adding word from API: ${word}`);
    
    // Fetch data from APIs
    const wordData = await apiAggregator.getWordData(word);
    
    // Create word entry in database
    return await this.createWordEntry(wordData);
  }

  async addWordsFromList(words: string[]): Promise<WordEntry[]> {
    console.log(`Adding ${words.length} words from list`);
    
    const results: WordEntry[] = [];
    
    for (const word of words) {
      try {
        const wordEntry = await this.addWordFromAPI(word);
        results.push(wordEntry);
        console.log(`Successfully added: ${word}`);
      } catch (error) {
        console.error(`Failed to add word ${word}:`, error);
      }
    }
    
    return results;
  }
}

// ========================================
// EXPORT SINGLETON INSTANCE
// ========================================

export const vocabularyManager = new VocabularyManager(); 