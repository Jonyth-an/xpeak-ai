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
    <div className="space-y-4">
      {items.map((item, idx) => (
        <Card key={idx} className="bg-token-surface rounded-lg">
          <Button
            variant="ghost"
            onClick={() => toggle(idx)}
            className="w-full flex justify-between items-center py-1 px-2 min-h-0 focus:outline-none focus:ring-0 ring-0 outline-none"
          >
            <span className="token-text-primary">{item.question}</span>
            <span className="token-text-secondary">
              {openIndex === idx ? '−' : '+'}
            </span>
          </Button>
          {openIndex === idx && (
            <div className="pt-0.5 pb-2 px-2 token-text-secondary text-sm leading-tight">
              {item.answer}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
} 