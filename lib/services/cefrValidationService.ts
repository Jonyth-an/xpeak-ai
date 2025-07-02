import { createClient } from '@supabase/supabase-js';
import { CEFRDifficultyAnalysis, CEFRValidationResult, DifficultyLevel } from '../types/wordMaze';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class CEFRValidationService {
  // CEFR level descriptions for reference
  private static readonly CEFR_LEVELS: Record<DifficultyLevel, {
    description: string;
    typicalWords: string[];
    frequencyRange: [number, number]; // Relative frequency in corpus
    complexityRange: [number, number]; // 0-100
  }> = {
    A1: {
      description: 'Basic user - Can understand and use familiar everyday expressions',
      typicalWords: ['hello', 'goodbye', 'yes', 'no', 'please', 'thank you'],
      frequencyRange: [80, 100],
      complexityRange: [0, 20]
    },
    A2: {
      description: 'Basic user - Can communicate in simple and routine tasks',
      typicalWords: ['family', 'work', 'home', 'food', 'time', 'weather'],
      frequencyRange: [60, 80],
      complexityRange: [15, 35]
    },
    B1: {
      description: 'Independent user - Can deal with most situations',
      typicalWords: ['experience', 'opinion', 'future', 'travel', 'education'],
      frequencyRange: [40, 60],
      complexityRange: [30, 50]
    },
    B2: {
      description: 'Independent user - Can interact with fluency and spontaneity',
      typicalWords: ['analysis', 'argument', 'conclusion', 'evidence', 'research'],
      frequencyRange: [25, 40],
      complexityRange: [45, 65]
    },
    C1: {
      description: 'Proficient user - Can express ideas fluently and spontaneously',
      typicalWords: ['sophisticated', 'nuanced', 'comprehensive', 'theoretical'],
      frequencyRange: [10, 25],
      complexityRange: [60, 80]
    },
    C2: {
      description: 'Proficient user - Can understand virtually everything',
      typicalWords: ['esoteric', 'arcane', 'sublime', 'transcendental'],
      frequencyRange: [0, 10],
      complexityRange: [75, 100]
    }
  };

  /**
   * Analyze word difficulty using multiple factors and assign CEFR level
   */
  async analyzeWordDifficulty(word: string): Promise<CEFRDifficultyAnalysis> {
    console.log(`[CEFR] Analyzing difficulty for word: ${word}`);

    // Get word data from multiple sources
    const [cefrValidation, wordData] = await Promise.all([
      this.validateAgainstCEFRDatabases(word),
      this.getWordCharacteristics(word)
    ]);

    // Calculate difficulty factors
    const factors = await this.calculateDifficultyFactors(word, wordData);

    // Determine CEFR level based on factors and validation
    const level = this.determineCEFRLevel(factors, cefrValidation);

    // Calculate confidence score
    const confidence = this.calculateConfidence(factors, cefrValidation);

    // Generate reasoning
    const reasoning = this.generateReasoning(word, factors, cefrValidation, level);

    return {
      level,
      confidence,
      score: this.calculateOverallScore(factors),
      factors,
      reasoning,
      sources: cefrValidation.found ? [cefrValidation.source!] : ['calculated']
    };
  }

  /**
   * Validate word against known CEFR databases
   */
  private async validateAgainstCEFRDatabases(word: string): Promise<CEFRValidationResult> {
    // Check our own database first
    const { data: existingWord } = await supabase
      .from('word_entries')
      .select('difficulty_level, difficulty_score')
      .eq('word_text', word.toLowerCase())
      .single();

    if (existingWord?.difficulty_level) {
      return {
        found: true,
        level: existingWord.difficulty_level as DifficultyLevel,
        source: 'internal_database',
        confidence: 0.8
      };
    }

    // TODO: Check external CEFR databases
    // - Cambridge English Vocabulary Profile
    // - Oxford 3000/5000
    // - British Council CEFR wordlists
    // - Eurocentres CEFR wordlists

    return {
      found: false
    };
  }

  /**
   * Get word characteristics for analysis
   */
  private async getWordCharacteristics(word: string) {
    // Get word details from our cache or API
    const { data: wordDetails } = await supabase
      .from('word_details_cache')
      .select('*')
      .eq('word', word.toLowerCase())
      .single();

    return wordDetails || null;
  }

  /**
   * Calculate difficulty factors for a word
   */
  private async calculateDifficultyFactors(word: string, wordData: any) {
    const factors = {
      frequency: 0,
      length: 0,
      complexity: 0,
      etymology: 0,
      contextDependency: 0,
      grammaticalComplexity: 0,
      register: 0
    };

    // Length factor (0-100)
    factors.length = Math.min(word.length * 5, 100);

    // Complexity factor based on word data
    if (wordData) {
      // Multiple definitions = more complex
      const definitionCount = wordData.definitions?.length || 1;
      factors.complexity = Math.min(definitionCount * 15, 100);

      // Multiple parts of speech = more complex
      const posCount = wordData.parts_of_speech?.length || 1;
      factors.grammaticalComplexity = Math.min(posCount * 20, 100);

      // Etymology complexity
      if (wordData.etymology) {
        const hasLatin = wordData.etymology.includes('Latin');
        const hasGreek = wordData.etymology.includes('Greek');
        const hasFrench = wordData.etymology.includes('French');
        factors.etymology = (hasLatin ? 30 : 0) + (hasGreek ? 25 : 0) + (hasFrench ? 15 : 0);
      }
    }

    // Context dependency (simplified - could be enhanced with AI analysis)
    factors.contextDependency = Math.min(word.length * 3, 100);

    // Register (formal/informal) - simplified
    factors.register = word.length > 8 ? 60 : 30;

    // Frequency (simplified - should use real corpus data)
    factors.frequency = Math.max(100 - word.length * 5, 10);

    return factors;
  }

  /**
   * Determine CEFR level based on factors and validation
   */
  private determineCEFRLevel(factors: any, validation: CEFRValidationResult): DifficultyLevel {
    // If we have validation data, use it as primary source
    if (validation.found && validation.level) {
      return validation.level;
    }

    // Calculate overall score
    const score = this.calculateOverallScore(factors);

    // Map score to CEFR level
    if (score >= 80) return 'A1';
    if (score >= 65) return 'A2';
    if (score >= 50) return 'B1';
    if (score >= 35) return 'B2';
    if (score >= 20) return 'C1';
    return 'C2';
  }

  /**
   * Calculate overall difficulty score
   */
  private calculateOverallScore(factors: any): number {
    const weights = {
      frequency: 0.3,
      length: 0.15,
      complexity: 0.2,
      etymology: 0.1,
      contextDependency: 0.1,
      grammaticalComplexity: 0.1,
      register: 0.05
    };

    return Object.entries(factors).reduce((score, [factor, value]) => {
      return score + (value as number) * weights[factor as keyof typeof weights];
    }, 0);
  }

  /**
   * Calculate confidence in the assigned level
   */
  private calculateConfidence(factors: any, validation: CEFRValidationResult): number {
    if (validation.found) {
      return validation.confidence || 0.8;
    }

    // Lower confidence for calculated levels
    return 0.6;
  }

  /**
   * Generate reasoning for the assigned level
   */
  private generateReasoning(word: string, factors: any, validation: CEFRValidationResult, level: DifficultyLevel): string {
    if (validation.found) {
      return `Level ${level} assigned based on ${validation.source} database.`;
    }

    const reasons = [];
    
    if (factors.length > 50) reasons.push('long word');
    if (factors.complexity > 60) reasons.push('multiple meanings');
    if (factors.etymology > 40) reasons.push('complex etymology');
    if (factors.grammaticalComplexity > 50) reasons.push('multiple parts of speech');

    return `Level ${level} calculated based on: ${reasons.join(', ')}.`;
  }

  /**
   * Get CEFR level information
   */
  static getCEFRLevelInfo(level: DifficultyLevel) {
    return this.CEFR_LEVELS[level];
  }

  /**
   * Get all CEFR levels
   */
  static getAllCEFRLevels(): DifficultyLevel[] {
    return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  }
} 