import React from 'react';

export default function ChangelogSection() {
  return (
    <section id="changelog" className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">📝 Latest Updates</h2>
        <p className="mb-4 text-gray-600">
          Catch up on our most recent releases and daily progress logs. From big features to important fixes, it's all here.
        </p>
        
        <ul className="space-y-2 mb-4">
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span className="text-gray-700"><strong>2025-06-26:</strong> Added daily summary prompt for Cursor-driven changelog.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span className="text-gray-700"><strong>2025-06-25:</strong> Launched "Bulk Import" UI and backend parser integration.</span>
          </li>
          <li className="flex items-start">
            <span className="text-gray-500 mr-2">•</span>
            <span className="text-gray-700"><strong>2025-06-24:</strong> Rolled out new "Community & Updates" page draft.</span>
          </li>
        </ul>
        
        <a 
          href="https://xpeakai.featurebase.app/changelog" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          View All Changelog Entries →
        </a>
      </div>
    </section>
  );
} 