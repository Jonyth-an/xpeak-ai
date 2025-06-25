import React from 'react';
import Layout from '../../components/Layout';

// empty sub‐components; we'll fill these next
import HeroSection from './components/HeroSection';
import BulkAddSection from './components/BulkAddSection';
import QuickAddOptionsSection from './components/QuickAddOptionsSection';
import CollectionSection from './components/CollectionSection';
import ReviewSection from './components/ReviewSection';
import AchievementsSection from './components/AchievementsSection';

export default function WordMazePage() {
  return (
    <Layout>
      <HeroSection />
      <BulkAddSection />
      <QuickAddOptionsSection />
      <CollectionSection />
      <ReviewSection />
      <AchievementsSection />
    </Layout>
  );
} 