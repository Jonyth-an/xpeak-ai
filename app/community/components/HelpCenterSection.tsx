import React from 'react';

export default function HelpCenterSection() {
  return (
    <section id="help-center" className="py-12 bg-token-surface-subtle">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-3 text-text">❓ Need Help?</h2>
        <p className="mb-4 text-text-tertiary">
          FAQs, guides, and troubleshooting tips—everything you need to get the most out of the product.
        </p>
        
        <a 
          href="https://xpeakai.featurebase.app/help" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-token-primary hover:bg-token-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Visit Help Center →
        </a>
      </div>
    </section>
  );
} 