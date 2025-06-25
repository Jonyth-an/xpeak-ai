// app/home/components/WhatMakesDifferent.tsx

import React from 'react';
import { Card, Text } from '@/app/components/ui';

const differences = [
  {
    icon: '🎯',
    title: 'Personalized Learning',
    description: 'AI adapts to your learning style, pace, and goals for maximum efficiency.'
  },
  {
    icon: '🤝',
    title: 'Human + AI Partnership',
    description: 'Combine the best of AI technology with real human expertise and cultural insights.'
  },
  {
    icon: '📈',
    title: 'Proven Results',
    description: 'Students learn 3x faster and retain information longer with our methods.'
  },
  {
    icon: '🌍',
    title: 'Real-World Focus',
    description: 'Learn practical language skills you can use immediately in real situations.'
  }
];

export default function WhatMakesDifferent() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Text variant="h2" className="mb-4">
            What Makes Xpeak Different?
          </Text>
          <Text variant="lead" className="max-w-3xl mx-auto">
            We're not just another language app. We're a complete learning ecosystem designed for real results.
          </Text>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {differences.map((item, index) => (
            <Card key={index} variant="elevated" padding="lg" className="text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <Text variant="h3" className="mb-2">
                {item.title}
              </Text>
              <Text variant="body" className="text-text-muted">
                {item.description}
              </Text>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
  