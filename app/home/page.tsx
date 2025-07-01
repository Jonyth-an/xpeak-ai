"use client"

import React from 'react';
import Layout from '../../components/Layout';
import FeaturesSection from "./components/FeaturesSection";
import MasterySection from "./components/MasterySection";
import PlanTiersSection from "../pricing/components/PlanTiersSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FinalCTASection from "./components/FinalCTASection";
import Link from 'next/link';
import { Button, Text } from '@/app/components/ui';

export default function HomePage() {
  const handleLogin = (data: { email: string; password: string }) => {
    console.log('Login attempt:', data);
    // Here you would typically handle authentication
    alert(`Login attempt with email: ${data.email}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text leading-tight mb-6">
            Master Any Language with AI-Powered Learning
          </h1>
          <Text variant="lead" className="mb-8 max-w-3xl mx-auto">
            Join millions of learners worldwide who are mastering new languages faster than ever with personalized AI tutors and smart learning paths.
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button 
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Start Learning Free
              </Button>
            </Link>
            <Link href="/tutors">
              <Button 
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Meet Our Tutors
              </Button>
            </Link>
          </div>
          <div className="mt-12">
            <Text variant="body" weight="semibold" className="text-gray-600">
              Your Adventure Starts Here
            </Text>
          </div>
        </div>
      </section>

      {/* What Makes Xpeak Different Section */}
      <FeaturesSection />

      {/* Next-Gen Language Mastery Section */}
      <MasterySection />

      {/* Pricing Section */}
      <PlanTiersSection />    

      {/* Testimonials Section */}
      <TestimonialsSection />  

      {/* Final CTA Section */}
      <FinalCTASection />   
    </Layout>
  );
} 