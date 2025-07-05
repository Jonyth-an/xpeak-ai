'use client';

import React, { Suspense } from 'react';
import Layout from '../../components/Layout';

import PricingHeroSection from '@/app/pricing/components/PricingHeroSection';
import PlanTiersSection from '@/app/pricing/components/PlanTiersSection';
import FAQSection from '@/app/pricing/components/FAQSection';
import FinalCTASection from '@/app/pricing/components/FinalCTASection';

function PricingPageInner() {
  return (
    <Layout>
      <PricingHeroSection />   {/* Hero / gradient header */}
      <PlanTiersSection />     {/* Choose Your Plan (Starter/Growth/Pro) */}
      <FAQSection />           {/* FAQ Section */}
      <FinalCTASection />      {/* Final CTA – Ready to Begin */}
    </Layout>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingPageInner />
    </Suspense>
  );
} 