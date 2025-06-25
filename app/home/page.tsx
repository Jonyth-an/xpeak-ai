"use client"

import React from 'react';
import Layout from '../../components/Layout';
import FeaturesSection from "./components/FeaturesSection";
import MasterySection from "./components/MasterySection";
import PricingSection from "./components/PricingSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FinalCTASection from "./components/FinalCTASection";
import LoginForm from '../components/molecules/LoginForm';
import Link from 'next/link';
import { Button, Text } from '@/app/components/ui';
import ConfirmationModal from '../components/molecules/ConfirmationModal';

export default function HomePage() {
  const [showModal, setShowModal] = React.useState(false);

  const handleLogin = (data: { email: string; password: string }) => {
    console.log('Login attempt:', data);
    // Here you would typically handle authentication
    alert(`Login attempt with email: ${data.email}`);
  };

  const handleDelete = () => {
    setShowModal(false);
    alert('Action confirmed!');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Text variant="h1" as="h1" className="mb-6">
            Master Any Language with AI-Powered Learning
          </Text>
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
          {/* Demo Confirmation Modal Button */}
          <div className="mt-8">
            <Button variant="accent" onClick={() => setShowModal(true)}>
              Show Confirmation Modal
            </Button>
          </div>
        </div>
        <ConfirmationModal
          open={showModal}
          title="Are you sure?"
          description="This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
        />
      </section>

      {/* Login Form Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Text variant="h2" as="h2" className="mb-4">
              Already have an account?
            </Text>
            <Text variant="body" className="text-gray-600">
              Sign in to continue your language learning journey
            </Text>
          </div>
          <LoginForm onSubmit={handleLogin} />
        </div>
      </section>

      {/* What Makes Xpeak Different Section */}
      <FeaturesSection />

      {/* Next-Gen Language Mastery Section */}
      <MasterySection />

      {/* Pricing Section */}
      <PricingSection />    

      {/* Testimonials Section */}
      <TestimonialsSection />  

      {/* Final CTA Section */}
      <FinalCTASection />   
    </Layout>
  );
} 