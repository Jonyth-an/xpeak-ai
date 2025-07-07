import React from 'react';
import { Button, Textarea } from '@/app/components/ui';

export default function TopicInputSection() {
  return (
    <section className="bg-white py-token-16 px-token-4">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-token-12">
        <h2 className="text-token-heading-xl font-token-bold text-token-primary mb-token-2">
          <span role="img" aria-label="target">🎯</span> Design Your Perfect Lesson Topic — Powered by AI
        </h2>
        <p className="text-token-body-lg text-token-text-secondary">
          Learning on Xpeak starts with you. Create a topic tailored to your goals, life, or curiosity — and we'll turn it into your next smart session.
        </p>
      </div>

      {/* Co‐Create Form */}
      <div className="max-w-2xl mx-auto bg-token-surface-accent-light rounded-token-lg p-token-8 shadow-token-md">
        <Textarea
          className="w-full mb-token-4 text-token-body-lg"
          placeholder="Describe your dream lesson, e.g. 'Ordering food in a Paris café' or 'Debate: Is AI a friend or foe?'"
          rows={4}
        />
        <div className="flex flex-col sm:flex-row gap-token-4 justify-center mt-token-4">
          <Button variant="primary" size="md">
            Generate Topic
          </Button>
          <Button variant="secondary" size="md">
            Surprise Me
          </Button>
        </div>
      </div>
    </section>
  );
} 