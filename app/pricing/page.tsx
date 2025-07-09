'use client';

import React, { Suspense } from 'react';
import Layout from '../../components/Layout';

import PlanTiersSection from '@/app/pricing/components/PlanTiersSection';
import FAQSection from '@/app/pricing/components/FAQSection';
import FinalCTASection from '@/app/pricing/components/FinalCTASection';

function PricingPageInner() {
  return (
    <Layout heroBackgroundColor="linear-gradient(to right, var(--color-surface-subtle), var(--color-surface-accent))">
      <PlanTiersSection />
      <FAQSection />
      <FinalCTASection />
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