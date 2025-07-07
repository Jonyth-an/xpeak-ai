'use client';
import React from 'react';
import TopicCard from '../../components/molecules/TopicCard';
import { Card } from '@/app/components/ui';

const globalTrends = [
  {
    id: 1,
    title: 'AI in Daily Life',
    preview: 'Discuss how artificial intelligence is transforming our everyday experiences.',
    tag: 'Tech',
  },
  {
    id: 2,
    title: "Music that's Going Viral",
    preview: 'Explore trending songs and musical phenomena across different cultures.',
    tag: 'Culture',
  },
  {
    id: 3,
    title: 'Biggest News Stories This Week',
    preview: 'Stay informed about current events and practice discussing world news.',
    tag: 'News',
  },
  {
    id: 4,
    title: 'Working Remotely Across Borders',
    preview: 'Share experiences about the global shift to remote work and digital nomadism.',
    tag: 'Work',
  },
];

export default function TopicGlobalTrendsSection() {
  const handlePractice = (topicId: number) => {
    console.log(`Practice topic ${topicId}`);
    // Add your practice logic here
  };

  return (
    <section className="py-token-16 px-token-4 bg-token-surface-accent">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-token-heading-xl font-token-bold text-token-primary mb-token-6 text-center">
          🌍 See where your next Spark will take you.
        </h2>
        <p className="text-token-body-lg text-token-text-secondary mb-token-12 text-center">
          Explore trending topics from learners worldwide. Get inspired and join the conversation!
        </p>
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {globalTrends.map((topic) => (
            <TopicCard
              key={topic.id}
              title={topic.title}
              preview={topic.preview}
              tag={topic.tag}
              onPractice={() => handlePractice(topic.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 