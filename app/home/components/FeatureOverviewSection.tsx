import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui';

export default function FeatureOverviewSection() {
  const features = [
    {
      icon: '✅',
      title: 'Word Maze',
      description: 'Learn words by unlocking a maze of meaning.',
      detail: 'Your vocabulary journey becomes a game of discovery — powered by AI and context-aware reviews.',
      cta: 'Explore Word Maze',
      href: '/word-maze'
    },
    {
      icon: '✅',
      title: 'Topic Sparks',
      description: 'New ideas, auto-generated, just for you.',
      detail: 'Sparks are personalized prompts that turn into full lessons, podcasts, or tutor sessions.',
      cta: 'Ignite a Topic Spark',
      href: '/topic-spark'
    },
    {
      icon: '✅',
      title: 'Learning Treks',
      description: 'Trek through your progress.',
      detail: 'Your sparks form a constellation of interconnected topics — a roadmap that adapts as you learn.',
      cta: 'View Trek Map',
      href: '/meet-sagea'
    },
    {
      icon: '✅',
      title: 'Sagea',
      description: 'The partner that ties it all together.',
      detail: 'Sagea tracks your learning, nudges your progress, and personalizes your experience — with heart and intelligence.',
      cta: 'Meet Sagea',
      href: '/meet-sagea'
    },
    {
      icon: '✅',
      title: 'Human & AI Tutors',
      description: 'Guidance, support, and context.',
      detail: 'Match with tutors based on your goals, while Sagea ensures the learning stays continuous.',
      cta: 'Find Your Tutor',
      href: '/meet-sagea'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Feature Overview Cards
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Discover the tools that make Xpeak AI the most comprehensive language learning platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-border hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-text mb-3">
                {feature.title}
              </h3>
              <p className="text-text-muted mb-4 font-medium">
                {feature.description}
              </p>
              <p className="text-text-muted text-sm mb-6 leading-relaxed">
                {feature.detail}
              </p>
              <Link href={feature.href}>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  → {feature.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 