import React from 'react';
import Layout from '../../components/Layout';
import BecomeTutorHero from './components/BecomeTutorHero';
import TeachLanguageSection from './components/TeachLanguageSection';
import WhyTeachSection from './components/WhyTeachSection';
import OnboardingJourney from './components/OnboardingJourney';
import TutorBenefitsSection from './components/TutorBenefitsSection';
import FinalCTA from './components/FinalCTA';

export default function BecomeTutorPage() {
  return (
    <Layout>
      <BecomeTutorHero />
      <TeachLanguageSection />
      <WhyTeachSection />
      <OnboardingJourney />
      <TutorBenefitsSection />
      <FinalCTA />
    </Layout>
  );
} 