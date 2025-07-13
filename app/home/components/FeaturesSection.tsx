import React from 'react';
import Text from '@/app/components/ui/Text';
import FeatureCard from '../../components/ui/FeatureCard';

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Learning',
    description: 'Personalized learning paths adapted to your pace and style with advanced AI algorithms.',
    iconAnimation: 'pulse' as const
  },
  {
    icon: '👥',
    title: 'Expert Tutors',
    description: 'Connect with native speakers and certified language teachers from around the world.',
    iconAnimation: 'bounce' as const
  },
  {
    icon: '🎯',
    title: 'Smart Practice',
    description: 'Intelligent exercises that focus on your weak areas and reinforce your strengths.',
    iconAnimation: 'spin' as const
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description: 'Detailed analytics and insights to monitor your learning journey and celebrate milestones.',
    iconAnimation: 'pulse' as const
  },
  {
    icon: '🌍',
    title: 'Cultural Immersion',
    description: 'Learn not just the language, but also the culture and context behind the words.',
    iconAnimation: 'bounce' as const
  },
  {
    icon: '⚡',
    title: 'Flexible Learning',
    description: 'Study anytime, anywhere with our mobile-first approach and offline capabilities.',
    iconAnimation: 'spin' as const
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Why Choose Xpeak AI?
          </h2>
          <Text variant="lead" className="max-w-3xl mx-auto">
            Our platform combines cutting-edge AI technology with human expertise to create the most effective language learning experience.
          </Text>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              icon={feature.icon} 
              title={feature.title}
              size="lg"
              variant="elevated"
              iconSize="xl"
              iconAnimation={feature.iconAnimation}
              align="center"
            >
              {feature.description}
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  );
} 