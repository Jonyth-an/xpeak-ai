'use client';

import React from 'react';
import Layout from '../../components/Layout';
import CommunityHeroSection from './components/CommunityHeroSection';
import FeedbackSection from './components/FeedbackSection';
import RoadmapSection from './components/RoadmapSection';
import ChangelogSection from './components/ChangelogSection';
import HelpCenterSection from './components/HelpCenterSection';
import StayConnectedSection from './components/StayConnectedSection';

export default function CommunityPage() {
  return (
    <Layout>
      <CommunityHeroSection />
      <FeedbackSection />
      <RoadmapSection />
      <ChangelogSection />
      <HelpCenterSection />
      <StayConnectedSection />
    </Layout>
  );
} 