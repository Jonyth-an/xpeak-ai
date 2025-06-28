import React from 'react';
import Link from 'next/link';

export default function CommunityHeroSection() {
  return (
    <section id="hero" className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">
          Be Part of the Xpeak AI Journey!
        </h1>
        <p className="text-xl mb-6 text-gray-700">
          See what we're building, tell us what matters to you, and follow our progress.
        </p>
        <p className="mb-8 text-gray-600">
          Join a community of makers who shape and refine the tools they use every day—no more accepting a one-size-fits-all product. Your voice drives every feature!
        </p>
        <Link 
          href="#feedback" 
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Give Feedback Today
        </Link>
      </div>
    </section>
  );
} 