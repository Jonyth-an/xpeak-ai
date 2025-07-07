import React from 'react';
import { Card, Button } from '../ui';

export interface PlanCardProps {
  name: string;
  price: string;
  billingCycle?: string;        // e.g. "/mo", "/yr"
  features: string[];e.g.features
  isPopular?: boolean;
  onSelect: () => void;
}

export default function PlanCard({
  name,
  price,
  billingCycle = '',
  features,
  isPopular = false,
  onSelect,
}: PlanCardProps) {
  return (
    <Card className="relative p-token-6 flex flex-col rounded-token-lg">
      {isPopular && (
        <div className="absolute -top-token-4 left-1/2 transform -translate-x-1/2 bg-secondary text-white px-token-3 py-token-1 rounded-token text-xs font-semibold">
          Popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-text-primary mt-token-4">
        {name}
      </h3>
      <div className="flex items-baseline mt-token-2 mb-token-4">
        <span className="text-4xl font-extrabold text-primary">
          {price}
        </span>
        <span className="ml-token-1 text-text-secondary">
          {billingCycle}
        </span>
      </div>
      <ul className="flex-1 space-y-token-2 mb-token-6">
        {features.map((feat, i) => (
          <li key={i} className="flex items-center text-text-secondary text-base">
            <span className="mr-token-2">✓</span>
            {feat}
          </li>
        ))}
      </ul>
      <Button variant="primary" onClick={onSelect} className="w-full">
        Select Plan
      </Button>
    </Card>
  );
} 