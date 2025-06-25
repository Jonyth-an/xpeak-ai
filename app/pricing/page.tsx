import React from 'react';
import Layout from '../../components/Layout';

import PricingHeroSection    from './components/PricingHeroSection';
import TrialPackSection       from './components/TrialPackSection';
import PlanTiersSection       from './components/PlanTiersSection';
import TopUpSection           from './components/TopUpSection';
import FAQSection             from './components/FAQSection';
import FinalCTASection        from './components/FinalCTASection';

export default function PricingPage() {
  return (
    <Layout>
      <PricingHeroSection />   {/* Hero / gradient header */}
      <TrialPackSection />     {/* 🎁 Paid Trial Pack */}
      <PlanTiersSection />     {/* Choose Your Plan (Starter/Growth/Pro) */}
      <TopUpSection />         {/* ➕ Top-Up Packs & Benefits */}
      <FAQSection />           {/* Frequently Asked Questions */}
      <FinalCTASection />      {/* Final CTA – Ready to Begin */}
    </Layout>
  );
} 