import React from 'react';

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="py-12 bg-token-surface-subtle">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-3 text-text">🛣️ Contribute to the Xpeak AI Roadmap</h2>
        <p className="mb-4 text-text-tertiary">
          Transparency is everything. See what's in development, what's next in research, and what we're planning—straight from our product team.
        </p>
        
        {/* Roadmap Embed Placeholder */}
        <div className="embed-widget mb-4 bg-token-surface border-2 border-dashed border-token-border rounded-lg p-8 text-center shadow-sm">
          <p className="text-text-secondary mb-4">Roadmap Embed</p>
          <p className="text-sm text-text-tertiary">Embed a live roadmap view or screenshot carousel</p>
        </div>
        
        <a 
          href="https://xpeakai.featurebase.app/roadmap" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block border border-token-border hover:border-token-primary text-text hover:text-token-primary px-4 py-2 rounded-lg font-medium transition-colors"
        >
          View Full Roadmap →
        </a>
      </div>
    </section>
  );
} 