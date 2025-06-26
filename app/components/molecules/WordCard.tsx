'use client';
import React from 'react';
import { Card, Button } from '../ui';

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
}: WordCardProps) {
  return (
    <Card 
      className={`relative p-6 hover:shadow-lg transition-shadow duration-200 rounded-token-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Delete button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete word"
      >
        ✕
      </Button>

      {/* Word content */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{word}</h3>
        
        {pronunciationUrls && (
          <div className="flex justify-center gap-2 mb-3">
            {pronunciationUrls.us && (
              <button className="text-sm text-blue-600 hover:text-blue-800">
                🇺🇸 US
              </button>
            )}
            {pronunciationUrls.uk && (
              <button className="text-sm text-blue-600 hover:text-blue-800">
                🇬🇧 UK
              </button>
            )}
            {pronunciationUrls.au && (
              <button className="text-sm text-blue-600 hover:text-blue-800">
                🇦🇺 AU
              </button>
            )}
          </div>
        )}

        <p className="text-gray-600 mb-4">{definition}</p>

        {imageUrl && (
          <div className="mb-4">
            <img
              src={imageUrl}
              alt={word}
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="text-sm text-gray-500">
          Added: {new Date(dateAdded).toLocaleDateString()}
        </div>
      </div>
    </Card>
  );
} 