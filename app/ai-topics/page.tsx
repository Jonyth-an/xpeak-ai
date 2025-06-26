import React from 'react';
import Layout from '../../components/Layout';
import SmartMatchFeature, { SmartMatchFeatureItem } from '@/app/components/molecules/SmartMatchFeature';
import TopicHeroSection from './components/TopicHeroSection';
import TopicInputSection from './components/TopicInputSection';
import TopicSampleSection from './components/TopicSampleSection';
import TopicSuggestionsSection from './components/TopicSuggestionsSection';
import TopicLocalTrendsSection from './components/TopicLocalTrendsSection';
import TopicGlobalTrendsSection from './components/TopicGlobalTrendsSection';
import TopicPacksSection from './components/TopicPacksSection';

const aiTopicFeatures: SmartMatchFeatureItem[] = [
  {
    icon: '🎯',
    title: 'Personalized Topic Generation',
    text: 'AI creates topics based on your interests, learning level, and conversation history.'
  },
  {
    icon: '📈',
    title: 'Trending & Relevant Content',
    text: 'Stay current with topics that are popular and relevant in your target language.'
  },
  {
    icon: '🔄',
    title: 'Adaptive Learning Path',
    text: 'Topics evolve as you progress, keeping your learning fresh and challenging.'
  }
];

export default function AITopicsPage() {
  return (
    <Layout>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <TopicHeroSection />
      </section>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <TopicInputSection />
      </section>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <TopicSampleSection />
      </section>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <TopicSuggestionsSection />
      </section>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <TopicLocalTrendsSection />
      </section>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <TopicGlobalTrendsSection />
      </section>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <TopicPacksSection />
      </section>
      <SmartMatchFeature
        title="AI-Powered Topic Discovery"
        description="Discover engaging topics that match your interests and learning level. Our AI analyzes your preferences to suggest the perfect conversation starters."
        features={aiTopicFeatures}
        footerText="Explore topics that spark your curiosity and drive your learning."
        iconAnimation="pulse"
        cardVariant="elevated"
        className="bg-gradient-to-r from-blue-50 to-indigo-50"
      />
    </Layout>
  );
} 