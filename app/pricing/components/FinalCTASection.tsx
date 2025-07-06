import React from 'react';
import { Button } from '@/app/components/ui';

export default function FinalCTASection() {
  return (
    <section className="py-20 bg-token-primary text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-token-text-inverse mb-4">
        Ready to Begin Your Language Adventure?
      </h2>
      <p className="text-lg text-token-text-inverse mb-10">
        Join a new kind of learning journey — where AI meets human connection.
      </p>
      <div className="flex justify-center gap-8">
        <Button
          asChild
          variant="secondary"
          size="lg"
        >
          <a href="/signup">
            Start Learning
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="border-token-text-inverse text-token-text-inverse hover:bg-token-text-inverse hover:text-token-primary"
        >
          <a href="/tutors">
            Explore Tutors
          </a>
        </Button>
      </div>
    </section>
  );
} 