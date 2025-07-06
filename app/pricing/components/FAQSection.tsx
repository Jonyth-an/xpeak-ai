'use client';

import React from 'react';
import FAQAccordion, { FAQItem } from '@/app/components/molecules/FAQAccordion';

const faqs: FAQItem[] = [
  {
    question: "Is Xpeak AI free to use?",
    answer:
      "Yes! Xpeak AI offers a Free Plan that includes limited weekly access to our AI tutors. It's a great way to explore the experience before committing to a subscription.",
  },
  {
    question: "What's included in the subscription plan?",
    answer:
      "The Pro Plan includes:\n\nUnlimited AI tutor conversations (fair-use limits apply)\n\nFull access to co-create custom topics and Word Maze\n\nPriority access to new features\n\nLonger session duration and more memory per session",
  },
  {
    question: "What happens when I run out of AI tutor minutes?",
    answer:
      "You can either:\n\nWait until your next billing cycle resets, or\n\nTop up with a one-time pack of additional minutes. These credits stay in your account for 6 months.",
  },
  {
    question: "Can I pause or cancel my subscription?",
    answer:
      "Yes. You can cancel anytime, and your plan will remain active until the end of your billing cycle. Pause functionality will be available in the future.",
  },
  {
    question: "Will I lose my Word Maze progress or saved topics if I cancel?",
    answer:
      "No. Your progress, saved vocabulary, and co-created topics will stay saved. When you return or upgrade again, you can pick up right where you left off.",
  },
  {
    question: "Can I use Xpeak AI on mobile and desktop?",
    answer:
      "Yes! Your account works seamlessly across desktop and mobile (with some mobile-exclusive features like 'Add Words from Photos').",
  },
  {
    question: "How do I know how many minutes I've used or have left?",
    answer:
      "Your dashboard shows your usage stats, including:\n\nMinutes used this month\n\nMinutes remaining\n\nNext renewal date\n\nWe'll also send friendly reminders as you approach your limits.",
  },
];

export default function FAQSection() {
  return (
    <section className="bg-token-surface py-16 px-4 sm:px-6 lg:px-8">
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

        {/* FAQ Accordion */}
        <div className="space-y-3">
          <FAQAccordion items={faqs} />
        </div>
      </div>
    </section>
  );
} 