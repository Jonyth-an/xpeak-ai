import React from 'react';
import Link from 'next/link';

export default function WordMazeSection() {
  return (
    <section className="py-token-12 bg-gradient-to-br from-token-surface-accent-light to-token-surface-accent">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-token-8">
        {/* Left: Text and CTA */}
        <div className="flex-1 min-w-[20rem]">
          <div className="flex items-center mb-token-6">
            <span className="inline-flex items-center justify-center w-token-16 h-token-16 rounded-token-xl bg-gradient-to-tr from-token-primary to-token-secondary text-white text-token-4xl mr-token-4">
              {/* Puzzle piece icon */}
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M7 9V7a2 2 0 0 1 2-2h2V3.5a1.5 1.5 0 1 1 3 0V5h2a2 2 0 0 1 2 2v2h1.5a1.5 1.5 0 1 1 0 3H19v2a2 2 0 0 1-2 2h-2v1.5a1.5 1.5 0 1 1-3 0V17H7a2 2 0 0 1-2-2v-2H3.5a1.5 1.5 0 1 1 0-3H5V7a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <h2 className="text-token-text text-token-display-xl md:text-token-display-2xl font-token-bold">
              From Words to Worlds
            </h2>
          </div>
          <p className="text-token-lg text-token-text-secondary mb-token-6 max-w-xl">
            Sagea tracks your vocabulary, recommends reviews, and links concepts — fueling your evolving Word Maze.
          </p>
          <Link href="/word-maze" legacyBehavior>
            <a className="inline-flex items-center bg-gradient-to-r from-token-primary to-token-secondary text-white font-token-bold py-token-4 px-token-6 rounded-token-full text-token-lg shadow-token-lg hover:from-token-primary-dark hover:to-token-secondary-dark transition">
              Explore Word Maze
              <span className="ml-token-2 text-token-2xl">→</span>
            </a>
          </Link>
        </div>
        {/* Right: Word Maze visual (placeholder SVG) */}
        <div className="flex-1 flex justify-center w-full">
          <svg width="340" height="120" viewBox="0 0 340 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <rect x="10" y="40" rx="20" width="90" height="40" fill="#fff" stroke="#b3c6f7" strokeWidth="2"/>
              <text x="55" y="65" textAnchor="middle" alignmentBaseline="middle" fontSize="20" fill="#3b4a6b">serendipity</text>
              <rect x="110" y="20" rx="20" width="80" height="40" fill="#fff" stroke="#b3c6f7" strokeWidth="2"/>
              <text x="150" y="45" textAnchor="middle" alignmentBaseline="middle" fontSize="20" fill="#3b4a6b">fortune</text>
              <rect x="210" y="40" rx="20" width="70" height="40" fill="#fff" stroke="#b3c6f7" strokeWidth="2"/>
              <text x="245" y="65" textAnchor="middle" alignmentBaseline="middle" fontSize="20" fill="#3b4a6b">luck</text>
              <rect x="80" y="80" rx="20" width="80" height="36" fill="#fff" stroke="#b3c6f7" strokeWidth="2"/>
              <text x="120" y="102" textAnchor="middle" alignmentBaseline="middle" fontSize="18" fill="#3b4a6b">chance</text>
              <rect x="170" y="80" rx="20" width="90" height="36" fill="#fff" stroke="#b3c6f7" strokeWidth="2"/>
              <text x="215" y="102" textAnchor="middle" alignmentBaseline="middle" fontSize="18" fill="#3b4a6b">destiny</text>
              {/* Lines connecting bubbles */}
              <line x1="100" y1="60" x2="110" y2="40" stroke="#b3c6f7" strokeWidth="2"/>
              <line x1="190" y1="40" x2="210" y2="60" stroke="#b3c6f7" strokeWidth="2"/>
              <line x1="90" y1="80" x2="55" y2="80" stroke="#b3c6f7" strokeWidth="2"/>
              <line x1="170" y1="80" x2="150" y2="60" stroke="#b3c6f7" strokeWidth="2"/>
              <line x1="245" y1="80" x2="245" y2="80" stroke="#b3c6f7" strokeWidth="2"/>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
} 