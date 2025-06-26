import React from 'react';
import Layout from '../../components/Layout';
import SmartMatchFeature, { SmartMatchFeatureItem } from '@/app/components/molecules/SmartMatchFeature';

// empty sub‐components; we'll fill these next
import HeroSection from './components/HeroSection';
import QuickAddOptionsSection from './components/QuickAddOptionsSection';
import MyWordBankSection from './components/MyWordBankSection';

const wordMazeFeatures: SmartMatchFeatureItem[] = [
  {
    icon: '🧩',
    title: 'Smart Word Collection',
    text: 'Automatically collect and organize words from your conversations and lessons.'
  },
  {
    icon: '🎮',
    title: 'Interactive Review',
    text: 'Practice with gamified exercises that adapt to your learning pace and style.'
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    text: 'See your vocabulary growth with detailed analytics and personalized insights.'
  }
];

export default function WordMazePage() {
  return (
    <Layout>
      <HeroSection />
      <QuickAddOptionsSection />
      <MyWordBankSection />
      <SmartMatchFeature
        title="Smart Vocabulary Building"
        description="Transform your conversations into a powerful vocabulary learning system. Every word you encounter becomes part of your personalized learning journey."
        features={wordMazeFeatures}
        footerText="Build your vocabulary one conversation at a time."
        iconAnimation="spin"
        cardVariant="outlined"
        className="bg-gradient-to-r from-green-50 to-emerald-50"
      />
    </Layout>
  );
} 