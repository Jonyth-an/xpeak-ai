// ========================================
// AI TAGGING ENGINE - ENHANCED WITH OPENAI
// ========================================

import { supabase } from '../../supabaseClient';
import { UnifiedWordData } from '../../types/wordMaze';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AITaggingConfig {
  taggingConfidence: number;
  maxTagsPerWord: number;
  semanticSimilarityThreshold: number;
  enableOpenAI: boolean;
  openAIModel: string;
  openAITemperature: number;
  openAIMaxTokens: number;
}

export interface SemanticTag {
  tag: string;
  confidence: number;
  source: 'definition' | 'context' | 'semantic' | 'frequency' | 'domain' | 'openai' | 'user';
  reasoning: string;
  category?: string;
  color?: string;
  emoji?: string;
}

export interface OpenAITaggingResult {
  tags: string[];
  categories: string[];
  difficulty: string;
  themes: string[];
  emotions: string[];
  contexts: string[];
  fun_facts: string[];
  learning_tips: string[];
  related_words: string[];
  confidence: number;
}

export interface MazeUnlockCriteria {
  unlockType: 'level' | 'theme' | 'achievement' | 'collection' | 'challenge';
  criteria: string;
  reward: string;
  difficulty: number;
  icon?: string;
  color?: string;
}

export class AITaggingEngineEnhanced {
  private config: AITaggingConfig;
  
  // Enhanced tag categories with visual elements
  private readonly tagStyling = {
    // Difficulty levels
    beginner: { color: '#10B981', emoji: '🌱', category: 'difficulty' },
    intermediate: { color: '#F59E0B', emoji: '🌿', category: 'difficulty' },
    advanced: { color: '#EF4444', emoji: '🌳', category: 'difficulty' },
    expert: { color: '#8B5CF6', emoji: '🏆', category: 'difficulty' },
    
    // Domains
    academic: { color: '#3B82F6', emoji: '📚', category: 'domain' },
    business: { color: '#6366F1', emoji: '💼', category: 'domain' },
    technology: { color: '#06B6D4', emoji: '💻', category: 'domain' },
    science: { color: '#8B5CF6', emoji: '🔬', category: 'domain' },
    arts: { color: '#EC4899', emoji: '🎨', category: 'domain' },
    sports: { color: '#F97316', emoji: '⚽', category: 'domain' },
    food: { color: '#84CC16', emoji: '🍕', category: 'domain' },
    travel: { color: '#06B6D4', emoji: '✈️', category: 'domain' },
    health: { color: '#10B981', emoji: '🏥', category: 'domain' },
    finance: { color: '#F59E0B', emoji: '💰', category: 'domain' },
    
    // Emotions
    positive: { color: '#10B981', emoji: '😊', category: 'emotion' },
    negative: { color: '#EF4444', emoji: '😔', category: 'emotion' },
    neutral: { color: '#6B7280', emoji: '😐', category: 'emotion' },
    joyful: { color: '#F59E0B', emoji: '😄', category: 'emotion' },
    melancholic: { color: '#8B5CF6', emoji: '😢', category: 'emotion' },
    energetic: { color: '#EF4444', emoji: '⚡', category: 'emotion' },
    calm: { color: '#06B6D4', emoji: '😌', category: 'emotion' },
    
    // Formality
    formal: { color: '#374151', emoji: '🎩', category: 'formality' },
    informal: { color: '#F59E0B', emoji: '😎', category: 'formality' },
    casual: { color: '#10B981', emoji: '👕', category: 'formality' },
    technical: { color: '#6366F1', emoji: '🔧', category: 'formality' },
    literary: { color: '#EC4899', emoji: '📖', category: 'formality' },
    
    // Frequency
    common: { color: '#10B981', emoji: '📈', category: 'frequency' },
    uncommon: { color: '#F59E0B', emoji: '📊', category: 'frequency' },
    rare: { color: '#EF4444', emoji: '💎', category: 'frequency' },
    archaic: { color: '#6B7280', emoji: '🏛️', category: 'frequency' },
    
    // Themes
    nature: { color: '#059669', emoji: '🌲', category: 'theme' },
    emotions: { color: '#EC4899', emoji: '💝', category: 'theme' },
    colors: { color: '#8B5CF6', emoji: '🌈', category: 'theme' },
    sounds: { color: '#06B6D4', emoji: '🎵', category: 'theme' },
    movement: { color: '#F97316', emoji: '🏃', category: 'theme' },
    time: { color: '#6B7280', emoji: '⏰', category: 'theme' },
    space: { color: '#1F2937', emoji: '🌌', category: 'theme' },
    
    // Personality
    bold: { color: '#EF4444', emoji: '💪', category: 'personality' },
    gentle: { color: '#10B981', emoji: '🕊️', category: 'personality' },
    mysterious: { color: '#8B5CF6', emoji: '🔮', category: 'personality' },
    playful: { color: '#F59E0B', emoji: '🎮', category: 'personality' },
    serious: { color: '#374151', emoji: '🎭', category: 'personality' },
    elegant: { color: '#EC4899', emoji: '👑', category: 'personality' },
    powerful: { color: '#EF4444', emoji: '⚡', category: 'personality' },
    delicate: { color: '#F472B6', emoji: '🌸', category: 'personality' }
  };

