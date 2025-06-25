import React from 'react';
import { Card, Text } from '@/app/components/ui';

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Learning',
    description: 'Personalized learning paths adapted to your pace and style with advanced AI algorithms.'
  },
  {
    icon: '👥',
    title: 'Expert Tutors',
    description: 'Connect with native speakers and certified language teachers from around the world.'
  },
  {
    icon: '🎯',
    title: 'Smart Practice',
    description: 'Intelligent exercises that focus on your weak areas and reinforce your strengths.'
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description: 'Detailed analytics and insights to monitor your learning journey and celebrate milestones.'
  },
  {
    icon: '🌍',
    title: 'Cultural Immersion',
    description: 'Learn not just the language, but also the culture and context behind the words.'
  },
  {
    icon: '⚡',
    title: 'Flexible Learning',
    description: 'Study anytime, anywhere with our mobile-first approach and offline capabilities.'
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Text variant="h2" className="mb-4">
            Why Choose Xpeak AI?
          </Text>
          <Text variant="lead" className="max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with human expertise to create the most effective language learning experience.
          </Text>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} variant="elevated" padding="lg" className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <Text variant="h3" className="mb-2">
                {feature.title}
              </Text>
              <Text variant="body" className="text-text-muted">
                {feature.description}
              </Text>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 