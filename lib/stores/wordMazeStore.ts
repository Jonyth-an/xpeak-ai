import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Word {
  id: string;
  word: string;
  definition?: string;
  example?: string;
  synonyms?: string[];
  usage_tip?: string;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  error?: string;
  created_at: string;
  updated_at: string;
}

interface WordMazeState {
  // State
  words: Word[];
  isLoading: boolean;
  error: string | null;
  // Notification state
  notification: { type: 'success' | 'error'; message: string } | null;
  
  // Actions
  addWordOptimistically: (word: string) => void;
  updateWordStatus: (wordId: string, status: Word['status'], error?: string) => void;
  updateWordDetails: (wordId: string, details: Partial<Word>) => void;
  removeWord: (wordId: string) => void;
  setWords: (words: Word[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  // Notification actions
  setNotification: (notification: { type: 'success' | 'error'; message: string } | null) => void;
  clearNotification: () => void;
  
  // Computed
  getPendingWords: () => Word[];
  getSyncedWords: () => Word[];
  getWordById: (wordId: string) => Word | undefined;
  getWordByText: (wordText: string) => Word | undefined;
}

export const useWordMazeStore = create<WordMazeState>()(
  devtools(
    (set, get) => ({
      // Initial state
      words: [],
      isLoading: false,
      error: null,
      notification: null,

      // Actions
      addWordOptimistically: (word: string) => {
        const newWord: Word = {
          id: `temp-${Date.now()}-${Math.random()}`,
          word: word.toLowerCase().trim(),
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        set((state) => ({
          words: [newWord, ...state.words],
          error: null,
        }));
      },

      updateWordStatus: (wordId: string, status: Word['status'], error?: string) => {
        set((state) => ({
          words: state.words.map((word) =>
            word.id === wordId
              ? {
                  ...word,
                  status,
                  error,
                  updated_at: new Date().toISOString(),
                }
              : word
          ),
        }));
      },

      updateWordDetails: (wordId: string, details: Partial<Word>) => {
        set((state) => ({
          words: state.words.map((word) =>
            word.id === wordId
              ? {
                  ...word,
                  ...details,
                  updated_at: new Date().toISOString(),
                }
              : word
          ),
        }));
      },

      removeWord: (wordId: string) => {
        set((state) => ({
          words: state.words.filter((word) => word.id !== wordId),
        }));
      },

      setWords: (words: Word[]) => {
        set({ words });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setNotification: (notification) => {
        set({ notification });
      },

      clearNotification: () => {
        set({ notification: null });
      },

      // Computed getters
      getPendingWords: () => {
        return get().words.filter((word) => 
          word.status === 'pending' || word.status === 'syncing'
        );
      },

      getSyncedWords: () => {
        return get().words.filter((word) => word.status === 'synced');
      },

      getWordById: (wordId: string) => {
        return get().words.find((word) => word.id === wordId);
      },

      getWordByText: (wordText: string) => {
        return get().words.find((word) => 
          word.word.toLowerCase() === wordText.toLowerCase()
        );
      },
    }),
    {
      name: 'word-maze-store',
    }
  )
); 