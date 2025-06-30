import { 
  UnifiedWordData, 
  OxfordAPIResponse, 
  WordnikAPIResponse, 
  UrbanDictionaryAPIResponse,
  APISource,
  APIConfig 
} from '../types/wordMaze';

// ========================================
// API CONFIGURATION
// ========================================

const API_CONFIG: APIConfig = {
  oxford: {
    app_id: process.env.OXFORD_APP_ID || '',
    app_key: process.env.OXFORD_APP_KEY || '',
    base_url: 'https://od-api.oxforddictionaries.com/api/v2'
  },
  wordnik: {
    api_key: process.env.WORDNIK_API_KEY || '',
    base_url: 'https://api.wordnik.com/v4'
  },
  urban: {
    base_url: 'https://api.urbandictionary.com/v0',
    rate_limit: 1000 // requests per hour
  },
  twinword: {
    api_key: process.env.TWINWORD_API_KEY || '',
    base_url: 'https://api.twinword.com/api'
  }
};

// ========================================
// CACHE MANAGEMENT
// ========================================

class CacheManager {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, ttlSeconds: number = 3600): void {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expires });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cacheManager = new CacheManager();

// ========================================
// API CLIENT CLASSES
// ========================================

class OxfordAPIClient {
  private config = API_CONFIG.oxford;

