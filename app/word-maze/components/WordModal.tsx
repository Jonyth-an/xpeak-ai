import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Textarea } from '@/app/components/ui';

interface WordModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  onClose: () => void;
  onAddWord: (word: any) => void;
  onEditWord?: (word: any) => void;
  smartCheck: boolean;
  initialWord?: any;
}

export default function WordModal({ 
  open, 
  mode, 
  onClose, 
  onAddWord, 
  onEditWord, 
  smartCheck, 
  initialWord 
}: WordModalProps) {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [pronUS, setPronUS] = useState('');
  const [pronUK, setPronUK] = useState('');
  const [pronAU, setPronAU] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Reset form when modal opens/closes or initialWord changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialWord) {
        setWord(initialWord.word || '');
        setDefinition(initialWord.definition || '');
        setPronUS(initialWord.pronunciationUrls?.us || '');
        setPronUK(initialWord.pronunciationUrls?.uk || '');
        setPronAU(initialWord.pronunciationUrls?.au || '');
        setImageUrl(initialWord.imageUrl || '');
      } else {
        // Reset form for add mode
        setWord('');
        setDefinition('');
        setPronUS('');
        setPronUK('');
        setPronAU('');
        setImageUrl('');
      }
      setErrors({});
    }
  }, [open, mode, initialWord]);

  function handleSubmit() {
    const newErrors: {[key: string]: string} = {};
    
    if (!word.trim()) {
      newErrors.word = 'Word is required';
    }
    if (!definition.trim()) {
      newErrors.definition = 'Definition is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const wordData = {
      word: word.trim(),
      definition: definition.trim(),
      pronunciationUrls: {
        ...(pronUS && { us: pronUS }),
        ...(pronUK && { uk: pronUK }),
        ...(pronAU && { au: pronAU }),
      },
      ...(imageUrl && { imageUrl: imageUrl.trim() }),
    };

    if (mode === 'edit' && onEditWord && initialWord) {
      onEditWord({
        ...initialWord,
        ...wordData,
      });
    } else {
      onAddWord(wordData);
    }

    onClose();
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
            className="w-full max-w-md"
          >
            <Card className="p-6 rounded-token-lg bg-token-elevated token-border-primary border">
              <motion.div 
                className="flex justify-between items-center mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold">
                  {mode === 'edit' ? 'Edit Word' : 'Add New Word'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="token-text-secondary hover:token-text-primary"
                >
                  ✕
                </Button>
              </motion.div>

              {smartCheck && (
                <motion.div 
                  className="mb-4 p-3 bg-token-info-light border token-border-info rounded-lg"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-sm token-text-info">
                    🤖 Smart Check (Beta): AI-powered validation enabled
                  </p>
                </motion.div>
              )}

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="block text-sm font-medium token-text-primary mb-1">
                    Word *
                  </label>
                  <Input
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Enter the word"
                    className={errors.word ? 'border-red-500' : ''}
                  />
                  {errors.word && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {errors.word}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium token-text-primary mb-1">
                    Definition *
                  </label>
                  <Textarea
                    value={definition}
                    onChange={(e) => setDefinition(e.target.value)}
                    placeholder="Enter the definition"
                    rows={3}
                    className={errors.definition ? 'border-red-500' : ''}
                  />
                  {errors.definition && (
                    <motion.p 
                      className="text-red-500 text-sm mt-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {errors.definition}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div 
                  className="grid grid-cols-3 gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div>
                    <label className="block text-sm font-medium token-text-primary mb-1">
                      US Pronunciation
                    </label>
                    <Input
                      value={pronUS}
                      onChange={(e) => setPronUS(e.target.value)}
                      placeholder="URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium token-text-primary mb-1">
                      UK Pronunciation
                    </label>
                    <Input
                      value={pronUK}
                      onChange={(e) => setPronUK(e.target.value)}
                      placeholder="URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium token-text-primary mb-1">
                      AU Pronunciation
                    </label>
                    <Input
                      value={pronAU}
                      onChange={(e) => setPronAU(e.target.value)}
                      placeholder="URL"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium token-text-primary mb-1">
                    Image URL
                  </label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex gap-3 mt-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  {mode === 'edit' ? 'Save Changes' : 'Add Word'}
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 