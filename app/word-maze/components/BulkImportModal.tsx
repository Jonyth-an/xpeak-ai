import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Textarea } from '@/app/components/ui';

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportWords: (words: any[]) => void;
  smartCheck: boolean;
}

interface WordPreview {
  word: string;
  definition?: string;
  pronunciationUrls?: {
    us?: string;
    uk?: string;
    au?: string;
  };
  imageUrl?: string;
  selected: boolean;
}

export default function BulkImportModal({ 
  open, 
  onClose, 
  onImportWords, 
  smartCheck 
}: BulkImportModalProps) {
  const [wordList, setWordList] = useState('');
  const [previewWords, setPreviewWords] = useState<WordPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function parseWordList(text: string): string[] {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
  }

  function handlePreview() {
    const words = parseWordList(wordList);
    
    if (words.length === 0) {
      setErrors(['Please enter at least one word.']);
      return;
    }

    if (words.length > 50) {
      setErrors(['Maximum 50 words allowed per import.']);
      return;
    }

    setErrors([]);
    
    // Create preview objects (for now, just words - AI enhancement will be added later)
    const preview = words.map(word => ({
      word,
      definition: smartCheck ? `[AI will generate definition for "${word}"]` : undefined,
      pronunciationUrls: smartCheck ? {
        us: `[AI will fetch US pronunciation for "${word}"]`,
        uk: `[AI will fetch UK pronunciation for "${word}"]`,
        au: `[AI will fetch AU pronunciation for "${word}"]`
      } : undefined,
      imageUrl: smartCheck ? `[AI will generate/fetch image for "${word}"]` : undefined,
      selected: true
    }));

    setPreviewWords(preview);
  }

  function handleSelectAll() {
    setPreviewWords(prev => prev.map(word => ({ ...word, selected: true })));
  }

  function handleDeselectAll() {
    setPreviewWords(prev => prev.map(word => ({ ...word, selected: false })));
  }

  function handleToggleWord(index: number) {
    setPreviewWords(prev => prev.map((word, i) => 
      i === index ? { ...word, selected: !word.selected } : word
    ));
  }

  function handleImport() {
    const selectedWords = previewWords.filter(word => word.selected);
    
    if (selectedWords.length === 0) {
      setErrors(['Please select at least one word to import.']);
      return;
    }

    setIsProcessing(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const wordsToImport = selectedWords.map((word, index) => {
        // Generate stable ID based on word content and index
        const hash = word.word.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const stableId = `bulk-${Math.abs(hash)}-${index}`;
        
        return {
          id: stableId,
          word: word.word,
          definition: word.definition || `Definition for ${word.word}`,
          pronunciationUrls: word.pronunciationUrls || {},
          imageUrl: word.imageUrl,
          dateAdded: new Date().toISOString().slice(0, 10)
        };
      });

      onImportWords(wordsToImport);
      setIsProcessing(false);
      onClose();
      setWordList('');
      setPreviewWords([]);
      setErrors([]);
    }, 2000);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <Card className="p-6 rounded-token-lg">
              <motion.div 
                className="flex justify-between items-center mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold">Bulk Import Words</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </motion.div>

              {smartCheck && (
                <motion.div 
                  className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-sm text-blue-700">
                    🤖 Smart Check (Beta): AI will automatically generate definitions, fetch pronunciations, and find relevant images for your words.
                  </p>
                </motion.div>
              )}

              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Input Section */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Words (one per line)
                    </label>
                    <Textarea
                      value={wordList}
                      onChange={(e) => setWordList(e.target.value)}
                      placeholder="serendipity&#10;ubiquitous&#10;ephemeral&#10;..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum 50 words per import. Duplicates will be automatically removed.
                    </p>
                  </motion.div>

                  <motion.div 
                    className="flex gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Button
                      onClick={handlePreview}
                      className="flex-1"
                      disabled={!wordList.trim()}
                    >
                      Preview Words
                    </Button>
                  </motion.div>

                  <AnimatePresence>
                    {errors.length > 0 && (
                      <motion.div 
                        className="p-3 bg-red-50 border border-red-200 rounded-lg"
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {errors.map((error, index) => (
                          <motion.p 
                            key={index} 
                            className="text-red-600 text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {error}
                          </motion.p>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Preview Section */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <motion.div 
                    className="flex justify-between items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-lg font-medium">Preview ({previewWords.length} words)</h3>
                    {previewWords.length > 0 && (
                      <motion.div 
                        className="flex gap-2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSelectAll}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDeselectAll}
                        >
                          Deselect All
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div 
                    className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {previewWords.length === 0 ? (
                      <motion.p 
                        className="text-gray-500 text-center py-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Enter words and click "Preview Words" to see them here
                      </motion.p>
                    ) : (
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        {previewWords.map((word, index) => (
                          <motion.div
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              word.selected 
                                ? 'bg-white border-blue-300 shadow-sm' 
                                : 'bg-gray-100 border-gray-200'
                            }`}
                            onClick={() => handleToggleWord(index)}
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ 
                              delay: 0.6 + index * 0.05,
                              type: "spring",
                              stiffness: 300,
                              damping: 25
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <input
                              type="checkbox"
                              checked={word.selected}
                              onChange={() => handleToggleWord(index)}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{word.word}</p>
                              {word.definition && (
                                <p className="text-sm text-gray-600 mt-1">{word.definition}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {previewWords.length > 0 && (
                      <motion.div 
                        className="flex gap-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Button
                          variant="outline"
                          onClick={onClose}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleImport}
                          disabled={isProcessing || previewWords.filter(w => w.selected).length === 0}
                          className="flex-1"
                        >
                          {isProcessing ? (
                            <motion.span 
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <motion.div 
                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Processing...
                            </motion.span>
                          ) : (
                            `Import ${previewWords.filter(w => w.selected).length} Words`
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 