  async getWordData(word: string): Promise<OxfordAPIResponse | null> {
    const cacheKey = `oxford:${word.toLowerCase()}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.config.base_url}/entries/en/${word.toLowerCase()}`,
        {
          headers: {
            'app_id': this.config.app_id,
            'app_key': this.config.app_key
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Oxford API error: ${response.status}`);
      }

      const data = await response.json();
      cacheManager.set(cacheKey, data, 86400); // Cache for 24 hours
      return data;
    } catch (error) {
      console.error('Oxford API error:', error);
      return null;
    }
  }

  parseResponse(data: OxfordAPIResponse): Partial<UnifiedWordData> {
    const result: Partial<UnifiedWordData> = {
      definitions: [],
      examples: [],
      tags: []
    };

    if (!data.results || data.results.length === 0) return result;

    const lexicalEntry = data.results[0].lexicalEntries?.[0];
    if (!lexicalEntry) return result;

    // Extract definitions
    lexicalEntry.entries?.forEach(entry => {
      entry.senses?.forEach(sense => {
        if (sense.definitions) {
          sense.definitions.forEach(def => {
            result.definitions!.push({
              text: def,
              source: 'oxford',
              confidence: 0.9
            });
          });
        }
        if (sense.examples) {
          sense.examples.forEach(ex => {
            result.examples!.push({
              text: ex.text,
              source: 'oxford',
              context: 'formal'
            });
          });
        }
      });
    });

    // Extract part of speech
    if (lexicalEntry.lexicalCategory) {
      result.tags!.push({
        type: 'usage',
        value: lexicalEntry.lexicalCategory.text.toLowerCase(),
        confidence: 0.95,
        source: 'oxford'
      });
    }

    return result;
  }
}

class WordnikAPIClient {
  private config = API_CONFIG.wordnik;

  async getWordData(word: string): Promise<WordnikAPIResponse | null> {
    const cacheKey = `wordnik:${word.toLowerCase()}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.config.base_url}/word.json/${word.toLowerCase()}/definitions?limit=5&includeRelated=true&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=${this.config.api_key}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Wordnik API error: ${response.status}`);
      }

      const data = await response.json();
      cacheManager.set(cacheKey, data, 3600); // Cache for 1 hour
      return data;
    } catch (error) {
      console.error('Wordnik API error:', error);
      return null;
    }
  }

  parseResponse(data: WordnikAPIResponse): Partial<UnifiedWordData> {
    const result: Partial<UnifiedWordData> = {
      definitions: [],
      examples: [],
      tags: []
    };

    // Wordnik returns an array of definition objects
    (Array.isArray(data) ? data : []).forEach(def => {
      if (def.text) {
        result.definitions!.push({
          text: def.text,
          source: 'wordnik',
          part_of_speech: def.partOfSpeech,
          confidence: 0.8
        });
      }
      // Optionally, add more parsing for examples, etc. if available
    });

    // Note: Wordnik's /definitions endpoint does not return examples or frequency directly
    // If you want examples, you need to call the /examples endpoint separately

    return result;
  }
}

class UrbanDictionaryAPIClient {
  private config = API_CONFIG.urban;

  async getWordData(word: string): Promise<UrbanDictionaryAPIResponse | null> {
    const cacheKey = `urban:${word.toLowerCase()}`;
    const cached = cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${this.config.base_url}/define?term=${encodeURIComponent(word)}`
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Urban Dictionary API error: ${response.status}`);
      }

      const data = await response.json();
      cacheManager.set(cacheKey, data, 1800); // Cache for 30 minutes
      return data;
    } catch (error) {
      console.error('Urban Dictionary API error:', error);
      return null;
    }
  }

  parseResponse(data: UrbanDictionaryAPIResponse): Partial<UnifiedWordData> {
    const result: Partial<UnifiedWordData> = {
      definitions: [],
      examples: [],
      tags: []
    };

    if (!data.list || data.list.length === 0) return result;

    // Get the top definition (most thumbs up)
    const topDefinition = data.list.reduce((prev, current) => 
      (prev.thumbs_up > current.thumbs_up) ? prev : current
    );

    result.definitions!.push({
      text: topDefinition.definition,
      source: 'urban',
      confidence: 0.7
    });

    if (topDefinition.example) {
      result.examples!.push({
        text: topDefinition.example,
        source: 'urban',
        context: 'casual'
      });
    }

    // Tag as slang
    result.tags!.push({
      type: 'usage',
      value: 'slang',
      confidence: 0.9,
      source: 'urban'
    });

    return result;
  }
}

// Free Dictionary API Client
class FreeDictionaryAPIClient {
  private baseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';

  async getWordData(word: string): Promise<Partial<UnifiedWordData> | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(word)}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Free Dictionary API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      console.error('Free Dictionary API error:', error);
      return null;
    }
  }

  parseResponse(data: any[]): Partial<UnifiedWordData> {
    const result: Partial<UnifiedWordData> = {
      definitions: [],
      examples: [],
      tags: []
    };

    if (!Array.isArray(data) || data.length === 0) {
      return result;
    }

    // Process each entry (word can have multiple entries)
    data.forEach(entry => {
      if (entry.meanings && Array.isArray(entry.meanings)) {
        entry.meanings.forEach((meaning: any) => {
          // Add part of speech as a tag
          if (meaning.partOfSpeech) {
            result.tags!.push({
              type: 'usage',
              value: meaning.partOfSpeech,
              confidence: 0.9,
              source: 'free_dictionary'
            });
          }

          // Process definitions
          if (meaning.definitions && Array.isArray(meaning.definitions)) {
            meaning.definitions.forEach((def: any) => {
              if (def.definition) {
                result.definitions!.push({
                  text: def.definition,
                  source: 'free_dictionary',
                  part_of_speech: meaning.partOfSpeech,
                  confidence: 0.8
                });
              }

              // Add examples
              if (def.example) {
                result.examples!.push({
                  text: def.example,
                  source: 'free_dictionary',
                  context: 'formal'
                });
              }
            });
          }

          // Process examples from the meaning level
          if (meaning.examples && Array.isArray(meaning.examples)) {
            meaning.examples.forEach((example: string) => {
              result.examples!.push({
                text: example,
                source: 'free_dictionary',
                context: 'formal'
              });
            });
          }
        });
      }
    });

    return result;
  }
}

// WordNet API Client
class WordNetAPIClient {
  private baseUrl = 'https://api.datamuse.com/words';

  async getWordData(word: string): Promise<Partial<UnifiedWordData> | null> {
    try {
      // Get synonyms (similar meaning)
      const synonymsResponse = await fetch(
        `${this.baseUrl}?rel_syn=${encodeURIComponent(word)}&max=10`
      );
      
      // Get antonyms (opposite meaning)
      const antonymsResponse = await fetch(
        `${this.baseUrl}?rel_ant=${encodeURIComponent(word)}&max=10`
      );

      // Get hypernyms (more general terms)
      const hypernymsResponse = await fetch(
        `${this.baseUrl}?rel_spc=${encodeURIComponent(word)}&max=10`
      );

      // Get hyponyms (more specific terms)
      const hyponymsResponse = await fetch(
        `${this.baseUrl}?rel_gen=${encodeURIComponent(word)}&max=10`
      );

      if (!synonymsResponse.ok && !antonymsResponse.ok && 
          !hypernymsResponse.ok && !hyponymsResponse.ok) {
        return null;
      }

      const [synonyms, antonyms, hypernyms, hyponyms] = await Promise.all([
        synonymsResponse.json(),
        antonymsResponse.json(),
        hypernymsResponse.json(),
        hyponymsResponse.json()
      ]);

      return this.parseResponse({ synonyms, antonyms, hypernyms, hyponyms });
    } catch (error) {
      console.error('WordNet API error:', error);
      return null;
    }
  }

  parseResponse(data: any): Partial<UnifiedWordData> {
    const result: Partial<UnifiedWordData> = {
      definitions: [],
      examples: [],
      tags: []
    };

    // Add semantic relationships as tags
    if (data.synonyms && Array.isArray(data.synonyms)) {
      data.synonyms.forEach((item: any) => {
        result.tags!.push({
          type: 'semantic',
          value: `synonym:${item.word}`,
          confidence: item.score ? item.score / 1000 : 0.8,
          source: 'wordnet'
        });
      });
    }

    if (data.antonyms && Array.isArray(data.antonyms)) {
      data.antonyms.forEach((item: any) => {
        result.tags!.push({
          type: 'semantic',
          value: `antonym:${item.word}`,
          confidence: item.score ? item.score / 1000 : 0.8,
          source: 'wordnet'
        });
      });
    }

    if (data.hypernyms && Array.isArray(data.hypernyms)) {
      data.hypernyms.forEach((item: any) => {
        result.tags!.push({
          type: 'semantic',
          value: `hypernym:${item.word}`,
          confidence: item.score ? item.score / 1000 : 0.8,
          source: 'wordnet'
        });
      });
    }

    if (data.hyponyms && Array.isArray(data.hyponyms)) {
      data.hyponyms.forEach((item: any) => {
        result.tags!.push({
          type: 'semantic',
          value: `hyponym:${item.word}`,
          confidence: item.score ? item.score / 1000 : 0.8,
          source: 'wordnet'
        });
      });
    }

    return result;
  }
}

// Datamuse API Client
class DatamuseAPIClient {
  private baseUrl = 'https://api.datamuse.com/words';

  async getWordData(word: string): Promise<Partial<UnifiedWordData> | null> {
    try {
      // Get synonyms (similar meaning)
      const synonymsResponse = await fetch(
        `${this.baseUrl}?rel_syn=${encodeURIComponent(word)}&max=10`
      );
      
      // Get antonyms (opposite meaning)
      const antonymsResponse = await fetch(
        `${this.baseUrl}?rel_ant=${encodeURIComponent(word)}&max=10`
      );

      // Get rhymes
      const rhymesResponse = await fetch(
        `${this.baseUrl}?rel_rhy=${encodeURIComponent(word)}&max=10`
      );

      // Get sound-alikes (similar pronunciation)
      const soundAlikesResponse = await fetch(
        `${this.baseUrl}?rel_nry=${encodeURIComponent(word)}&max=10`
      );

      // Get word associations (creative connections)
      const associationsResponse = await fetch(
        `${this.baseUrl}?rel_trg=${encodeURIComponent(word)}&max=10`
      );

      const [synonyms, antonyms, rhymes, soundAlikes, associations] = await Promise.all([
        synonymsResponse.json(),
        antonymsResponse.json(),
        rhymesResponse.json(),
        soundAlikesResponse.json(),
        associationsResponse.json()
      ]);

      return this.parseResponse({
        synonyms,
        antonyms,
        rhymes,
        soundAlikes,
        associations
      });
    } catch (error) {
      console.error('Datamuse API error:', error);
      return null;
    }
  }

  parseResponse(data: any): Partial<UnifiedWordData> {
    const result: Partial<UnifiedWordData> = {
      definitions: [],
      examples: [],
      tags: []
    };

    // Add synonyms as semantic tags
    if (data.synonyms && Array.isArray(data.synonyms)) {
      data.synonyms.forEach((item: any) => {
        result.tags!.push({
          type: 'semantic',
          value: `synonym:${item.word}`,
          confidence: item.score ? item.score / 1000 : 0.8,
          source: 'datamuse'
        });
      });
    }

    // Add antonyms as semantic tags
    if (data.antonyms && Array.isArray(data.antonyms)) {
      data.antonyms.forEach((item: any) => {
        result.tags!.push({
          type: 'semantic',
          value: `antonym:${item.word}`,
          confidence: item.score ? item.score / 1000 : 0.8,
          source: 'datamuse'
        });
      });
    }

    // Add rhymes as phonetic tags
    if (data.rhymes && Array.isArray(data.rhymes)) {
      data.rhymes.forEach((item: any) => {
        result.tags!.push({
          type: 'phonetic',
          value: `rhyme:${item.word}`,
          confidence: item.score ? item.score / 1000 : 0.7,
          source: 'datamuse'
        });
      });
    }

    // Add sound-alikes as phonetic tags
    if (data.soundAlikes && Array.isArray(data.soundAlikes)) {
      data.soundAlikes.forEach((item: any) => {
        result.tags!.push({
          type: 'phonetic',
          value: `sound_alike:${item.word}`,
          confidence: item.score ? item.score / 1000 : 0.6,
          source: 'datamuse'
        });
      });
    }

    // Add associations as creative tags
    if (data.associations && Array.isArray(data.associations)) {
      data.associations.forEach((item: any) => {
        result.tags!.push({
          type: 'creative',
          value: `association:${item.word}`,
          confidence: item.score ? item.score / 1000 : 0.5,
          source: 'datamuse'
        });
      });
    }

    return result;
  }
}

// ========================================
// MAIN API AGGREGATOR
// ========================================

export class APIAggregator {
  private oxfordClient = new OxfordAPIClient();
  private wordnikClient = new WordnikAPIClient();
  private urbanClient = new UrbanDictionaryAPIClient();
  private freeDictionaryClient = new FreeDictionaryAPIClient();
  private wordNetClient = new WordNetAPIClient();
  private datamuseClient = new DatamuseAPIClient();

  async getWordData(word: string): Promise<UnifiedWordData> {
    console.log(`Fetching data for word: ${word}`);

    // Try APIs in order of preference
    const results = await Promise.allSettled([
      this.oxfordClient.getWordData(word),
      this.wordnikClient.getWordData(word),
      this.urbanClient.getWordData(word),
      this.freeDictionaryClient.getWordData(word),
      this.wordNetClient.getWordData(word),
      this.datamuseClient.getWordData(word)
    ]);

    const [oxfordResult, wordnikResult, urbanResult, freeDictionaryResult, wordNetResult, datamuseResult] = results;

    // Merge results with conflict resolution
    const unifiedData = this.mergeResults(word, oxfordResult, wordnikResult, urbanResult, freeDictionaryResult, wordNetResult, datamuseResult);

    // Fallback: If no definitions found from any API, create basic word data
    if (unifiedData.definitions.length === 0) {
      console.log(`No definitions found for "${word}", creating basic word data`);
      unifiedData.definitions = [{
        text: `A word or term: ${word}`,
        source: 'fallback',
        confidence: 0.1
      }];
      unifiedData.difficulty = {
        level: 'intermediate',
        score: 0.5
      };
    }

    return unifiedData;
  }

  private mergeResults(
    word: string,
    oxfordResult: PromiseSettledResult<OxfordAPIResponse | null>,
    wordnikResult: PromiseSettledResult<WordnikAPIResponse | null>,
    urbanResult: PromiseSettledResult<UrbanDictionaryAPIResponse | null>,
    freeDictionaryResult: PromiseSettledResult<Partial<UnifiedWordData> | null>,
    wordNetResult: PromiseSettledResult<Partial<UnifiedWordData> | null>,
    datamuseResult: PromiseSettledResult<Partial<UnifiedWordData> | null>
  ): UnifiedWordData {
    const result: UnifiedWordData = {
      word,
      type: 'word',
      definitions: [],
      examples: [],
      tags: [],
      relationships: [],
      difficulty: {},
      metadata: {}
    };

    // Process Oxford results (highest priority)
    if (oxfordResult.status === 'fulfilled' && oxfordResult.value) {
      const oxfordData = this.oxfordClient.parseResponse(oxfordResult.value);
      this.mergeData(result, oxfordData, 'oxford');
    }

    // Process Wordnik results
    if (wordnikResult.status === 'fulfilled' && wordnikResult.value) {
      const wordnikData = this.wordnikClient.parseResponse(wordnikResult.value);
      this.mergeData(result, wordnikData, 'wordnik');
    }

    // Process Urban Dictionary results (for slang/idioms)
    if (urbanResult.status === 'fulfilled' && urbanResult.value) {
      const urbanData = this.urbanClient.parseResponse(urbanResult.value);
      this.mergeData(result, urbanData, 'urban');
    }

    // Process Free Dictionary results
    if (freeDictionaryResult.status === 'fulfilled' && freeDictionaryResult.value) {
      const freeDictionaryData = freeDictionaryResult.value;
      this.mergeData(result, freeDictionaryData, 'free_dictionary');
    }

    // Process WordNet results
    if (wordNetResult.status === 'fulfilled' && wordNetResult.value) {
      const wordNetData = wordNetResult.value;
      this.mergeData(result, wordNetData, 'wordnet');
    }

    // Process Datamuse results
    if (datamuseResult.status === 'fulfilled' && datamuseResult.value) {
      const datamuseData = datamuseResult.value;
      this.mergeData(result, datamuseData, 'datamuse');
    }

    // Determine word type based on sources and patterns
    if (result.tags.some(tag => tag.value === 'slang')) {
      result.type = 'slang';
    } else if (result.tags.some(tag => tag.value === 'idiom')) {
      result.type = 'idiom';
    } else if (this.isPhrasalVerb(word)) {
      result.type = 'phrasal_verb';
    } else if (this.isCollocation(word, result)) {
      result.type = 'collocation';
    } else if (word.includes(' ') && result.definitions.length > 0) {
      result.type = 'phrase';
    } else {
      result.type = 'word';
    }

    // Resolve conflicts and set primary definitions
    this.resolveConflicts(result);

    return result;
  }

  private mergeData(target: UnifiedWordData, source: Partial<UnifiedWordData>, sourceName: string): void {
    // Merge definitions
    if (source.definitions) {
      target.definitions.push(...source.definitions);
    }

    // Merge examples
    if (source.examples) {
      target.examples.push(...source.examples);
    }

    // Merge tags
    if (source.tags) {
      target.tags.push(...source.tags);
    }

    // Merge relationships
    if (source.relationships) {
      target.relationships.push(...source.relationships);
    }

    // Merge difficulty (prefer higher confidence)
    if (source.difficulty?.level && !target.difficulty.level) {
      target.difficulty.level = source.difficulty.level;
    }
    if (source.difficulty?.score && !target.difficulty.score) {
      target.difficulty.score = source.difficulty.score;
    }

    // Merge metadata
    if (source.metadata) {
      target.metadata = { ...target.metadata, ...source.metadata };
    }
  }

  private resolveConflicts(data: UnifiedWordData): void {
    // Remove duplicate definitions
    const seenDefinitions = new Set<string>();
    data.definitions = data.definitions.filter(def => {
      const normalized = def.text.toLowerCase().trim();
      if (seenDefinitions.has(normalized)) return false;
      seenDefinitions.add(normalized);
      return true;
    });

    // Remove duplicate examples
    const seenExamples = new Set<string>();
    data.examples = data.examples.filter(ex => {
      const normalized = ex.text.toLowerCase().trim();
      if (seenExamples.has(normalized)) return false;
      seenExamples.add(normalized);
      return true;
    });

    // Remove duplicate tags
    const seenTags = new Set<string>();
    data.tags = data.tags.filter(tag => {
      const key = `${tag.type}:${tag.value}`;
      if (seenTags.has(key)) return false;
      seenTags.add(key);
      return true;
    });

    // Sort definitions by confidence (highest first)
    data.definitions.sort((a, b) => b.confidence - a.confidence);

    // Sort examples by source preference
    data.examples.sort((a, b) => {
      const sourcePriority = { oxford: 3, wordnik: 2, urban: 1 };
      return (sourcePriority[b.source as keyof typeof sourcePriority] || 0) - 
             (sourcePriority[a.source as keyof typeof sourcePriority] || 0);
    });
  }

  // Utility method to check if a word exists in any API
  async wordExists(word: string): Promise<boolean> {
    const data = await this.getWordData(word);
    return data.definitions.length > 0;
  }

  // Method to get related words (for building relationships)
  async getRelatedWords(word: string): Promise<string[]> {
    // This would integrate with WordNet or similar for semantic relationships
    // For now, return empty array
    return [];
  }

  private isPhrasalVerb(word: string): boolean {
    const words = word.toLowerCase().split(' ');
    if (words.length !== 2) return false;
    
    // Common phrasal verb particles
    const particles = [
      'up', 'down', 'out', 'in', 'on', 'off', 'away', 'back', 'over', 'through',
      'across', 'along', 'around', 'by', 'for', 'from', 'into', 'onto', 'upon',
      'with', 'without', 'within', 'against', 'among', 'between', 'during',
      'except', 'inside', 'outside', 'under', 'above', 'below', 'behind',
      'beneath', 'beside', 'beyond', 'inside', 'near', 'opposite', 'outside',
      'past', 'since', 'toward', 'underneath', 'until', 'upon', 'within'
    ];
    
    return particles.includes(words[1]);
  }

  private isCollocation(word: string, data: UnifiedWordData): boolean {
    const words = word.toLowerCase().split(' ');
    if (words.length !== 2) return false;
    
    // Check if it's a common collocation pattern
    const commonCollocations = [
      // Adjective + Noun patterns
      'strong coffee', 'heavy rain', 'bright future', 'deep breath', 'fresh air',
      'hard work', 'soft voice', 'sharp mind', 'smooth surface', 'rough time',
      
      // Verb + Noun patterns  
      'make decision', 'take action', 'give advice', 'pay attention', 'keep promise',
      'break rule', 'catch cold', 'do homework', 'get job', 'have meeting',
      
      // Adverb + Adjective patterns
      'highly likely', 'deeply concerned', 'fully aware', 'completely different',
      'totally wrong', 'absolutely certain', 'extremely important', 'very good',
      
      // Noun + Noun patterns
      'business meeting', 'family dinner', 'school uniform', 'car accident',
      'phone call', 'book club', 'music festival', 'food court'
    ];
    
    // Check if the word matches any common collocation pattern
    if (commonCollocations.includes(word.toLowerCase())) {
      return true;
    }
    
    // Check if definitions contain collocation indicators
    const collocationIndicators = [
      'commonly used together', 'frequently paired', 'typical combination',
      'natural pairing', 'standard expression', 'conventional phrase'
    ];
    
    return data.definitions.some(def => 
      collocationIndicators.some(indicator => 
        def.text.toLowerCase().includes(indicator)
      )
    );
  }
}

// ========================================
// EXPORT SINGLETON INSTANCE
// ========================================

export const apiAggregator = new APIAggregator(); 