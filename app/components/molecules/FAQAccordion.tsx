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
        <Card key={idx} className="bg-surface rounded-token">
          <Button
            variant="ghost"
            onClick={() => toggle(idx)}
            className="w-full flex justify-between items-center py-1 px-2 min-h-0 focus:outline-none focus:ring-0 ring-0 outline-none"
          >
            <span className="text-text-primary">{item.question}</span>
            <span className="text-text-secondary">
              {openIndex === idx ? '−' : '+'}
            </span>
          </Button>
          {openIndex === idx && (
            <div className="pt-0.5 pb-2 px-2 text-text-secondary text-sm leading-tight">
              {item.answer}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
} 