'use client';
import React from 'react';
import Link from 'next/link';

const topicPacks = [
  { emoji: '🌟', title: 'Saudi 2030: Talk About the Future of KSA' },
  { emoji: '🏆', title: 'World Cup Conversations' },
  { emoji: '✈️', title: 'Immigration & Moving Abroad' },
  { emoji: '🧧', title: 'Celebrate Lunar New Year' },
];

export default function TopicPacksSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-token-text mb-2">📦 Special Topic Packs</h2>
        <p className="text-token-text-secondary mb-6">Explore Special Editions</p>
        <p className="text-sm text-token-text-secondary mb-10 max-w-lg mx-auto">
          Dive into curated series around global events, holidays, or cultural themes — from the World Cup to Lunar New Year.
        </p>

        {/* Pack Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {topicPacks.map((pack, idx) => (
            <div
              key={idx}
              className="bg-white border border-border/40 rounded-token p-6 shadow-token hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{pack.emoji}</div>
              <h3 className="text-lg font-semibold text-primary mb-2">{pack.title}</h3>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/ai-topics/packs"
          className="inline-block px-8 py-3 bg-token-accent text-token-text font-semibold rounded-token shadow-token hover:bg-token-accent-dark transition"
        >
          View All Packs
        </Link>
      </div>
    </section>
  );
} 