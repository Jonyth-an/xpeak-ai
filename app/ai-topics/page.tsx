import React from 'react';
import Layout from '../../components/Layout';
import TopicHeroSection from './components/TopicHeroSection';
import TopicInputSection from './components/TopicInputSection';
import TopicSampleSection from './components/TopicSampleSection';
import TopicSuggestionsSection from './components/TopicSuggestionsSection';
import TopicLocalTrendsSection from './components/TopicLocalTrendsSection';
import TopicGlobalTrendsSection from './components/TopicGlobalTrendsSection';
import TopicPacksSection from './components/TopicPacksSection';

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
    </Layout>
  );
} 