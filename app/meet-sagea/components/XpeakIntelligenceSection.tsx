import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';

export default function XpeakIntelligenceSection() {
  return (
    <section className="py-token-12 bg-gradient-to-br from-token-accent-50 to-token-primary-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-token-6">
          {/* Rocket Icon */}
          <span className="inline-flex items-center justify-center w-token-16 h-token-16 rounded-token-full bg-token-primary-100 text-token-primary text-token-4xl">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M2 16.5L9.5 9.5M14.5 4.5L19.5 9.5M9.5 9.5L14.5 4.5M9.5 9.5L14.5 14.5M14.5 14.5L19.5 9.5M14.5 14.5L12 22M12 22L9.5 14.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        <h2 className="text-token-text text-token-display-xl md:text-token-display-2xl font-token-extrabold mb-token-4">
          The Intelligence Behind Sagea
        </h2>
        <p className="text-token-xl text-token-text-secondary max-w-2xl mx-auto mb-token-8">
          Xpeak AI is the adaptive brain that powers Sagea — generating Sparks, managing Treks, and weaving together your learning across all formats.
        </p>
        <div className="flex justify-center mt-token-6">
          <Link href="/xpeakai">
            <Button variant="secondary" size="lg">
              Learn About Xpeak AI
              <span className="ml-token-2 text-token-xl">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 