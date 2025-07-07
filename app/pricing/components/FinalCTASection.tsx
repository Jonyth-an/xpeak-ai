import React from 'react';
import { Button } from '@/app/components/ui';

export default function FinalCTASection() {
  return (
    <section className="py-token-24 bg-token-primary text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-token-4xl md:text-token-5xl font-extrabold token-text-inverse mb-token-6">
          Ready to Begin Your Language Adventure?
        </h2>
        <p className="text-token-lg token-text-inverse mb-token-12 max-w-token-2xl mx-auto leading-relaxed">
          Join a new kind of learning journey — where AI meets human connection.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-token-6 sm:gap-token-8">
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="btn-token-primary transition-token-normal hover:shadow-token-lg hover:scale-token-105"
          >
            <a href="/signup">
              Start Learning
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-token-text-inverse text-token-text-inverse hover:bg-token-text-inverse hover:text-token-primary transition-token-normal hover:shadow-token-lg hover:scale-token-105"
          >
            <a href="/tutors">
              Explore Tutors
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
} 