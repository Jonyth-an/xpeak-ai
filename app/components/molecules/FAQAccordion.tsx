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
            className="w-full flex justify-between items-center p-token-4"
          >
            <span className="text-text-primary">{item.question}</span>
            <span className="text-text-secondary">
              {openIndex === idx ? '−' : '+'}
            </span>
          </Button>
          {openIndex === idx && (
            <div className="pt-token-2 pb-token-4 px-token-4 text-text-secondary">
              {item.answer}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
} 