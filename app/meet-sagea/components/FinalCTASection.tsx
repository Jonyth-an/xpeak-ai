import React from 'react';
import Link from 'next/link';

export default function FinalCTASection() {
  return (
    <section className="w-full bg-gradient-to-r from-token-primary to-token-secondary py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-token-text-inverse text-4xl md:text-5xl font-extrabold text-center mb-4">
          "You don't just learn words. You explore a world."
        </h2>
        <p className="text-token-text-inverse/80 text-lg max-w-xl mx-auto mt-4 mb-8">
        "Sagea will be with you — every word, every spark, every step."
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link href="/signup" legacyBehavior>
            <a className="bg-token-surface text-token-primary font-semibold py-3 px-6 rounded-lg hover:bg-token-surface-subtle shadow-md transition text-center">
              → Start Learning with Sagea
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
} 