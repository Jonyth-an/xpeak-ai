'use client';

import React, { Suspense } from 'react';
import Layout from '../../components/Layout';

import PlanTiersSection from '@/app/pricing/components/PlanTiersSection';
import FAQSection from '@/app/pricing/components/FAQSection';
import FinalCTASection from '@/app/pricing/components/FinalCTASection';

function PricingPageInner() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PlanTiersSection />     {/* Choose Your Plan (Starter/Growth/Pro) */}
        <FAQSection />           {/* FAQ Section */}
        <FinalCTASection />      {/* Final CTA – Ready to Begin */}
      </div>
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