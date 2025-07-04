import React from 'react';
import Layout from '../../components/Layout';
import TutorHeroSection from './components/TutorHeroSection';
import TutorValueCardsSection from './components/TutorValueCardsSection';
import TestimonialSection from './components/TestimonialSection';
import FinalCTASection from './components/FinalCTASection';

export default function MeetSageaPage() {
  return (
    <Layout>
      <TutorHeroSection />
      <TutorValueCardsSection />
      <TestimonialSection />
      <FinalCTASection />
    </Layout>
  );
} 