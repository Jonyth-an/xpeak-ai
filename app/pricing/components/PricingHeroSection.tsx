import React from 'react';

export default function PricingHeroSection() {
  return (
    <section className="bg-gradient-to-r from-token-surface-subtle to-token-surface-accent py-token-20 px-token-4 sm:px-token-6 lg:px-token-8">
      <div className="container-token-lg mx-auto text-center">
        <h1 className="text-token-4xl md:text-token-5xl font-extrabold token-text-primary leading-tight mb-token-6">
          Start Your Language Journey,
          <br />
          <span className="text-token-primary bg-gradient-to-r from-token-primary to-token-accent bg-clip-text text-transparent">
            Backed by AI &amp; Real Coaches
          </span>
        </h1>
        <p className="text-token-lg token-text-secondary max-w-token-2xl mx-auto leading-relaxed">
          Level up your speaking confidence, one smart session at a time.
        </p>
      </div>
    </section>
  );
} 