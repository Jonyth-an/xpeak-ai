'use client';
import React from 'react';
import TopicCard from '../../components/molecules/TopicCard';

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
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-token-text mb-2">Trending Topics Around the World</h2>
        <p className="text-token-text-secondary mb-10">Speak the Language of the Moment</p>
        <p className="text-sm text-token-text-secondary mb-8 max-w-xl mx-auto">
          Stay in sync with global trends. These topics reflect what learners worldwide are exploring right now — powered by real-world data.
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