import React from 'react';
import Layout from '../../components/Layout';
import TutorHeroSection from './components/TutorHeroSection';
import TutorValueCardsSection from './components/TutorValueCardsSection';
import GlobalCoachGridSection from './components/GlobalCoachGridSection';
import AmazingCoachesShowcase from './components/AmazingCoachesShowcase';
import SmartMatchingSection from './components/SmartMatchingSection';
import FinalCTASection from './components/FinalCTASection';


export default function TutorsPage() {
  return (
    <Layout>
      <TutorHeroSection />
      <TutorValueCardsSection />
      <GlobalCoachGridSection />
      <AmazingCoachesShowcase />
      <SmartMatchingSection />
      <FinalCTASection />
    </Layout>
  );
} 