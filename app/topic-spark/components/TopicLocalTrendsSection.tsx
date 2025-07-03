'use client';
import React from 'react';
import TopicCard from '../../components/molecules/TopicCard';

const localTopics = [
  {
    id: 1,
    title: 'Describe Your City to a Tourist',
    preview: 'Learn how to showcase your hometown to visitors with confidence and cultural insight.',
    tag: 'Culture',
    region: 'Your Region',
  },
  {
    id: 2,
    title: 'What Ramadan Means to Me',
    preview: 'Share personal experiences and traditions during this sacred month.',
    tag: 'Tradition',
    region: 'Middle East',
  },
  {
    id: 3,
    title: 'Most Popular Street Foods in Thailand',
    preview: 'Explore the vibrant world of Thai street cuisine and food culture.',
    tag: 'Food',
    region: 'Southeast Asia',
  },
];

export default function TopicLocalTrendsSection() {
  const handlePractice = (topicId: number) => {
    console.log(`Practice topic ${topicId}`);
    // Add your practice logic here
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-token-text mb-2">Loved in Your Region</h2>
        <p className="text-token-text-secondary mb-10">Trending with Learners Near You</p>
        <p className="text-sm text-token-text-secondary mb-8 max-w-xl mx-auto">
          Popular topics among students in your region. Tailored to local culture, trends, and events.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {localTopics.map((topic) => (
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