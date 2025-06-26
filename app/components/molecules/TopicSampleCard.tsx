import React from 'react';
import { Card, Button } from '../ui';

export interface TopicSampleCardProps {
  sampleText: string;
  vocabWords?: string[];
  onBookTutor: () => void;
  onAddToLesson: () => void;
  onSave: () => void;
}

export default function TopicSampleCard({
  sampleText,
  vocabWords = [],
  onBookTutor,
  onAddToLesson,
  onSave,
}: TopicSampleCardProps) {
  return (
    <Card className="space-y-token-6 p-token-6 rounded-token-lg">
      <div className="prose prose-lg">
        <p>{sampleText}</p>
      </div>
      {vocabWords.length > 0 && (
        <div className="flex flex-wrap gap-token-2 mb-token-4">
          {vocabWords.map((word,i) => (
            <span key={i} className="bg-accent-light text-accent px-token-2 py-token-1 rounded-token text-xs">
              {word}
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-token-4">
        <Button variant="primary" onClick={onBookTutor} className="flex-1">
          Book a Tutor
        </Button>
        <Button variant="secondary" onClick={onAddToLesson} className="flex-1">
          Add to Current Reservation
        </Button>
        <Button variant="ghost" onClick={onSave} className="flex-1">
          Save Topic for Later
        </Button>
      </div>
    </Card>
  );
} 