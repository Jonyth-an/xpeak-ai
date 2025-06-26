import React, { useState, useEffect } from 'react';
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-modal p-4">
      <Card className="w-full max-w-md p-6 rounded-token-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {mode === 'edit' ? 'Edit Word' : 'Add New Word'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </Button>
        </div>

        {smartCheck && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              🤖 Smart Check (Beta): AI-powered validation enabled
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Word *
            </label>
            <Input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter the word"
              className={errors.word ? 'border-red-500' : ''}
            />
            {errors.word && (
              <p className="text-red-500 text-sm mt-1">{errors.word}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="text-red-500 text-sm mt-1">{errors.definition}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                US Pronunciation
              </label>
              <Input
                value={pronUS}
                onChange={(e) => setPronUS(e.target.value)}
                placeholder="URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UK Pronunciation
              </label>
              <Input
                value={pronUK}
                onChange={(e) => setPronUK(e.target.value)}
                placeholder="URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AU Pronunciation
              </label>
              <Input
                value={pronAU}
                onChange={(e) => setPronAU(e.target.value)}
                placeholder="URL"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
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
        </div>
      </Card>
    </div>
  );
} 