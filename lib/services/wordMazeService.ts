import { useWordMazeStore, Word } from '../stores/wordMazeStore';

export interface AddWordResponse {
  message: string;
  results: Array<{
    word: string;
    status: 'new' | 'exists';
    data?: any;
  }>;
  errors: string[];
}

export interface WordDetailsResponse {
  definition: string;
  example: string;
  synonyms: string[];
  usage_tip: string;
  cached: boolean;
}

class WordMazeService {
  private baseUrl = '/api/word-maze';

  async addWord(word: string): Promise<AddWordResponse> {
    const response = await fetch(`${this.baseUrl}/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ words: [word] }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add word: ${response.statusText}`);
    }

    return response.json();
  }

  async getWordDetails(word: string): Promise<WordDetailsResponse> {
    const response = await fetch(`${this.baseUrl}/generate-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get word details: ${response.statusText}`);
    }

    return response.json();
  }

  async getWords(limit = 12, offset = 0): Promise<Word[]> {
    const response = await fetch(
      `${this.baseUrl}/words?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch words: ${response.statusText}`);
    }

    const data = await response.json();
    return data.words || [];
  }
}

// Hook for using the service with the store
export const useWordMazeService = () => {
  const store = useWordMazeStore();

  const addWordWithOptimisticUpdate = async (word: string) => {
    // Step 1: Add word optimistically to the store
    store.addWordOptimistically(word);
    
    const tempWordId = store.getWordByText(word)?.id;
    if (!tempWordId) return;

    try {
      // Step 2: Update status to syncing
      store.updateWordStatus(tempWordId, 'syncing');

      // Step 3: Call API to add word
      const response = await new WordMazeService().addWord(word);
      
      // Step 4: Handle response
      const result = response.results.find(r => r.word.toLowerCase() === word.toLowerCase());
      
      if (result) {
        if (result.status === 'new') {
          // Word was successfully added, update with real data
          store.updateWordDetails(tempWordId, {
            id: result.data?.id || tempWordId,
            status: 'synced',
          });
          // Notification: success
          store.setNotification({ type: 'success', message: `Word "${word}" added!` });
        } else if (result.status === 'exists') {
          // Word already exists, update with existing data and move to top
          store.updateWordDetails(tempWordId, {
            id: result.data?.id || tempWordId,
            status: 'synced',
            definition: result.data?.definition,
            example: result.data?.example,
            synonyms: result.data?.synonyms,
            usage_tip: result.data?.usage_tip,
          });
          
          // Move the word to the top of the list by reordering
          const currentWords = store.words;
          const wordToMove = currentWords.find(w => w.id === tempWordId);
          if (wordToMove) {
            const otherWords = currentWords.filter(w => w.id !== tempWordId);
            store.setWords([wordToMove, ...otherWords]);
          }
          
          // Notification: exists
          store.setNotification({ type: 'error', message: `Word "${word}" already exists.` });
        }
      }

      // Step 5: Fetch word details if needed
      if (result?.status === 'new') {
        try {
          const details = await new WordMazeService().getWordDetails(word);
          store.updateWordDetails(tempWordId, {
            definition: details.definition,
            example: details.example,
            synonyms: details.synonyms,
            usage_tip: details.usage_tip,
          });
        } catch (detailsError) {
          console.error('Failed to fetch word details:', detailsError);
          // Don't fail the whole operation if details fetch fails
        }
      }

      // Clear notification after 5 seconds
      setTimeout(() => store.clearNotification(), 5000);

    } catch (error) {
      console.error('Failed to add word:', error);
      store.updateWordStatus(tempWordId, 'error', error instanceof Error ? error.message : 'Unknown error');
      store.setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to add word' });
      setTimeout(() => store.clearNotification(), 5000);
    }
  };

  const loadWords = async (limit = 12, offset = 0) => {
    try {
      store.setLoading(true);
      store.setError(null);
      
      const words = await new WordMazeService().getWords(limit, offset);
      
      // Merge with existing words, avoiding duplicates
      const existingWords = store.words;
      const newWords = words.filter(newWord => 
        !existingWords.some(existing => existing.word === newWord.word)
      );
      
      store.setWords([...existingWords, ...newWords]);
    } catch (error) {
      console.error('Failed to load words:', error);
      store.setError(error instanceof Error ? error.message : 'Failed to load words');
    } finally {
      store.setLoading(false);
    }
  };

  const refreshWordDetails = async (wordId: string) => {
    const word = store.getWordById(wordId);
    if (!word) return;

    try {
      store.updateWordStatus(wordId, 'syncing');
      
      const details = await new WordMazeService().getWordDetails(word.word);
      
      store.updateWordDetails(wordId, {
        definition: details.definition,
        example: details.example,
        synonyms: details.synonyms,
        usage_tip: details.usage_tip,
        status: 'synced',
      });
    } catch (error) {
      console.error('Failed to refresh word details:', error);
      store.updateWordStatus(wordId, 'error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return {
    addWordWithOptimisticUpdate,
    loadWords,
    refreshWordDetails,
    service: new WordMazeService(),
  };
};

export default WordMazeService; 