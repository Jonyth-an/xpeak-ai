import { UnifiedWordData } from '../types/wordMaze';

// ========================================
// OPENAI-BASED WORD SERVICE
// ========================================

export class APIAggregator {
  private wordCache = new Map<string, { data: UnifiedWordData; expires: number }>();
  private NEGATIVE_CACHE_TTL = 60 * 60 * 1000; // 1 hour for not found
  private POSITIVE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for found

  async getWordData(word: string, userEmail: string = 'unknown'): Promise<UnifiedWordData> {
    const cacheKey = word.toLowerCase().trim();
    
    // Check cache first
    const cached = this.wordCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      console.log(`Cache hit for word: ${word}`);
      return cached.data;
    }

    console.log(`Generating AI content for word: ${word}`);

    try {
      // Generate word data using OpenAI
      const wordData = await this.generateWordDataWithAI(word);
      
      // Cache the result
      this.wordCache.set(cacheKey, {
        data: wordData,
        expires: Date.now() + this.POSITIVE_CACHE_TTL
      });

      return wordData;
    } catch (error) {
      console.error(`Error generating word data for "${word}":`, error);
      
      // Return fallback data if AI generation fails
      return this.createFallbackWordData(word);
    }
  }

  private async generateWordDataWithAI(word: string): Promise<UnifiedWordData> {
    const prompt = `Generate comprehensive information for the word "${word}". Return a JSON object with the following structure:

{
  "definitions": [
    {
      "text": "Clear, concise definition",
      "source": "ai",
      "confidence": 0.9
    }
  ],
  "examples": [
    {
      "text": "Example sentence using the word",
      "source": "ai",
      "context": "formal"
    }
  ],
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "usage_tip": "Helpful tip for using this word correctly",
  "difficulty_level": "beginner|intermediate|advanced",
  "difficulty_score": 0.0-1.0,
  "tags": [
    {
      "type": "part_of_speech",
      "value": "noun|verb|adjective|adverb",
      "confidence": 0.9,
      "source": "ai"
    },
    {
      "type": "formality",
      "value": "formal|informal|casual",
      "confidence": 0.8,
      "source": "ai"
    }
  ]
}

Make the content educational, accurate, and suitable for language learners. Keep definitions clear and examples practical.`;

    try {
      const response = await fetch('/api/word-maze/generate-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, prompt })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const aiResponse = await response.json();
      
             // Parse the AI response and create unified word data
       return {
         word: word.toLowerCase(),
         type: 'word',
         definitions: aiResponse.definitions || [{
           text: `A word or term: ${word}`,
           source: 'ai',
           confidence: 0.5
         }],
         examples: aiResponse.examples || [],
         tags: aiResponse.tags || [],
         relationships: [], // Could be enhanced later
         difficulty: {
           level: aiResponse.difficulty_level || 'intermediate',
           score: aiResponse.difficulty_score || 0.5
         },
         metadata: {
           generated_by: 'openai',
           generated_at: new Date().toISOString(),
           synonyms: aiResponse.synonyms || [],
           usage_tip: aiResponse.usage_tip || ''
         }
       };
    } catch (error) {
      console.error('OpenAI generation failed:', error);
      throw error;
    }
  }

     private createFallbackWordData(word: string): UnifiedWordData {
     return {
       word: word.toLowerCase(),
       type: 'word',
       definitions: [{
         text: `A word or term: ${word}`,
         source: 'fallback',
         confidence: 0.1
       }],
       examples: [],
       tags: [{
         type: 'part_of_speech',
         value: 'unknown',
         confidence: 0.1,
         source: 'fallback'
       }],
       relationships: [],
       difficulty: {
         level: 'intermediate',
         score: 0.5
       },
       metadata: {
         generated_by: 'fallback',
         generated_at: new Date().toISOString()
       }
     };
   }

  async wordExists(word: string): Promise<boolean> {
    // For now, assume all words exist since we can generate content for any word
    return true;
  }

  async getRelatedWords(word: string): Promise<string[]> {
    // This could be enhanced later with AI-generated related words
    return [];
  }
}

// ========================================
// EXPORT SINGLETON INSTANCE
// ========================================

export const apiAggregator = new APIAggregator(); 