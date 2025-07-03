import React from 'react';
import FeatureCard from '../../components/ui/FeatureCard';
import SmartMatchFeature, { SmartMatchFeatureItem } from '@/app/components/molecules/SmartMatchFeature';

const features: SmartMatchFeatureItem[] = [
  {
    icon: '🔍',
    title: 'Recommended Coaches',
    text: 'Based on popular picks in your country or region.'
  },
  {
    icon: '🧭',
    title: 'Matched by Learning Goal',
    text: 'Get paired with tutors who helped others like you.'
  },
  {
    icon: '🧠',
    title: 'Context-Aware Matching',
    text: 'The more you learn, the better our AI understands what you need and who fits your style.'
  }
];

export default function SmartMatchingSection() {
  return (
    <SmartMatchFeature
      title="Let AI Help You Find the Right Coach"
      description="Finding your ideal tutor shouldn't be a guessing game. With Xpeak's smart matching system, you get recommendations based on what actually matters to you."
      features={features}
      footerText="Switch anytime. Explore freely. Learn your way."
      iconAnimation="bounce"
      cardVariant="default"
    />
  );
} 