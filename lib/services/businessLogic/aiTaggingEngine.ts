// ========================================
// AI TAGGING ENGINE - ENHANCED WITH OPENAI
// ========================================

import { createClient } from '@supabase/supabase-js';
import { UnifiedWordData } from '../../types/wordMaze';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export interface DomainClassification {
  primary: string;
  secondary: string[];
  confidence: number;
  keywords: string[];
}

export interface LearningContext {
  formality: 'formal' | 'informal' | 'neutral';
  context: 'academic' | 'business' | 'casual' | 'technical' | 'literary';
  usage: 'common' | 'uncommon' | 'rare';
  register: 'high' | 'medium' | 'low';
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

export class AITaggingEngine {
  private config: AITaggingConfig;
  
  // Enhanced tag categories with visual elements
  private readonly tagCategories = {
    difficulty: ['beginner', 'intermediate', 'advanced', 'expert'],
    domain: ['academic', 'business', 'technology', 'science', 'arts', 'sports', 'food', 'travel', 'health', 'finance'],
    emotion: ['positive', 'negative', 'neutral', 'intense', 'subtle', 'joyful', 'melancholic', 'energetic', 'calm'],
    formality: ['formal', 'informal', 'casual', 'technical', 'literary'],
    frequency: ['common', 'uncommon', 'rare', 'archaic'],
    partOfSpeech: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection'],
    etymology: ['latin', 'greek', 'french', 'germanic', 'anglo-saxon', 'modern'],
    context: ['everyday', 'professional', 'academic', 'creative', 'technical'],
    theme: ['nature', 'technology', 'emotions', 'colors', 'sounds', 'movement', 'time', 'space'],
    personality: ['bold', 'gentle', 'mysterious', 'playful', 'serious', 'elegant', 'powerful', 'delicate']
  };

  // Tag styling for visual appeal
  private readonly tagStyling = {
    beginner: { color: '#10B981', emoji: '🌱' },
    intermediate: { color: '#F59E0B', emoji: '🌿' },
    advanced: { color: '#EF4444', emoji: '🌳' },
    expert: { color: '#8B5CF6', emoji: '🏆' },
    academic: { color: '#3B82F6', emoji: '📚' },
    business: { color: '#6366F1', emoji: '💼' },
    technology: { color: '#06B6D4', emoji: '💻' },
    science: { color: '#8B5CF6', emoji: '🔬' },
    arts: { color: '#EC4899', emoji: '🎨' },
    sports: { color: '#F97316', emoji: '⚽' },
    food: { color: '#84CC16', emoji: '🍕' },
    travel: { color: '#06B6D4', emoji: '✈️' },
    health: { color: '#10B981', emoji: '🏥' },
    finance: { color: '#F59E0B', emoji: '💰' },
    positive: { color: '#10B981', emoji: '😊' },
    negative: { color: '#EF4444', emoji: '😔' },
    neutral: { color: '#6B7280', emoji: '😐' },
    formal: { color: '#374151', emoji: '🎩' },
    informal: { color: '#F59E0B', emoji: '😎' },
    common: { color: '#10B981', emoji: '📈' },
    uncommon: { color: '#F59E0B', emoji: '📊' },
    rare: { color: '#EF4444', emoji: '💎' },
    nature: { color: '#059669', emoji: '🌲' },
    emotions: { color: '#EC4899', emoji: '💝' },
    colors: { color: '#8B5CF6', emoji: '🌈' },
    sounds: { color: '#06B6D4', emoji: '🎵' },
    movement: { color: '#F97316', emoji: '🏃' },
    time: { color: '#6B7280', emoji: '⏰' },
    space: { color: '#1F2937', emoji: '🌌' }
  };

  // Semantic patterns for automatic tagging
  private readonly semanticPatterns = {
    academic: ['theory', 'research', 'analysis', 'methodology', 'hypothesis', 'conclusion'],
    business: ['strategy', 'management', 'marketing', 'finance', 'operations', 'leadership'],
    technology: ['algorithm', 'software', 'hardware', 'network', 'database', 'interface'],
    science: ['experiment', 'laboratory', 'hypothesis', 'observation', 'theory', 'data'],
    arts: ['creative', 'artistic', 'aesthetic', 'composition', 'expression', 'style'],
    sports: ['athletic', 'competition', 'performance', 'training', 'championship', 'team'],
    food: ['culinary', 'cuisine', 'ingredient', 'recipe', 'flavor', 'cooking'],
    travel: ['destination', 'journey', 'adventure', 'exploration', 'tourism', 'vacation'],
    health: ['medical', 'wellness', 'treatment', 'diagnosis', 'symptoms', 'therapy'],
    finance: ['investment', 'budget', 'revenue', 'profit', 'market', 'economy']
  };

