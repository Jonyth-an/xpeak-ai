'use client';

import React, { useState } from 'react';
import { Card } from '../ui';
import { Button } from '../ui';
import { ArrowRight } from 'lucide-react';

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
          className={`transition-token-normal hover:shadow-token-md bg-white border-0`}
        >
          <button
            type="button"
            onClick={() => toggle(idx)}
            className={`w-full flex justify-between items-center p-token-4 min-h-0 focus:outline-none focus:ring-token-2 focus:ring-token-primary rounded-token-lg transition-token-normal hover:bg-token-surface-accent-light`}
            aria-expanded={openIndex === idx}
          >
            <span className={`text-base font-semibold text-left`}>{item.question}</span>
            <span className="token-text-secondary transition-transform duration-300">
              <ArrowRight className={`w-token-4 h-token-4 text-slate-500 transform ${openIndex === idx ? 'rotate-90' : ''}`} />
            </span>
          </button>
          {openIndex === idx && (
            <div className="pt-token-2 pb-token-4 px-token-4 text-slate-600 text-sm leading-relaxed border-t-token-border border-token-border-light">
              {item.answer}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
} 