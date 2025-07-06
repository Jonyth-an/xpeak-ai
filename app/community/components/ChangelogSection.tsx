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
    <section id="changelog" className="py-12 bg-token-surface">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-3 text-text">📝 Latest Updates</h2>
        <p className="mb-4 text-text-tertiary">
          Catch up on our most recent releases and daily progress logs. From big features to important fixes, it's all here.
        </p>
        
        {loading ? (
          <div className="space-y-2 mb-4">
            <div className="animate-pulse">
              <div className="h-4 bg-token-surface-subtle rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-token-surface-subtle rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-token-surface-subtle rounded w-2/3"></div>
            </div>
          </div>
        ) : error ? (
          <div className="mb-4 p-3 bg-token-warning/10 border border-token-warning rounded-lg">
            <p className="text-token-warning text-sm">{error}</p>
            <p className="text-token-warning-dark text-sm mt-1">
              Check out our changelog for the latest updates.
            </p>
          </div>
        ) : (
          <ul className="space-y-3 mb-4">
            {changelogEntries.map((entry) => (
              <li key={entry.id} className="flex items-start group">
                <span className="text-text-tertiary mr-3 mt-1">•</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-text font-medium">{entry.title}</span>
                    <span className="text-text-tertiary text-sm">
                      {formatChangelogDate(entry.publishedAt)}
                    </span>
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">
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
                      className="inline-block text-token-accent hover:text-token-accent-dark text-sm mt-1 font-medium transition-colors"
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
          className="inline-block border border-token-border hover:border-token-primary text-text hover:text-token-primary px-4 py-2 rounded-lg font-medium transition-colors"
        >
          View All Changelog Entries →
        </a>
      </div>
    </section>
  );
} 