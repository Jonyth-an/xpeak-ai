'use client';

import React, { useState, useEffect } from 'react';
import { fetchRecentChangelog, formatChangelogDate } from '@/lib/changelog';

interface ChangelogEntry {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  url: string;
}

export default function ChangelogSection() {
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadChangelog() {
      try {
        setLoading(true);
        const entries = await fetchRecentChangelog(3);
        setChangelogEntries(entries);
        setError(null);
      } catch (err) {
        console.error('Failed to load changelog:', err);
        setError('Unable to load recent updates');
      } finally {
        setLoading(false);
      }
    }

    loadChangelog();
  }, []);

  return (
    <section id="changelog" className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">📝 Latest Updates</h2>
        <p className="mb-4 text-gray-600">
          Catch up on our most recent releases and daily progress logs. From big features to important fixes, it's all here.
        </p>
        
        {loading ? (
          <div className="space-y-2 mb-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ) : error ? (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
            <p className="text-yellow-700 text-sm mt-1">
              Check out our changelog for the latest updates.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 mb-4">
            {changelogEntries.map((entry) => (
              <li key={entry.id} className="flex items-start group">
                <span className="text-gray-500 mr-3 mt-1">•</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-700 font-medium">{entry.title}</span>
                    <span className="text-gray-500 text-sm">
                      {formatChangelogDate(entry.publishedAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {entry.content.length > 150 
                      ? `${entry.content.substring(0, 150)}...` 
                      : entry.content
                    }
                  </p>
                  {entry.url && (
                    <a 
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-600 hover:text-blue-800 text-sm mt-1 font-medium transition-colors"
                    >
                      Read more →
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        
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