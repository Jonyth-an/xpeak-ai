import React from 'react';

export default function TrialPackSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto border-2 border-yellow-200 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left column: Features */}
          <ul className="space-y-3 flex-1">
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>1 Lesson • 30 Minutes</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>Try any tutor on the platform</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>Full access to all AI features</span>
            </li>
            <li className="flex items-center">
              <span className="text-blue-500 mr-3">ℹ️</span>
              <span>Up to 3 trial packs per user</span>
            </li>
          </ul>

          {/* Right column: Price & CTA */}
          <div className="text-center flex-1 space-y-4">
            <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
              <span>🎁</span>
              <span>Paid Trial Pack</span>
            </h2>
            <div className="text-4xl font-bold text-yellow-600">$12</div>
            <p className="text-sm text-text-muted">One-time purchase, no auto-renew</p>
            <button className="mt-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition">
              Try Now
            </button>
            <p className="text-xs text-text-secondary">Perfect for testing the waters before you commit</p>
          </div>
        </div>
      </div>
    </section>
  );
} 