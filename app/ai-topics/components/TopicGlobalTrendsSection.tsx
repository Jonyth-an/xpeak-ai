'use client';
import React from 'react';

const globalTrends = [
  {
    title: 'AI in Daily Life',
    tag: 'Tech',
  },
  {
    title: "Music that's Going Viral",
    tag: 'Culture',
  },
  {
    title: 'Biggest News Stories This Week',
    tag: 'News',
  },
  {
    title: 'Working Remotely Across Borders',
    tag: 'Work',
  },
];

export default function TopicGlobalTrendsSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-2xl font-bold text-primary mb-2">Trending Topics Around the World</h2>
        <p className="text-muted mb-10">Speak the Language of the Moment</p>
        <p className="text-sm text-foreground/80 mb-8 max-w-xl mx-auto">
          Stay in sync with global trends. These topics reflect what learners worldwide are exploring right now — powered by real-world data.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {globalTrends.map((topic, idx) => (
            <div
              key={idx}
              className="bg-white border border-border/40 rounded-token p-4 shadow-token hover:shadow-lg transition text-left"
            >
              <span className="text-xs font-semibold text-tag-foreground bg-tag px-2 py-0.5 rounded-full inline-block mb-2">
                {topic.tag}
              </span>
              <h3 className="text-md font-bold text-primary">{topic.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 