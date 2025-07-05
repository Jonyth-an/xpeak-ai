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
    <Layout>
      <TutorHeroSection />
      {/* How Sagea works? Section */}
      <section className="pt-8 pb-0 bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Flex layout with animation on left, content on right */}
          <div className="flex flex-col lg:flex-row items-start gap-12">
            {/* Left side: Animation */}
            <div className="w-full lg:w-[600px] lg:flex-shrink-0">
              <SageaAnimation />
            </div>
            
            {/* Right side: Header and Step cards */}
            <div className="flex-1 space-y-8 pl-0 lg:pl-16">
              {/* Header moved to right side */}
              <div className="text-left pt-16">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                  How Sagea works?
                </h2>
                <p className="text-xl text-text-secondary leading-relaxed">
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