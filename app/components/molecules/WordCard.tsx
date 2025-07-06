'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';

export interface WordCardProps {
  id: string;
  word: string;
  pronunciationUrls?: {
    us?: string;
    uk?: string;
    au?: string;
  };
  definition: string;
  imageUrl?: string;
  dateAdded: string;
  onDelete: () => void;
  onClick?: () => void;
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

export default function WordCard({
  id,
  word,
  pronunciationUrls,
  definition,
  imageUrl,
  dateAdded,
  onDelete,
  onClick,
  showModal,
  setShowModalId,
  cardClassName = '',
}: WordCardProps) {
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [wordDetails, setWordDetails] = useState<WordDetails | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

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
        body: JSON.stringify({ word }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch details: ${response.statusText}`);
      }
      
      const details = await response.json();
      setWordDetails(details);
    } catch (error) {
      console.error('Error fetching word details:', error);
      setDetailsError('Failed to load word details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleShowMore = () => {
    setShowModalId(id);
  };

  const handleCloseModal = () => {
    setShowModalId(null);
    setWordDetails(null);
    setDetailsError(null);
  };

  // Fetch details when modal opens
  useEffect(() => {
    if (showModal && !wordDetails && !isLoadingDetails && !detailsError) {
      fetchWordDetails();
    }
  }, [showModal]);

  return (
    <Card
      className={`relative h-64 flex flex-col justify-between p-6 rounded-token-lg transition-all duration-200 bg-token-surface shadow-token-md cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-token-accent ${cardClassName} ${showModal ? 'z-40' : ''}`}
      onClick={() => setShowModalId(id)}
      tabIndex={0}
      role="button"
      aria-label={`Open details for ${word}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowModalId(id); }}
    >
      <div>
        <h3 className="text-xl font-bold mb-2 text-token-primary">{word}</h3>
        <div className="text-token-secondary text-base line-clamp-4">
          {definition}
        </div>
      </div>
      <div className="text-sm text-token-tertiary mt-2">
        Added: {new Date(dateAdded).toLocaleDateString()}
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
              className="bg-token-elevated rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-token-primary mb-2">{word}</h2>
                    {pronunciationUrls && (
                      <div className="flex gap-2">
                        {pronunciationUrls.us && (
                          <audio controls className="h-8">
                            <source src={pronunciationUrls.us} type="audio/mpeg" />
                          </audio>
                        )}
                      </div>
                    )}
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
                ) : wordDetails ? (
                  <div className="space-y-6">
                    {/* Definition */}
                    <div>
                      <h3 className="text-lg font-semibold text-token-primary mb-2 flex items-center">
                        🧠 Definition
                      </h3>
                      <p className="text-token-secondary leading-relaxed">
                        {wordDetails.definition || 'No definition available'}
                      </p>
                    </div>

                    {/* Example Sentence */}
                    <div>
                      <h3 className="text-lg font-semibold text-token-primary mb-2 flex items-center">
                        📘 Example Sentence
                      </h3>
                      <p className="text-token-secondary leading-relaxed italic">
                        {wordDetails.example || 'No example available'}
                      </p>
                    </div>

                    {/* Synonyms */}
                    <div>
                      <h3 className="text-lg font-semibold text-token-primary mb-2 flex items-center">
                        🟡 Synonyms
                      </h3>
                      {wordDetails.synonyms && wordDetails.synonyms.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {wordDetails.synonyms.map((synonym, index) => (
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
                        {wordDetails.usageTip || 'No usage tip available'}
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
                    <span>Added: {new Date(dateAdded).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="text-token-error hover:text-token-error-dark font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 text-token-tertiary hover:text-token-secondary text-lg"
        aria-label={`Delete ${word}`}
      >
        ×
      </button>
    </Card>
  );
} 