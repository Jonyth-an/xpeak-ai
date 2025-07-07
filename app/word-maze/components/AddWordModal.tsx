'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Textarea from '@/app/components/ui/Textarea';
import Card from '@/app/components/ui/Card';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWords: (words: string[]) => Promise<void>;
}

export default function AddWordModal({ isOpen, onClose, onAddWords }: AddWordModalProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [singleWord, setSingleWord] = useState('');
  const [bulkWords, setBulkWords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let words: string[] = [];

      if (mode === 'single') {
        if (!singleWord.trim()) {
          throw new Error('Please enter a word');
        }
        words = [singleWord.trim()];
      } else {
        if (!bulkWords.trim()) {
          throw new Error('Please enter some words');
        }
        // Parse bulk words - split by newlines, commas, or spaces
        words = bulkWords
          .split(/[\n,]+/)
          .map(word => word.trim())
          .filter(word => word.length > 0);
        
        if (words.length === 0) {
          throw new Error('No valid words found');
        }
      }

      await onAddWords(words);
      
      // Reset form
      setSingleWord('');
      setBulkWords('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add words');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSingleWord('');
      setBulkWords('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-token-4">
      <Card className="w-full max-w-md">
        <div className="p-token-6">
          <div className="flex items-center justify-between mb-token-6">
            <h2 className="text-token-heading-lg font-token-bold text-token-text">Add Words to Your Bank</h2>
            <button
              onClick={handleClose}
              className="text-token-text-secondary hover:text-token-text text-token-xl"
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-token-2 mb-token-6">
            <Button
              variant={mode === 'single' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setMode('single')}
              disabled={isLoading}
            >
              Single Word
            </Button>
            <Button
              variant={mode === 'bulk' ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setMode('bulk')}
              disabled={isLoading}
            >
              Bulk Import
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'single' ? (
              <div className="space-y-token-4">
                <div>
                  <label htmlFor="singleWord" className="block text-token-body-sm font-token-medium mb-token-2 text-token-text">
                    Word
                  </label>
                  <Input
                    id="singleWord"
                    type="text"
                    value={singleWord}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSingleWord(e.target.value)}
                    placeholder="Enter a word..."
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-token-4">
                <div>
                  <label htmlFor="bulkWords" className="block text-token-body-sm font-token-medium mb-token-2 text-token-text">
                    Words (one per line or comma-separated)
                  </label>
                  <Textarea
                    id="bulkWords"
                    value={bulkWords}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBulkWords(e.target.value)}
                    placeholder="Enter words, one per line or separated by commas..."
                    rows={6}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                <div className="text-token-body-sm text-token-text-secondary">
                  <p>You can enter words:</p>
                  <ul className="list-disc list-inside mt-token-1 space-y-token-1">
                    <li>One per line</li>
                    <li>Separated by commas</li>
                    <li>Mixed format</li>
                  </ul>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-token-4 p-token-3 bg-token-error/10 border border-token-error/20 rounded-token-md">
                <p className="text-token-error text-token-body-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-token-3 mt-token-6">
              <Button
                type="button"
                variant="tertiary"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Adding...' : 'Add Words'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
} 