  constructor(config: AITaggingConfig) {
    this.config = config;
  }

  // ========================================
  // MAIN TAGGING METHODS - ENHANCED
  // ========================================

  async generateTags(wordData: UnifiedWordData): Promise<SemanticTag[]> {
    const tags: SemanticTag[] = [];

    // 1. Extract tags from definitions (traditional method)
    const definitionTags = this.extractTagsFromDefinitions(wordData);
    tags.push(...definitionTags);

    // 2. Analyze semantic patterns (traditional method)
    const semanticTags = this.analyzeSemanticPatterns(wordData);
    tags.push(...semanticTags);

    // 3. Classify domain (traditional method)
    const domainTags = await this.classifyDomain(wordData);
    tags.push(...domainTags);

    // 4. Analyze learning context (traditional method)
    const contextTags = this.analyzeLearningContext(wordData);
    tags.push(...contextTags);

    // 5. Determine difficulty-based tags (traditional method)
    const difficultyTags = this.analyzeDifficultyTags(wordData);
    tags.push(...difficultyTags);

    // 6. ENHANCED: OpenAI-powered tagging
    if (this.config.enableOpenAI) {
      try {
        const openAITags = await this.generateOpenAITags(wordData);
        tags.push(...openAITags);
      } catch (error) {
        console.warn('OpenAI tagging failed, falling back to traditional methods:', error);
      }
    }

    // 7. Merge and rank tags
    const mergedTags = this.mergeAndRankTags(tags);

    // 8. Filter by confidence and limit
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
            content: "You are an expert linguist and vocabulary learning specialist. Analyze words to create engaging, educational tags that help learners understand and remember vocabulary effectively."
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
  "tags": ["array of 5-8 engaging tags"],
  "categories": ["array of 2-3 main categories"],
  "difficulty": "beginner|intermediate|advanced|expert",
  "themes": ["array of 2-3 thematic elements"],
  "emotions": ["array of 2-3 emotional associations"],
  "contexts": ["array of 3-4 usage contexts"],
  "fun_facts": ["array of 1-2 interesting facts"],
  "learning_tips": ["array of 1-2 memory tips"],
  "related_words": ["array of 3-5 semantically related words"],
  "confidence": 0.85
}

Make the tags engaging, memorable, and helpful for vocabulary learning. Include creative, fun, and educational elements that make the word more interesting to learn.
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
    // Simple fallback parsing for non-JSON responses
    const lines = response.split('\n').filter(line => line.trim());
    const tags: string[] = [];
    const categories: string[] = [];
    const themes: string[] = [];
    const emotions: string[] = [];
    const contexts: string[] = [];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('tag') || lowerLine.includes('category')) {
        const words = line.split(/[,\s]+/).filter(word => word.length > 3);
        tags.push(...words.slice(0, 3));
      }
    });

    return {
      tags: tags.slice(0, 5),
      categories: categories.slice(0, 2),
      difficulty: 'intermediate',
      themes: themes.slice(0, 2),
      emotions: emotions.slice(0, 2),
      contexts: contexts.slice(0, 3),
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
      const styling = this.tagStyling[tag as keyof typeof this.tagStyling];
      tags.push({
        tag,
        confidence: result.confidence,
        source: 'openai',
        reasoning: `AI-generated tag for enhanced learning experience`,
        category: 'ai_enhanced',
        color: styling?.color,
        emoji: styling?.emoji
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
        color: styling?.color,
        emoji: styling?.emoji
      });
    }

    // Convert themes
    result.themes.forEach(theme => {
      const styling = this.tagStyling[theme as keyof typeof this.tagStyling];
      tags.push({
        tag: theme,
        confidence: result.confidence * 0.9,
        source: 'openai',
        reasoning: `AI-identified thematic element`,
        category: 'theme',
        color: styling?.color,
        emoji: styling?.emoji
      });
    });

    // Convert emotions
    result.emotions.forEach(emotion => {
      const styling = this.tagStyling[emotion as keyof typeof this.tagStyling];
      tags.push({
        tag: emotion,
        confidence: result.confidence * 0.8,
        source: 'openai',
        reasoning: `AI-detected emotional association`,
        category: 'emotion',
        color: styling?.color,
        emoji: styling?.emoji
      });
    });

    return tags;
  }

  // ========================================
  // ENHANCED MAZE UNLOCKING FEATURES
  // ========================================

  async generateMazeUnlockCriteria(wordData: UnifiedWordData): Promise<{
    unlockType: 'level' | 'theme' | 'achievement' | 'collection' | 'challenge';
    criteria: string;
    reward: string;
    difficulty: number;
  }[]> {
    const criteria: any[] = [];
    
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
            criteria.push(...parsedCriteria);
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
          difficulty: 3
        },
        {
          unlockType: 'theme',
          criteria: `Learn 5 words related to ${this.getPrimaryDomain(wordData)}`,
          reward: 'Access specialized domain vocabulary',
          difficulty: 2
        },
        {
          unlockType: 'achievement',
          criteria: 'Maintain 90% accuracy for 7 days',
          reward: 'Premium word collection access',
          difficulty: 4
        }
      );
    }

    return criteria;
  }

  private getPrimaryDomain(wordData: UnifiedWordData): string {
    const allText = wordData.definitions.map(d => d.text).join(' ').toLowerCase();
    
    for (const [domain, keywords] of Object.entries(this.semanticPatterns)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return domain;
      }
    }
    
    return 'general';
  }

  // ========================================
  // ENHANCED USER INTERACTION FEATURES
  // ========================================

  async generatePersonalizedTags(userId: string, wordData: UnifiedWordData): Promise<SemanticTag[]> {
    const tags: SemanticTag[] = [];
    
    try {
      // Get user's learning history and preferences
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
  // TRADITIONAL TAGGING METHODS (KEPT FOR FALLBACK)
  // ========================================

  private extractTagsFromDefinitions(wordData: UnifiedWordData): SemanticTag[] {
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
          color: styling?.color,
          emoji: styling?.emoji
        });
      }
    });

    // Extract domain-specific keywords
    Object.entries(this.semanticPatterns).forEach(([domain, keywords]) => {
      const matches = keywords.filter(keyword => allText.includes(keyword));
      if (matches.length > 0) {
        const styling = this.tagStyling[domain as keyof typeof this.tagStyling];
        tags.push({
          tag: domain,
          confidence: Math.min(0.8, matches.length * 0.2),
          source: 'definition',
          reasoning: `Found domain keywords: ${matches.join(', ')}`,
          category: 'domain',
          color: styling?.color,
          emoji: styling?.emoji
        });
      }
    });

    return tags;
  }

  // ========================================
  // SEMANTIC PATTERN ANALYSIS
  // ========================================

  private analyzeSemanticPatterns(wordData: UnifiedWordData): SemanticTag[] {
    const tags: SemanticTag[] = [];
    const word = wordData.word.toLowerCase();

    // Analyze word structure
    if (word.length <= 4) {
      tags.push({
        tag: 'short',
        confidence: 0.9,
        source: 'semantic',
        reasoning: 'Word is 4 characters or less'
      });
    } else if (word.length >= 10) {
      tags.push({
        tag: 'long',
        confidence: 0.9,
        source: 'semantic',
        reasoning: 'Word is 10 characters or more'
      });
    }

    // Analyze etymology patterns
    const latinPrefixes = ['pre', 'post', 'sub', 'super', 'inter', 'trans', 're', 'un', 'dis'];
    const greekPrefixes = ['phil', 'soph', 'log', 'geo', 'bio', 'psych', 'tele', 'auto'];
    
    if (latinPrefixes.some(prefix => word.startsWith(prefix))) {
      tags.push({
        tag: 'latin',
        confidence: 0.8,
        source: 'semantic',
        reasoning: 'Word has Latin prefix'
      });
    }
    
    if (greekPrefixes.some(prefix => word.startsWith(prefix))) {
      tags.push({
        tag: 'greek',
        confidence: 0.8,
        source: 'semantic',
        reasoning: 'Word has Greek prefix'
      });
    }

    // Analyze compound words
    if (word.includes('-') || word.includes('_')) {
      tags.push({
        tag: 'compound',
        confidence: 0.9,
        source: 'semantic',
        reasoning: 'Word appears to be compound'
      });
    }

    // Analyze frequency patterns
    if (this.isCommonWord(word)) {
      tags.push({
        tag: 'common',
        confidence: 0.8,
        source: 'semantic',
        reasoning: 'Word is commonly used'
      });
    } else if (this.isRareWord(word)) {
      tags.push({
        tag: 'rare',
        confidence: 0.7,
        source: 'semantic',
        reasoning: 'Word appears to be rare or specialized'
      });
    }

    return tags;
  }

  private isCommonWord(word: string): boolean {
    // Simple heuristic for common words
    const commonWords = [
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
      'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
      'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
      'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there',
      'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get',
      'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no',
      'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your',
      'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
      'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
      'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
      'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
      'give', 'day', 'most', 'us'
    ];
    
    return commonWords.includes(word);
  }

  private isRareWord(word: string): boolean {
    // Heuristic for rare words
    const rareIndicators = [
      'xen', 'zoo', 'phy', 'logy', 'ism', 'ist', 'tion', 'sion',
      'ment', 'ness', 'ful', 'less', 'able', 'ible', 'ous', 'ious'
    ];
    
    return rareIndicators.some(indicator => word.includes(indicator)) || word.length > 12;
  }

  // ========================================
  // DOMAIN CLASSIFICATION
  // ========================================

  private async classifyDomain(wordData: UnifiedWordData): Promise<SemanticTag[]> {
    const tags: SemanticTag[] = [];
    const allText = wordData.definitions.map(d => d.text).join(' ').toLowerCase();
    const examples = wordData.examples.map(e => e.text).join(' ').toLowerCase();

    // Analyze domain-specific vocabulary
    const domainScores: Record<string, number> = {};
    
    Object.entries(this.semanticPatterns).forEach(([domain, keywords]) => {
      let score = 0;
      
      // Check definitions
      keywords.forEach(keyword => {
        if (allText.includes(keyword)) score += 2;
      });
      
      // Check examples
      keywords.forEach(keyword => {
        if (examples.includes(keyword)) score += 1;
      });
      
      // Check word itself
      keywords.forEach(keyword => {
        if (wordData.word.toLowerCase().includes(keyword)) score += 3;
      });
      
      domainScores[domain] = score;
    });

    // Add top domains as tags
    const sortedDomains = Object.entries(domainScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    sortedDomains.forEach(([domain, score]) => {
      if (score > 0) {
        tags.push({
          tag: domain,
          confidence: Math.min(0.9, score * 0.2),
          source: 'domain',
          reasoning: `Domain classification score: ${score}`
        });
      }
    });

    return tags;
  }

  // ========================================
  // LEARNING CONTEXT ANALYSIS
  // ========================================

  private analyzeLearningContext(wordData: UnifiedWordData): SemanticTag[] {
    const tags: SemanticTag[] = [];
    const allText = wordData.definitions.map(d => d.text).join(' ').toLowerCase();

    // Analyze formality
    const formalWords = ['formal', 'official', 'professional', 'academic', 'scholarly'];
    const informalWords = ['casual', 'informal', 'colloquial', 'slang', 'everyday'];
    
    const formalCount = formalWords.filter(word => allText.includes(word)).length;
    const informalCount = informalWords.filter(word => allText.includes(word)).length;
    
    if (formalCount > informalCount) {
      tags.push({
        tag: 'formal',
        confidence: 0.7,
        source: 'context',
        reasoning: 'Formal language indicators present'
      });
    } else if (informalCount > formalCount) {
      tags.push({
        tag: 'informal',
        confidence: 0.7,
        source: 'context',
        reasoning: 'Informal language indicators present'
      });
    } else {
      tags.push({
        tag: 'neutral',
        confidence: 0.6,
        source: 'context',
        reasoning: 'Neutral formality level'
      });
    }

    // Analyze usage frequency
    if (this.isCommonWord(wordData.word.toLowerCase())) {
      tags.push({
        tag: 'everyday',
        confidence: 0.8,
        source: 'context',
        reasoning: 'Word is commonly used in everyday language'
      });
    } else {
      tags.push({
        tag: 'specialized',
        confidence: 0.7,
        source: 'context',
        reasoning: 'Word appears to be specialized or technical'
      });
    }

    return tags;
  }

  // ========================================
  // DIFFICULTY-BASED TAGGING
  // ========================================

  private analyzeDifficultyTags(wordData: UnifiedWordData): SemanticTag[] {
    const tags: SemanticTag[] = [];
    const difficulty = wordData.difficulty;

    if (difficulty) {
      tags.push({
        tag: difficulty.level,
        confidence: 0.9,
        source: 'frequency',
        reasoning: `Difficulty level: ${difficulty.level} (score: ${difficulty.score})`
      });
    }

    // Additional difficulty indicators
    const word = wordData.word.toLowerCase();
    
    if (word.length > 10) {
      tags.push({
        tag: 'complex',
        confidence: 0.7,
        source: 'frequency',
        reasoning: 'Long word indicates complexity'
      });
    }
    
    if (wordData.definitions.length > 2) {
      tags.push({
        tag: 'multifaceted',
        confidence: 0.8,
        source: 'frequency',
        reasoning: 'Multiple definitions indicate complex meaning'
      });
    }

    return tags;
  }

  // ========================================
  // TAG MERGING AND RANKING
  // ========================================

  private mergeAndRankTags(tags: SemanticTag[]): SemanticTag[] {
    const tagMap = new Map<string, SemanticTag>();

    tags.forEach(tag => {
      const existing = tagMap.get(tag.tag);
      if (existing) {
        // Merge tags with same name
        existing.confidence = Math.max(existing.confidence, tag.confidence);
        existing.reasoning = `${existing.reasoning}; ${tag.reasoning}`;
      } else {
        tagMap.set(tag.tag, { ...tag });
      }
    });

    // Convert back to array and sort by confidence
    return Array.from(tagMap.values())
      .sort((a, b) => b.confidence - a.confidence);
  }

  private filterTags(tags: SemanticTag[]): SemanticTag[] {
    return tags
      .filter(tag => tag.confidence >= this.config.taggingConfidence)
      .slice(0, this.config.maxTagsPerWord);
  }

  // ========================================
  // BATCH TAGGING
  // ========================================

  async batchTagWords(words: UnifiedWordData[]): Promise<Map<string, SemanticTag[]>> {
    const results = new Map<string, SemanticTag[]>();
    
    // Process words in parallel for efficiency
    const taggingPromises = words.map(async word => {
      const tags = await this.generateTags(word);
      return { word: word.word, tags };
    });

    const taggingResults = await Promise.all(taggingPromises);
    
    taggingResults.forEach(result => {
      results.set(result.word, result.tags);
    });

    return results;
  }

  // ========================================
  // TAG VALIDATION AND CLEANUP
  // ========================================

  async validateTags(tags: SemanticTag[]): Promise<SemanticTag[]> {
    const validatedTags: SemanticTag[] = [];

    for (const tag of tags) {
      // Check if tag is in our predefined categories
      const isValid = Object.values(this.tagCategories).flat().includes(tag.tag);
      
      if (isValid) {
        validatedTags.push(tag);
      } else {
        // Try to find a similar tag
        const similarTag = this.findSimilarTag(tag.tag);
        if (similarTag) {
          validatedTags.push({
            ...tag,
            tag: similarTag,
            reasoning: `${tag.reasoning} (mapped to ${similarTag})`
          });
        }
      }
    }

    return validatedTags;
  }

  private findSimilarTag(tag: string): string | null {
    // Simple similarity matching
    const tagLower = tag.toLowerCase();
    
    for (const category of Object.values(this.tagCategories)) {
      for (const validTag of category) {
        if (validTag.toLowerCase().includes(tagLower) || 
            tagLower.includes(validTag.toLowerCase())) {
          return validTag;
        }
      }
    }
    
    return null;
  }

  // ========================================
  // TAG STATISTICS AND ANALYTICS
  // ========================================

  async getTagStatistics(): Promise<Record<string, number>> {
    const { data: tags, error } = await supabase
      .from('word_tags')
      .select('tag_name');

    if (error) {
      console.error('Error fetching tag statistics:', error);
      return {};
    }

    const tagCounts: Record<string, number> = {};
    tags?.forEach(tag => {
      tagCounts[tag.tag_name] = (tagCounts[tag.tag_name] || 0) + 1;
    });

    return tagCounts;
  }

  async getPopularTags(limit: number = 20): Promise<Array<{ tag: string; count: number }>> {
    const statistics = await this.getTagStatistics();
    
    return Object.entries(statistics)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // ========================================
  // SEMANTIC SIMILARITY
  // ========================================

  async findSemanticallySimilarWords(word: string, limit: number = 10): Promise<string[]> {
    // Get tags for the input word
    const wordData = await this.getWordData(word);
    if (!wordData) return [];

    const tags = await this.generateTags(wordData);
    const tagNames = tags.map(t => t.tag);

    // Find words with similar tags
    const { data: similarWords, error } = await supabase
      .from('word_tags')
      .select('word_id, tag_name')
      .in('tag_name', tagNames);

    if (error) {
      console.error('Error finding similar words:', error);
      return [];
    }

    // Count tag overlaps
    const wordScores: Record<string, number> = {};
    similarWords?.forEach(wordTag => {
      if (wordTag.word_id !== word) {
        wordScores[wordTag.word_id] = (wordScores[wordTag.word_id] || 0) + 1;
      }
    });

    // Return top similar words
    return Object.entries(wordScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([wordId]) => wordId);
  }

  private async getWordData(word: string): Promise<UnifiedWordData | null> {
    // This would integrate with the vocabulary manager
    // For now, return null
    return null;
  }
} 