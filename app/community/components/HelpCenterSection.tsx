import React from 'react';

export default function HelpCenterSection() {
  return (
    <section id="help-center" className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">❓ Need Help?</h2>
        <p className="mb-4 text-gray-600">
          FAQs, guides, and troubleshooting tips—everything you need to get the most out of the product.
        </p>
        
        <a 
          href="https://xpeakai.featurebase.app/help" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Visit Help Center →
        </a>
      </div>
    </section>
  );
} 