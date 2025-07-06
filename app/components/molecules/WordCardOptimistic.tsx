'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '../ui';
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
      className={`relative h-64 flex flex-col justify-between p-6 rounded-token-lg transition-all duration-200 bg-white shadow-token-md cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-blue-400 ${cardClassName} ${showModal ? 'z-40' : ''}`}
      onClick={() => setShowModalId(word.id)}
      tabIndex={0}
      role="button"
      aria-label={`Open details for ${word.word}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowModalId(word.id); }}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-token-primary">{word.word}</h3>
          <WordStatusIndicator 
            status={word.status} 
            error={word.error}
            className="ml-2"
          />
        </div>
        <div className="text-token-secondary text-base line-clamp-4">
          {displayDefinition || 'Loading definition...'}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-token-tertiary mt-2">
        <span>Added: {new Date(word.created_at).toLocaleDateString()}</span>
        {word.status === 'error' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRetrySync();
            }}
            className="text-token-accent hover:text-token-accent-dark text-xs"
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-token-primary">{word.word}</h2>
                    <WordStatusIndicator 
                      status={word.status} 
                      error={word.error}
                    />
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-token-tertiary hover:text-token-secondary text-2xl"
                  >
                    ×
                  </button>
                </div>

                {isLoadingDetails ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-token-accent mx-auto"></div>
                    <p className="mt-2 text-token-secondary">Loading word details...</p>
                  </div>
                ) : detailsError ? (
                  <div className="text-center py-8">
                    <p className="text-token-error mb-4">{detailsError}</p>
                    <button
                      onClick={fetchWordDetails}
                      className="px-4 py-2 bg-token-accent text-token-text-inverse rounded hover:bg-token-accent-dark"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (displayDefinition || displayExample || displaySynonyms || displayUsageTip) ? (
                  <div className="space-y-6">
                    {/* Definition */}
                    <div>
                      <h3 className="text-lg font-semibold text-token-primary mb-2 flex items-center">
                        🧠 Definition
                      </h3>
                      <p className="text-token-secondary leading-relaxed">
                        {displayDefinition || 'No definition available'}
                      </p>
                    </div>

                    {/* Example Sentence */}
                    <div>
                      <h3 className="text-lg font-semibold text-token-primary mb-2 flex items-center">
                        📘 Example Sentence
                      </h3>
                      <p className="text-token-secondary leading-relaxed italic">
                        {displayExample || 'No example available'}
                      </p>
                    </div>

                    {/* Synonyms */}
                    <div>
                      <h3 className="text-lg font-semibold text-token-primary mb-2 flex items-center">
                        🟡 Synonyms
                      </h3>
                      {displaySynonyms && displaySynonyms.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {displaySynonyms.map((synonym, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-token-warning/20 text-token-warning rounded-full text-sm"
                            >
                              {synonym}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-token-tertiary">No synonyms available</p>
                      )}
                    </div>

                    {/* Usage Tip */}
                    <div>
                      <h3 className="text-lg font-semibold text-token-primary mb-2 flex items-center">
                        💡 Usage Tip
                      </h3>
                      <p className="text-token-secondary leading-relaxed">
                        {displayUsageTip || 'No usage tip available'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-token-secondary">Click "Show more" to load detailed information</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-token">
                  <div className="flex justify-between items-center text-sm text-token-tertiary">
                    <span>Added: {new Date(word.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={handleDelete}
                      className="text-token-error hover:text-token-error-dark font-medium"
                    >
                      Delete Word
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <button
        className="absolute top-2 right-2 text-token-tertiary hover:text-token-secondary text-lg"
        onClick={e => {
          e.stopPropagation();
          handleDelete();
        }}
        aria-label="Delete"
      >
        ×
      </button>
    </Card>
  );
}
