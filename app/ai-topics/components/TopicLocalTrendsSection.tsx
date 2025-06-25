'use client';
import React from 'react';

const localTopics = [
  {
    title: 'Describe Your City to a Tourist',
    tag: 'Culture',
    region: 'Your Region',
  },
  {
    title: 'What Ramadan Means to Me',
    tag: 'Tradition',
    region: 'Middle East',
  },
  {
    title: 'Most Popular Street Foods in Thailand',
    tag: 'Food',
    region: 'Southeast Asia',
  },
];

export default function TopicLocalTrendsSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-primary mb-2">Loved in Your Region</h2>
        <p className="text-muted mb-10">Trending with Learners Near You</p>
        <p className="text-sm text-foreground/80 mb-8 max-w-xl mx-auto">
          Popular topics among students in your region. Tailored to local culture, trends, and events.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {localTopics.map((topic, idx) => (
            <div key={idx} className="bg-white rounded-token shadow-token p-4 hover:shadow-lg transition text-left">
              <span className="text-xs font-semibold text-tag-foreground bg-tag px-2 py-0.5 rounded-full inline-block mb-2">
                {topic.tag}
              </span>
              <h3 className="text-md font-bold text-primary mb-2">{topic.title}</h3>
              <p className="text-xs text-muted-foreground">Region: {topic.region}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 