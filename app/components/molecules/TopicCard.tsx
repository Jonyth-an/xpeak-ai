import React from 'react';
import { Card, Button } from '../ui';

export interface TopicCardProps {
  title: string;
  preview: string;
  tag: string;
  onPractice: () => void;
}

export default function TopicCard({
  title,
  preview,
  tag,
  onPractice,
}: TopicCardProps) {
  return (
    <Card className="flex flex-col justify-between p-token-6 space-y-token-4 rounded-token-lg">
      <div>
        <span className="inline-block text-xs font-semibold bg-accent-light text-accent px-token-2 py-token-1 rounded-token mb-token-2">
          {tag}
        </span>
        <h3 className="text-token-2xl font-bold text-text-primary mb-token-2">
          {title}
        </h3>
        <p className="text-text-secondary text-base">{preview}</p>
      </div>
      <Button variant="primary" onClick={onPractice} className="mt-auto">
        Practice
      </Button>
    </Card>
  );
} 