import React from 'react';
import Layout from '../../components/Layout';
import FAQAccordion, { FAQItem } from '@/app/components/molecules/FAQAccordion';

import PricingHeroSection from '@/app/pricing/components/PricingHeroSection';
import TrialPackSection from '@/app/pricing/components/TrialPackSection';
import PlanTiersSection from '@/app/pricing/components/PlanTiersSection';
import TopUpSection from '@/app/pricing/components/TopUpSection';
import FinalCTASection from '@/app/pricing/components/FinalCTASection';

const faqItems: FAQItem[] = [
  { question: "What happens if I miss a lesson?", answer: "No worries — you can reschedule as long as you cancel in advance, or carry forward unused credits within the billing cycle." },
  { question: "Can I switch tutors?",       answer: "Absolutely! Try different tutors to find your best fit." },
  { question: "Can I cancel anytime?",      answer: "Yes. You can cancel your subscription from your account settings at any time." },
  { question: "How many trial packs?",      answer: "Up to 3 times per account — to help you explore and find your perfect coach." },
  { question: "Do all plans include AI features?", answer: "Yes. Every plan comes with full access to our AI suite, including Word Maze and Progress Tracker." },
];

export default function PricingPage() {
  return (
    <Layout>
      <PricingHeroSection />   {/* Hero / gradient header */}
      <TrialPackSection />     {/* 🎁 Paid Trial Pack */}
      <PlanTiersSection />     {/* Choose Your Plan (Starter/Growth/Pro) */}
      <TopUpSection />         {/* ➕ Top-Up Packs & Benefits */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-text mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-text-muted">
              Everything you need to know about learning with Xpeak
            </p>
          </div>
          <FAQAccordion items={faqItems} />
        </div>
      </section>
      <FinalCTASection />      {/* Final CTA – Ready to Begin */}
    </Layout>
  );
} 