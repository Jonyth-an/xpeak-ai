import React from 'react';
import Link from 'next/link';

export default function XpeakIntelligenceSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          {/* Rocket Icon */}
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 text-4xl">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M2 16.5L9.5 9.5M14.5 4.5L19.5 9.5M9.5 9.5L14.5 4.5M9.5 9.5L14.5 14.5M14.5 14.5L19.5 9.5M14.5 14.5L12 22M12 22L9.5 14.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        <h2 className="text-slate-900 text-4xl md:text-5xl font-extrabold mb-4">
          The Intelligence Behind Sagea
        </h2>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-8">
          Xpeak AI is the adaptive brain that powers Sagea — generating Sparks, managing Treks, and weaving together your learning across all formats.
        </p>
        <div className="flex justify-center mt-6">
          <Link href="/xpeakai" legacyBehavior>
            <a className="inline-flex items-center border-2 border-indigo-300 rounded-full px-8 py-4 text-lg font-semibold text-slate-900 hover:bg-indigo-50 transition shadow-md">
              Learn About Xpeak AI
              <span className="ml-2 text-xl">→</span>
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
} 