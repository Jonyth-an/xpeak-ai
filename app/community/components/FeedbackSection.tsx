import React from 'react';

export default function FeedbackSection() {
  return (
    <section id="feedback" className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">🗣️ Tell Us What You Need</h2>
        <p className="mb-4 text-gray-600">
          Have an idea, pain point, or tweak in mind? Submit it below, vote on other community suggestions, and watch your top-voted requests rise to the top.
        </p>
        
        {/* Featurebase Feedback Widget Placeholder */}
        <div className="embed-widget mb-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Featurebase Feedback Widget</p>
          <p className="text-sm text-gray-400">Embed your Featurebase widget here</p>
        </div>
        
        <a 
          href="https://xpeakai.featurebase.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Go to Feedback Portal →
        </a>
      </div>
    </section>
  );
} 