import { useWordMazeStore, Word } from '../stores/wordMazeStore';
import { supabase } from '../supabaseClient';

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

export interface BulkOperationResult {
  success: boolean;
  added: number;
  skipped: number;
  errors: string[];
}

class WordMazeService {
  private baseUrl = '/api/word-maze';

  async addWord(word: string): Promise<AddWordResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    console.log('=== FRONTEND AUTH DEBUG ===');
    console.log('Session exists:', !!session);
    console.log('Access token exists:', !!accessToken);
    console.log('Token length:', accessToken?.length || 0);
    console.log('User ID:', session?.user?.id);
    console.log('User email:', session?.user?.email);

    const headers = {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
    };
    
    console.log('Request headers:', headers);

    const response = await fetch(`${this.baseUrl}/words`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ words: [word] }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add word: ${response.statusText}`);
    }

    return response.json();
  }

  async addWordsBulk(words: string[]): Promise<BulkOperationResult> {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    console.log('=== FRONTEND AUTH DEBUG (BULK) ===');
    console.log('Session exists:', !!session);
    console.log('Access token exists:', !!accessToken);
    console.log('Token length:', accessToken?.length || 0);
    console.log('Words to add:', words);

    const response = await fetch(`${this.baseUrl}/words`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ words }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add words: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      added: data.results.filter((r: any) => r.status === 'new').length,
      skipped: data.results.filter((r: any) => r.status === 'exists').length,
      errors: data.errors || []
    };
  }

  async deleteWord(wordId: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const response = await fetch(`${this.baseUrl}/words/${wordId}`, {
      method: 'DELETE',
      headers: {
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete word: ${response.statusText}`);
    }

    return true;
  }

  async deleteWordsBulk(wordIds: string[]): Promise<BulkOperationResult> {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const response = await fetch(`${this.baseUrl}/words/bulk-delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ wordIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete words: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      added: 0,
      skipped: 0,
      errors: data.errors || []
    };
  }

  async getWordDetails(word: string): Promise<WordDetailsResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const response = await fetch(`${this.baseUrl}/generate-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get word details: ${response.statusText}`);
    }

    return response.json();
  }

  async getWords(limit = 12, offset = 0): Promise<Word[]> {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const response = await fetch(
      `${this.baseUrl}/words?limit=${limit}&offset=${offset}`,
      {
        headers: {
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      }
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

  const addWordsBulkWithOptimisticUpdate = async (words: string[]) => {
    // Step 1: Add all words optimistically
    const tempWordIds: string[] = [];
    
    for (const word of words) {
      store.addWordOptimistically(word);
      const tempWordId = store.getWordByText(word)?.id;
      if (tempWordId) {
        tempWordIds.push(tempWordId);
      }
    }

    // Step 2: Update all statuses to syncing
    tempWordIds.forEach(id => store.updateWordStatus(id, 'syncing'));

    try {
      // Step 3: Call bulk API
      const result = await new WordMazeService().addWordsBulk(words);
      
      // Step 4: Handle results
      if (result.success) {
        // Update successful words to synced
        tempWordIds.forEach(id => {
          const word = store.getWordById(id);
          if (word) {
            store.updateWordDetails(id, {
              status: 'synced',
            });
          }
        });

        // Show success notification
        const message = `Added ${result.added} words${result.skipped > 0 ? `, ${result.skipped} already existed` : ''}`;
        store.setNotification({ type: 'success', message });
      }

      // Clear notification after 5 seconds
      setTimeout(() => store.clearNotification(), 5000);

    } catch (error) {
      console.error('Failed to add words bulk:', error);
      
      // Update all to error status
      tempWordIds.forEach(id => {
        store.updateWordStatus(id, 'error', error instanceof Error ? error.message : 'Unknown error');
      });
      
      store.setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to add words' });
      setTimeout(() => store.clearNotification(), 5000);
    }
  };

  const deleteWordWithOptimisticUpdate = async (wordId: string) => {
    const word = store.getWordById(wordId);
    if (!word) return;

    // Step 1: Remove word optimistically
    store.removeWord(wordId);

    try {
      // Step 2: Call API to delete
      await new WordMazeService().deleteWord(wordId);
      
      // Step 3: Show success notification
      store.setNotification({ type: 'success', message: `Word "${word.word}" deleted successfully!` });
      
      // Clear notification after 5 seconds
      setTimeout(() => store.clearNotification(), 5000);

    } catch (error) {
      console.error('Failed to delete word:', error);
      
      // Step 4: Rollback on error - add word back
      store.addWordOptimistically(word.word);
      const newTempId = store.getWordByText(word.word)?.id;
      if (newTempId) {
        store.updateWordDetails(newTempId, {
          ...word,
          status: 'error',
          error: error instanceof Error ? error.message : 'Failed to delete'
        });
      }
      
      store.setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete word' });
      setTimeout(() => store.clearNotification(), 5000);
    }
  };

  const deleteWordsBulkWithOptimisticUpdate = async (wordIds: string[]) => {
    const wordsToDelete = wordIds.map(id => store.getWordById(id)).filter(Boolean);
    
    // Step 1: Remove all words optimistically
    wordIds.forEach(id => store.removeWord(id));

    try {
      // Step 2: Call bulk delete API
      const result = await new WordMazeService().deleteWordsBulk(wordIds);
      
      // Step 3: Show success notification
      if (result.success) {
        store.setNotification({ type: 'success', message: `Deleted ${wordIds.length} words successfully!` });
      }

      // Clear notification after 5 seconds
      setTimeout(() => store.clearNotification(), 5000);

    } catch (error) {
      console.error('Failed to delete words bulk:', error);
      
      // Step 4: Rollback on error - add words back
      wordsToDelete.forEach(word => {
        if (word) {
          store.addWordOptimistically(word.word);
          const newTempId = store.getWordByText(word.word)?.id;
          if (newTempId) {
            store.updateWordDetails(newTempId, {
              ...word,
              status: 'error',
              error: error instanceof Error ? error.message : 'Failed to delete'
            });
          }
        }
      });
      
      store.setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Failed to delete words' });
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
    addWordsBulkWithOptimisticUpdate,
    deleteWordWithOptimisticUpdate,
    deleteWordsBulkWithOptimisticUpdate,
    loadWords,
    refreshWordDetails,
    service: new WordMazeService(),
  };
};

export default WordMazeService; 