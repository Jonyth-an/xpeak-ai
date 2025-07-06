import React from 'react';

export default function PricingHeroSection() {
  return (
    <section className="bg-gradient-to-r from-token-surface-subtle to-token-surface-accent py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold token-text-primary leading-tight">
          Start Your Language Journey,
          <br />
          <span className="text-token-primary">Backed by AI &amp; Real Coaches</span>
        </h1>
        <p className="mt-4 text-lg token-text-secondary">
          Level up your speaking confidence, one smart session at a time.
        </p>
      </div>
    </section>
  );
} 