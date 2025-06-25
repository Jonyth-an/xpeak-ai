'use client';

import { useState } from 'react';
import { Button, Card } from '@/app/components/ui';

const faqs = [
  {
    question: 'What happens if I miss a lesson?',
    answer:
      'No worries — you can reschedule as long as you cancel in advance, or carry forward unused credits within the billing cycle.',
  },
  {
    question: 'Can I switch tutors?',
    answer: 'Absolutely! Try different tutors to find your best fit.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. You can cancel your subscription from your account settings at any time.',
  },
  {
    question: 'How many times can I purchase a trial pack?',
    answer: 'Up to 3 times per account — to help you explore and find your perfect coach.',
  },
  {
    question: 'Do all plans include AI features?',
    answer:
      'Yes. Every plan comes with full access to our AI suite, including Word Maze and Progress Tracker.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-text mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-text-muted">
            Everything you need to know about learning with Xpeak
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card
              key={idx}
              variant="default"
              padding="none"
              className="overflow-hidden"
            >
              <Button
                onClick={() => toggle(idx)}
                variant="ghost"
                className="w-full flex justify-between items-center px-6 py-4 text-left h-auto"
              >
                <span className="font-semibold text-text">
                  {faq.question}
                </span>
                <span className="text-primary-600 text-2xl">
                  {openIndex === idx ? '−' : '+'}
                </span>
              </Button>
              {openIndex === idx && (
                <div className="px-6 pb-4 text-text-secondary">{faq.answer}</div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 