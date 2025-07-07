import React from 'react';
import { Button } from '@/app/components/ui/Button';

export default function TeachLanguageSection() {
  return (
    <section className="bg-token-surface py-token-20 px-token-4 sm:px-token-6 lg:px-token-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-token-3xl md:text-token-4xl font-bold token-text-primary mb-token-4">
          Teach the Language You Know
        </h2>
        <p className="text-token-lg token-text-secondary mb-token-8">
          We're currently accepting applications for English tutors.  
          Interested in teaching Chinese or Spanish? Join our waitlist and be the first to know when those languages open.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-token-4">
          <Button
            variant="primary"
            size="lg"
            href="/become-a-tutor?lang=en"
          >
            Apply for English Tutor
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="border-token-primary text-token-primary hover:bg-token-primary/10"
            href="/become-a-tutor?lang=zh&waitlist=true"
          >
            Join Chinese Waitlist
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="border-token-primary text-token-primary hover:bg-token-primary/10"
            href="/become-a-tutor?lang=es&waitlist=true"
          >
            Join Spanish Waitlist
          </Button>
        </div>
      </div>
    </section>
  );
} 