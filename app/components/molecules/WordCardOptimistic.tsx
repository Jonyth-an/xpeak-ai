'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '../ui';
import { Button } from '@/app/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Word, useWordMazeStore } from '../../../lib/stores/wordMazeStore';
import { WordStatusIndicator, CompactWordStatusIndicator } from './WordStatusIndicator';
import { useWordMazeService } from '../../../lib/services/wordMazeService';

export interface WordCardOptimisticProps {
  word: Word;
  showModal: boolean;
  setShowModalId: (id: string | null) => void;
  cardClassName?: string;
}

interface WordDetails {
  definition: string;
  example: string;
  synonyms: string[];
  usageTip: string;
}

export default function WordCardOptimistic({
  word,
  showModal,
  setShowModalId,
  cardClassName = '',
}: WordCardOptimisticProps) {
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [wordDetails, setWordDetails] = useState<WordDetails | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  
  const { removeWord, updateWordDetails } = useWordMazeStore();
  const { refreshWordDetails } = useWordMazeService();

  const fetchWordDetails = async () => {
    if (wordDetails) return; // Already loaded
    
    setIsLoadingDetails(true);
    setDetailsError(null);
    
    try {
      const response = await fetch('/api/word-maze/generate-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: word.word }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch details: ${response.statusText}`);
      }
      
      const details = await response.json();
      setWordDetails(details);
      
      // Update the store with the fetched details
      updateWordDetails(word.id, {
        definition: details.definition,
        example: details.example,
        synonyms: details.synonyms,
        usage_tip: details.usage_tip,
      });
    } catch (error) {
      console.error('Error fetching word details:', error);
      setDetailsError('Failed to load word details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleDelete = () => {
    removeWord(word.id);
  };

  const handleCloseModal = () => {
    setShowModalId(null);
    setWordDetails(null);
    setDetailsError(null);
  };

  const handleRetrySync = async () => {
    await refreshWordDetails(word.id);
  };

  // Fetch details when modal opens
  useEffect(() => {
    if (showModal && !wordDetails && !isLoadingDetails && !detailsError) {
      fetchWordDetails();
    }
  }, [showModal]);

  // Use store data if available
  const displayDefinition = word.definition || wordDetails?.definition;
  const displayExample = word.example || wordDetails?.example;
  const displaySynonyms = word.synonyms || wordDetails?.synonyms;
  const displayUsageTip = word.usage_tip || wordDetails?.usageTip;

  return (
    <Card
      className={`relative h-64 flex flex-col justify-between p-token-6 rounded-token-lg transition-all duration-200 bg-white shadow-token-md cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-token-primary/20 ${cardClassName} ${showModal ? 'z-40' : ''}`}
      onClick={() => setShowModalId(word.id)}
      tabIndex={0}
      role="button"
      aria-label={`Open details for ${word.word}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowModalId(word.id); }}
    >
      <div>
        <div className="flex justify-between items-start mb-token-2">
          <h3 className="text-token-heading-lg font-token-bold text-token-primary">{word.word}</h3>
          <WordStatusIndicator 
            status={word.status} 
            error={word.error}
            className="ml-token-2"
          />
        </div>
        <div className="text-token-text-secondary text-token-body-base line-clamp-4">
          {displayDefinition || 'Loading definition...'}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-token-body-sm text-token-text-tertiary mt-token-2">
        <span>Added: {new Date(word.created_at).toLocaleDateString()}</span>
        {word.status === 'error' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRetrySync();
            }}
            className="text-token-accent hover:text-token-accent-dark text-token-body-xs"
          >
            Retry
          </button>
        )}
      </div>

      {/* Modal for full details */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-token-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-token-lg shadow-token-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-token-6">
                <div className="flex justify-between items-start mb-token-6">
                  <div className="flex items-center gap-token-3">
                    <h2 className="text-token-heading-xl font-token-bold text-token-primary">{word.word}</h2>
                    <WordStatusIndicator 
                      status={word.status} 
                      error={word.error}
                    />
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-token-text-tertiary hover:text-token-text-secondary text-token-2xl"
                  >
                    ×
                  </button>
                </div>

                {isLoadingDetails ? (
                  <div className="text-center py-token-8">
                    <div className="animate-spin rounded-full h-token-8 w-token-8 border-b-2 border-token-accent mx-auto"></div>
                    <p className="mt-token-2 text-token-text-secondary">Loading word details...</p>
                  </div>
                ) : detailsError ? (
                  <div className="text-center py-token-8">
                    <p className="text-token-error mb-token-4">{detailsError}</p>
                    <Button
                      variant="primary"
                      onClick={fetchWordDetails}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (displayDefinition || displayExample || displaySynonyms || displayUsageTip) ? (
                  <div className="space-y-token-6">
                    {/* Definition */}
                    <div>
                      <h3 className="text-token-heading-lg font-token-semibold text-token-primary mb-token-2 flex items-center">
                        🧠 Definition
                      </h3>
                      <p className="text-token-text-secondary leading-relaxed">
                        {displayDefinition || 'No definition available'}
                      </p>
                    </div>

                    {/* Example Sentence */}
                    <div>
                      <h3 className="text-token-heading-lg font-token-semibold text-token-primary mb-token-2 flex items-center">
                        💬 Example
                      </h3>
                      <p className="text-token-text-secondary leading-relaxed italic">
                        {displayExample || 'No example available'}
                      </p>
                    </div>

                    {/* Synonyms */}
                    {displaySynonyms && displaySynonyms.length > 0 && (
                      <div>
                        <h3 className="text-token-heading-lg font-token-semibold text-token-primary mb-token-2 flex items-center">
                          🔗 Synonyms
                        </h3>
                        <div className="flex flex-wrap gap-token-2">
                          {displaySynonyms.map((synonym, index) => (
                            <span
                              key={index}
                              className="px-token-2 py-token-1 bg-token-surface-accent text-token-text-secondary rounded-token-sm text-token-body-sm"
                            >
                              {synonym}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Usage Tip */}
                    {displayUsageTip && (
                      <div>
                        <h3 className="text-token-heading-lg font-token-semibold text-token-primary mb-token-2 flex items-center">
                          💡 Usage Tip
                        </h3>
                        <p className="text-token-text-secondary leading-relaxed">
                          {displayUsageTip}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-token-8">
                    <p className="text-token-text-secondary">No additional details available for this word.</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-token-3 mt-token-8 pt-token-6 border-t border-token-surface-accent">
                  <Button
                    variant="tertiary"
                    onClick={handleCloseModal}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    variant="warning"
                    onClick={handleDelete}
                    className="flex-1"
                  >
                    Delete Word
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
