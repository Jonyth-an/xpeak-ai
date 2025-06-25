import React from 'react';

export default function PricingHeroSection() {
  return (
    <section className="bg-gradient-to-r from-indigo-50 to-cyan-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text">
          Start Your Language Journey,{' '}
          <span className="text-indigo-600">Backed by AI &amp; Real Coaches</span>
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          Level up your speaking confidence, one smart session at a time.
        </p>
      </div>
    </section>
  );
} 