import React from 'react';
import { Card, Button } from '../ui';

export interface TopUpPackCardProps {
  lessons: number;
  description: string;
  buttonLabel: string;
  onPurchase: () => void;
  isComingSoon?: boolean;
}

export default function TopUpPackCard({
  lessons,
  description,
  buttonLabel,
  onPurchase,
  isComingSoon = false,
}: TopUpPackCardProps) {
  return (
    <Card className="flex flex-col p-token-6 text-center space-y-token-4 rounded-token-lg">
      <div>
        <h3 className="text-2xl font-bold text-text-primary mb-token-2">
          {lessons} Lessons
        </h3>
        <p className="text-text-secondary text-base">{description}</p>
      </div>
      <Button
        variant="secondary"
        onClick={onPurchase}
        disabled={isComingSoon}
        className="mt-auto"
      >
        {isComingSoon ? 'Coming Soon' : buttonLabel}
      </Button>
    </Card>
  );
} 