  constructor(config: AITaggingConfig) {
    this.config = config;
  }

  // ========================================
  // MAIN TAGGING METHODS - ENHANCED
  // ========================================

  async generateTags(wordData: UnifiedWordData): Promise<SemanticTag[]> {
    const tags: SemanticTag[] = [];

    // 1. Traditional tagging methods
    const traditionalTags = this.generateTraditionalTags(wordData);
    tags.push(...traditionalTags);

    // 2. OpenAI-enhanced tagging
    if (this.config.enableOpenAI) {
      try {
        const openAITags = await this.generateOpenAITags(wordData);
        tags.push(...openAITags);
      } catch (error) {
        console.warn('OpenAI tagging failed, using traditional methods only:', error);
      }
    }

    // 3. Merge and rank tags
    const mergedTags = this.mergeAndRankTags(tags);

    // 4. Filter by confidence and limit
    return this.filterTags(mergedTags);
  }

  // ========================================
  // OPENAI-ENHANCED TAGGING
  // ========================================

  private async generateOpenAITags(wordData: UnifiedWordData): Promise<SemanticTag[]> {
    const tags: SemanticTag[] = [];
    
    try {
      const prompt = this.createOpenAITaggingPrompt(wordData);
      
      const completion = await openai.chat.completions.create({
        model: this.config.openAIModel,
        temperature: this.config.openAITemperature,
        max_tokens: this.config.openAIMaxTokens,
        messages: [
          {
            role: "system",
            content: "You are an expert linguist and vocabulary learning specialist. Analyze words to create engaging, educational tags that help learners understand and remember vocabulary effectively. Focus on making learning fun and memorable."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const openAIResult = this.parseOpenAIResponse(response);
        tags.push(...this.convertOpenAIResultToTags(openAIResult, wordData.word));
      }
    } catch (error) {
      console.error('OpenAI tagging error:', error);
    }

    return tags;
  }

  private createOpenAITaggingPrompt(wordData: UnifiedWordData): string {
    const definitions = wordData.definitions.map(d => d.text).join('; ');
    const examples = wordData.examples?.slice(0, 3).map(e => e.text).join('; ') || '';
    
    return `
Analyze the word "${wordData.word}" with the following information:

Definitions: ${definitions}
Examples: ${examples}
Part of Speech: ${wordData.definitions[0]?.part_of_speech || 'unknown'}

Please provide a JSON response with the following structure:
{
  "tags": ["array of 5-8 engaging, memorable tags"],
  "categories": ["array of 2-3 main categories"],
  "difficulty": "beginner|intermediate|advanced|expert",
  "themes": ["array of 2-3 thematic elements"],
  "emotions": ["array of 2-3 emotional associations"],
  "contexts": ["array of 3-4 usage contexts"],
  "fun_facts": ["array of 1-2 interesting facts about the word"],
  "learning_tips": ["array of 1-2 memory tips"],
  "related_words": ["array of 3-5 semantically related words"],
  "confidence": 0.85
}

Make the tags creative, fun, and educational. Include elements that make the word more interesting and easier to remember. Think about visual associations, emotional connections, and memorable characteristics.
    `.trim();
  }

  private parseOpenAIResponse(response: string): OpenAITaggingResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing if JSON extraction fails
      return this.fallbackParseOpenAIResponse(response);
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return this.createDefaultOpenAIResult();
    }
  }

  private fallbackParseOpenAIResponse(response: string): OpenAITaggingResult {
    const lines = response.split('\n').filter(line => line.trim());
    const tags: string[] = [];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('tag') || lowerLine.includes('category')) {
        const words = line.split(/[,\s]+/).filter(word => word.length > 3);
        tags.push(...words.slice(0, 3));
      }
    });

    return {
      tags: tags.slice(0, 5),
      categories: ['general'],
      difficulty: 'intermediate',
      themes: ['general'],
      emotions: ['neutral'],
      contexts: ['general'],
      fun_facts: [],
      learning_tips: [],
      related_words: [],
      confidence: 0.7
    };
  }

  private createDefaultOpenAIResult(): OpenAITaggingResult {
    return {
      tags: [],
      categories: [],
      difficulty: 'intermediate',
      themes: [],
      emotions: [],
      contexts: [],
      fun_facts: [],
      learning_tips: [],
      related_words: [],
      confidence: 0.5
    };
  }

  private convertOpenAIResultToTags(result: OpenAITaggingResult, word: string): SemanticTag[] {
    const tags: SemanticTag[] = [];

    // Convert tags
    result.tags.forEach(tag => {
      const styling = this.tagStyling[tag.toLowerCase() as keyof typeof this.tagStyling];
      tags.push({
        tag,
        confidence: result.confidence,
        source: 'openai',
        reasoning: `AI-generated tag for enhanced learning experience`,
        category: styling?.category || 'ai_enhanced',
        color: styling?.color || '#8B5CF6',
        emoji: styling?.emoji || '🤖'
      });
    });

    // Convert difficulty
    if (result.difficulty) {
      const styling = this.tagStyling[result.difficulty as keyof typeof this.tagStyling];
      tags.push({
        tag: result.difficulty,
        confidence: result.confidence,
        source: 'openai',
        reasoning: `AI-assessed difficulty level`,
        category: 'difficulty',
        color: styling?.color || '#F59E0B',
        emoji: styling?.emoji || '📊'
      });
    }

    // Convert themes
    result.themes.forEach(theme => {
      const styling = this.tagStyling[theme.toLowerCase() as keyof typeof this.tagStyling];
      tags.push({
        tag: theme,
        confidence: result.confidence * 0.9,
        source: 'openai',
        reasoning: `AI-identified thematic element`,
        category: 'theme',
        color: styling?.color || '#06B6D4',
        emoji: styling?.emoji || '🎯'
      });
    });

    // Convert emotions
    result.emotions.forEach(emotion => {
      const styling = this.tagStyling[emotion.toLowerCase() as keyof typeof this.tagStyling];
      tags.push({
        tag: emotion,
        confidence: result.confidence * 0.8,
        source: 'openai',
        reasoning: `AI-detected emotional association`,
        category: 'emotion',
        color: styling?.color || '#EC4899',
        emoji: styling?.emoji || '💝'
      });
    });

    return tags;
  }

  // ========================================
  // MAZE UNLOCKING FEATURES
  // ========================================

  async generateMazeUnlockCriteria(wordData: UnifiedWordData): Promise<MazeUnlockCriteria[]> {
    const criteria: MazeUnlockCriteria[] = [];
    
    if (this.config.enableOpenAI) {
      try {
        const prompt = `
Generate 3 engaging unlock criteria for the word "${wordData.word}" in a vocabulary learning maze game.

Consider:
- Learning milestones (mastering certain word types)
- Thematic collections (words about nature, emotions, etc.)
- Achievement-based unlocks (learning streak, accuracy)
- Challenge-based unlocks (difficult words, time pressure)

Return as JSON array:
[
  {
    "unlockType": "level|theme|achievement|collection|challenge",
    "criteria": "description of what unlocks this",
    "reward": "what the user gets",
    "difficulty": 1-5
  }
]
        `.trim();

        const completion = await openai.chat.completions.create({
          model: this.config.openAIModel,
          temperature: 0.8,
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: "You are a game designer creating engaging unlock mechanics for a vocabulary learning game."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        });

        const response = completion.choices[0]?.message?.content;
        if (response) {
          const jsonMatch = response.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedCriteria = JSON.parse(jsonMatch[0]);
            criteria.push(...parsedCriteria.map((c: any) => ({
              ...c,
              icon: this.getUnlockIcon(c.unlockType),
              color: this.getUnlockColor(c.unlockType)
            })));
          }
        }
      } catch (error) {
        console.error('OpenAI maze unlock generation error:', error);
      }
    }

    // Fallback criteria if OpenAI fails
    if (criteria.length === 0) {
      criteria.push(
        {
          unlockType: 'level',
          criteria: `Master 10 ${wordData.definitions[0]?.part_of_speech || 'words'} of similar difficulty`,
          reward: 'Unlock advanced vocabulary section',
          difficulty: 3,
          icon: '🎯',
          color: '#3B82F6'
        },
        {
          unlockType: 'theme',
          criteria: `Learn 5 words related to ${this.getPrimaryDomain(wordData)}`,
          reward: 'Access specialized domain vocabulary',
          difficulty: 2,
          icon: '🎨',
          color: '#EC4899'
        },
        {
          unlockType: 'achievement',
          criteria: 'Maintain 90% accuracy for 7 days',
          reward: 'Premium word collection access',
          difficulty: 4,
          icon: '🏆',
          color: '#F59E0B'
        }
      );
    }

    return criteria;
  }

  private getUnlockIcon(unlockType: string): string {
    const icons = {
      level: '🎯',
      theme: '🎨',
      achievement: '🏆',
      collection: '📚',
      challenge: '⚡'
    };
    return icons[unlockType as keyof typeof icons] || '🔓';
  }

  private getUnlockColor(unlockType: string): string {
    const colors = {
      level: '#3B82F6',
      theme: '#EC4899',
      achievement: '#F59E0B',
      collection: '#10B981',
      challenge: '#EF4444'
    };
    return colors[unlockType as keyof typeof colors] || '#6B7280';
  }

  private getPrimaryDomain(wordData: UnifiedWordData): string {
    const allText = wordData.definitions.map(d => d.text).join(' ').toLowerCase();
    
    const semanticPatterns = {
      academic: ['theory', 'research', 'analysis', 'methodology'],
      business: ['strategy', 'management', 'marketing', 'finance'],
      technology: ['algorithm', 'software', 'hardware', 'network'],
      science: ['experiment', 'laboratory', 'hypothesis', 'observation'],
      arts: ['creative', 'artistic', 'aesthetic', 'composition'],
      sports: ['athletic', 'competition', 'performance', 'training'],
      food: ['culinary', 'cuisine', 'ingredient', 'recipe'],
      travel: ['destination', 'journey', 'adventure', 'exploration'],
      health: ['medical', 'wellness', 'treatment', 'diagnosis'],
      finance: ['investment', 'budget', 'revenue', 'profit']
    };
    
    for (const [domain, keywords] of Object.entries(semanticPatterns)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return domain;
      }
    }
    
    return 'general';
  }

  // ========================================
  // PERSONALIZED LEARNING FEATURES
  // ========================================

  async generatePersonalizedTags(userId: string, wordData: UnifiedWordData): Promise<SemanticTag[]> {
    const tags: SemanticTag[] = [];
    
    try {
      const userPreferences = await this.getUserLearningPreferences(userId);
      
      if (this.config.enableOpenAI) {
        const prompt = `
Generate personalized tags for user learning "${wordData.word}".

User Profile:
- Learning Level: ${userPreferences.level}
- Preferred Domains: ${userPreferences.domains.join(', ')}
- Learning Style: ${userPreferences.learningStyle}
- Interests: ${userPreferences.interests.join(', ')}

Word: ${wordData.word}
Definitions: ${wordData.definitions.map(d => d.text).join('; ')}

Create 3-5 personalized tags that connect this word to the user's interests and learning style.
        `.trim();

        const completion = await openai.chat.completions.create({
          model: this.config.openAIModel,
          temperature: 0.7,
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content: "You are a personalized learning assistant creating custom tags for vocabulary learning."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        });

        const response = completion.choices[0]?.message?.content;
        if (response) {
          const personalizedTags = response.split('\n').filter(line => line.trim()).slice(0, 5);
          personalizedTags.forEach(tag => {
            tags.push({
              tag: tag.trim(),
              confidence: 0.8,
              source: 'user',
              reasoning: 'Personalized based on user preferences',
              category: 'personalized',
              color: '#8B5CF6',
              emoji: '🎯'
            });
          });
        }
      }
    } catch (error) {
      console.error('Personalized tagging error:', error);
    }

    return tags;
  }

  private async getUserLearningPreferences(userId: string): Promise<{
    level: string;
    domains: string[];
    learningStyle: string;
    interests: string[];
  }> {
    try {
      const { data, error } = await supabase
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
  // TRADITIONAL TAGGING METHODS
  // ========================================

  private generateTraditionalTags(wordData: UnifiedWordData): SemanticTag[] {
    const tags: SemanticTag[] = [];
    const allText = wordData.definitions.map(d => d.text).join(' ').toLowerCase();

    // Extract part of speech
    wordData.definitions.forEach(def => {
      if (def.part_of_speech) {
        const styling = this.tagStyling[def.part_of_speech as keyof typeof this.tagStyling];
        tags.push({
          tag: def.part_of_speech,
          confidence: 0.9,
          source: 'definition',
          reasoning: `Part of speech identified as ${def.part_of_speech}`,
          category: 'grammar',
          color: styling?.color || '#6B7280',
          emoji: styling?.emoji || '📝'
        });
      }
    });

    // Extract domain-specific keywords
    const semanticPatterns = {
      academic: ['theory', 'research', 'analysis', 'methodology'],
      business: ['strategy', 'management', 'marketing', 'finance'],
      technology: ['algorithm', 'software', 'hardware', 'network'],
      science: ['experiment', 'laboratory', 'hypothesis', 'observation'],
      arts: ['creative', 'artistic', 'aesthetic', 'composition'],
      sports: ['athletic', 'competition', 'performance', 'training'],
      food: ['culinary', 'cuisine', 'ingredient', 'recipe'],
      travel: ['destination', 'journey', 'adventure', 'exploration'],
      health: ['medical', 'wellness', 'treatment', 'diagnosis'],
      finance: ['investment', 'budget', 'revenue', 'profit']
    };

    Object.entries(semanticPatterns).forEach(([domain, keywords]) => {
      const matches = keywords.filter(keyword => allText.includes(keyword));
      if (matches.length > 0) {
        const styling = this.tagStyling[domain as keyof typeof this.tagStyling];
        tags.push({
          tag: domain,
          confidence: Math.min(0.8, matches.length * 0.2),
          source: 'definition',
          reasoning: `Found domain keywords: ${matches.join(', ')}`,
          category: 'domain',
          color: styling?.color || '#6B7280',
          emoji: styling?.emoji || '🏷️'
        });
      }
    });

    return tags;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private mergeAndRankTags(tags: SemanticTag[]): SemanticTag[] {
    const tagMap = new Map<string, SemanticTag>();

    tags.forEach(tag => {
      const existing = tagMap.get(tag.tag);
      if (existing) {
        // Merge tags with same name, keep highest confidence
        existing.confidence = Math.max(existing.confidence, tag.confidence);
        existing.reasoning = `${existing.reasoning}; ${tag.reasoning}`;
      } else {
        tagMap.set(tag.tag, { ...tag });
      }
    });

    return Array.from(tagMap.values())
      .sort((a, b) => b.confidence - a.confidence);
  }

  private filterTags(tags: SemanticTag[]): SemanticTag[] {
    return tags
      .filter(tag => tag.confidence >= this.config.taggingConfidence)
      .slice(0, this.config.maxTagsPerWord);
  }

  // ========================================
  // PUBLIC API METHODS
  // ========================================

  async batchTagWords(words: UnifiedWordData[]): Promise<Map<string, SemanticTag[]>> {
    const results = new Map<string, SemanticTag[]>();
    
    for (const wordData of words) {
      const tags = await this.generateTags(wordData);
      results.set(wordData.word, tags);
    }
    
    return results;
  }

  async getTagStatistics(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('word_tags')
        .select('tag, count');

      if (error) {
        console.error('Error fetching tag statistics:', error);
        return {};
      }

      const stats: Record<string, number> = {};
      data?.forEach(row => {
        stats[row.tag] = row.count;
      });

      return stats;
    } catch (error) {
      console.error('Error getting tag statistics:', error);
      return {};
    }
  }

  async getPopularTags(limit: number = 20): Promise<Array<{ tag: string; count: number; color?: string; emoji?: string }>> {
    try {
      const { data, error } = await supabase
        .from('word_tags')
        .select('tag, count')
        .order('count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular tags:', error);
        return [];
      }

      return data?.map(row => {
        const styling = this.tagStyling[row.tag.toLowerCase() as keyof typeof this.tagStyling];
        return {
          tag: row.tag,
          count: row.count,
          color: styling?.color,
          emoji: styling?.emoji
        };
      }) || [];
    } catch (error) {
      console.error('Error getting popular tags:', error);
      return [];
    }
  }
} 