'use client';

import React, { useState } from 'react';
import { Card } from '../ui';
import { Button } from '../ui';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-token-4">
      {items.map((item, idx) => (
        <Card 
          key={idx} 
          className={`card-token-interactive transition-token-normal hover:shadow-token-md ${openIndex === idx ? 'bg-token-surface-accent-light border-0' : 'bg-token-surface border-0'}`}
        >
          <Button
            variant="ghost"
            onClick={() => toggle(idx)}
            className={`w-full flex justify-between items-center py-token-4 px-token-4 min-h-0 focus:outline-none focus:ring-token-2 focus:ring-token-primary rounded-token-lg transition-token-normal hover:bg-token-surface-accent-light`}
          >
            <span className={`token-text-primary text-left ${openIndex === idx ? 'font-semibold' : 'font-medium'}`}>{item.question}</span>
            <span className="token-text-secondary text-token-lg font-bold transition-token-normal transform">
              {openIndex === idx ? '−' : '+'}
            </span>
          </Button>
          {openIndex === idx && (
            <div className="pt-token-0 pb-token-4 px-token-4 token-text-secondary text-token-sm leading-relaxed border-t-token-border border-token-border-light">
              {item.answer}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
} 