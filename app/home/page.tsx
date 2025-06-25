"use client"

import React from 'react';
import Layout from '../../components/Layout';
import FeaturesSection from "./components/FeaturesSection";
import MasterySection from "./components/MasterySection";
import PricingSection from "./components/PricingSection";
import TestimonialsSection from "./components/TestimonialsSection";
import FinalCTASection from "./components/FinalCTASection";
import Link from 'next/link';

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-16 pb-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text leading-tight">
                  Your Smartest Way to Begin a <span className="text-indigo-600">Language Adventure</span>
                </h1>
                <p className="text-xl text-text-secondary leading-relaxed">
                  AI-Optimized, Human-Guided, Real-World Ready.<br />
                  Learn faster and stay motivated through smart tools + real coaching.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/signup" 
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <span role="img" aria-label="rocket" className="mr-2">🚀</span>Start Learning
                </Link>
                <Link 
                  href="/tutors" 
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                >
                  <span role="img" aria-label="sparkles" className="mr-2">✨</span>Explore Tutors
                </Link>
              </div>
            </div>
            {/* Right Side - Hero Visual Placeholder */}
            <div className="flex justify-center lg:justify-end mt-10 lg:mt-0">
              <div className="relative">
                <div className="w-full max-w-md h-96 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <span className="text-6xl block mb-4">🌍</span>
                    <p className="text-lg font-semibold">Your Adventure Starts Here</p>
                    <p className="text-sm opacity-75">(Future image or animation)</p>
                  </div>
                </div>
                {/* Floating elements for visual appeal */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full opacity-80 animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full opacity-80 animate-pulse"></div>
              </div>
            </div>
          </div>
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