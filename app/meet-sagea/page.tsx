import React, { Suspense } from 'react';
import Layout from '../../components/Layout';
import TutorHeroSection from './components/TutorHeroSection';
import TutorValueCardsSection from './components/TutorValueCardsSection';
import TestimonialSection from './components/TestimonialSection';
import FinalCTASection from './components/FinalCTASection';
import SageaAnimation from '../components/molecules/SageaAnimation';
import PlanTiersSection from '../pricing/components/PlanTiersSection';
import XpeakIntelligenceSection from './components/XpeakIntelligenceSection';
import WordMazeSection from './components/WordMazeSection';
import TopicSparksSection from './components/TopicSparksSection';
import LearningTreksSection from './components/LearningTreksSection';
import TutorsCrewSection from './components/TutorsCrewSection';

function MeetSageaPageInner() {
  return (
    <Layout heroBackgroundColor="linear-gradient(to bottom right, var(--color-surface-accent-light), var(--color-surface-accent))">
      <TutorHeroSection />
      {/* How Sagea works? Section */}
      <section className="pt-token-8 pb-0 bg-token-surface-subtle">
        <div className="container mx-auto px-4">
          {/* Flex layout with animation on left, content on right */}
          <div className="flex flex-col lg:flex-row items-start gap-token-8">
            {/* Left side: Animation */}
            <div className="w-full lg:w-[37.5rem] lg:flex-shrink-0">
              <SageaAnimation />
            </div>
            
            {/* Right side: Header and Step cards */}
            <div className="flex-1 space-y-token-8 pl-0 lg:pl-token-8">
              {/* Header moved to right side */}
              <div className="text-left pt-token-10">
                <h2 className="text-token-display-xl md:text-token-display-2xl font-token-bold text-token-text mb-token-4">
                  How Sagea works?
                </h2>
                <p className="text-token-lg text-token-text-secondary leading-token-relaxed">
                  From your very first word to your next real-world conversation — Sagea is always there, connecting the dots, lighting the path, and cheering you on.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <TutorValueCardsSection />
      <WordMazeSection />
      <TopicSparksSection />
      <LearningTreksSection />
      <TutorsCrewSection />
      <TestimonialSection />
      <XpeakIntelligenceSection />
      {/* Pricing Section - match home page */}
      <PlanTiersSection />
      <FinalCTASection />
    </Layout>
  );
}

export default function MeetSageaPage() {
  return (
    <Suspense>
      <MeetSageaPageInner />
    </Suspense>
  );
} 