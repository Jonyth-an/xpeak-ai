import React from 'react';

export default function FeedbackSection() {
  return (
    <section id="feedback" className="py-12 bg-token-surface">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-3 text-text">🗣️ Tell Us What You Need</h2>
        <p className="mb-4 text-text-tertiary">
          Have an idea, pain point, or tweak in mind? Submit it below, vote on other community suggestions, and watch your top-voted requests rise to the top.
        </p>
        
        {/* Featurebase Feedback Widget Placeholder */}
        <div className="embed-widget mb-4 bg-token-surface-subtle border-2 border-dashed border-token-border rounded-lg p-8 text-center">
          <p className="text-text-secondary mb-4">Featurebase Feedback Widget</p>
          <p className="text-sm text-text-tertiary">Embed your Featurebase widget here</p>
        </div>
        
        <a 
          href="https://xpeakai.featurebase.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block border border-token-border hover:border-token-primary text-text hover:text-token-primary px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Go to Feedback Portal →
        </a>
      </div>
    </section>
  );
} 