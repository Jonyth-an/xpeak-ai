'use client';
import React from 'react';

export default function TopicSampleSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-token rounded-token px-6 py-10 text-center max-w-3xl mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-token-accent/10 flex items-center justify-center text-token-accent text-xl">
            ✏️
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-token-text mb-1">AI-Generated Topic Sample</h3>
        <h4 className="text-lg font-bold text-token-accent mb-3">
          "Ordering Coffee Around the World"
        </h4>

        {/* Tags */}
        <div className="flex justify-center gap-2 mb-3">
          <span className="bg-token-accent-soft text-token-text-accent px-3 py-1 rounded-full text-xs font-medium">Travel</span>
          <span className="bg-token-accent-soft text-token-text-accent px-3 py-1 rounded-full text-xs font-medium">Culture</span>
        </div>

        {/* Vocabulary & Level */}
        <p className="text-sm text-token-text-secondary mb-1">
          <span className="font-medium text-token-text">Vocabulary:</span> espresso, latte, barista, menu, order
        </p>
        <p className="text-sm text-token-text-secondary mb-6">
          <span className="font-medium text-token-text">Level:</span> Intermediate
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button className="px-5 py-2 rounded-token font-semibold bg-white border border-token-border text-token-text hover:bg-token-muted transition-colors duration-200">
            Practice with AI
          </button>
          <button className="px-5 py-2 rounded-token font-semibold bg-token-accent text-token-text hover:bg-token-accent-dark transition-colors duration-200">
            Book Tutor for This Topic
          </button>
          <button className="px-5 py-2 rounded-token font-semibold bg-token-muted text-token-text-secondary hover:bg-token-border transition-colors duration-200">
            Save for Later
          </button>
        </div>
      </div>
    </section>
  );
} 