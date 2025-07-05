import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui';

export default function PlansPricingSection() {
  const plans = [
    {
      name: 'Free Plan',
      description: 'limited Maze & Sparks',
      features: ['Basic Word Maze', 'Limited Topic Sparks', 'Community Access']
    },
    {
      name: 'Spark Pro',
      description: 'AI-enhanced',
      features: ['Unlimited Sparks', 'AI-Powered Learning', 'Progress Tracking']
    },
    {
      name: 'Full Trek',
      description: 'Tutors + AI',
      features: ['Human Tutors', 'AI Coaching', 'Learning Treks']
    },
    {
      name: 'Crew Plan',
      description: 'Family or Learning Groups',
      features: ['Group Learning', 'Family Management', 'Shared Progress']
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Choose Your Path
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Find the perfect plan for your learning journey
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-xl font-bold text-text mb-2">
                {plan.name}
              </h3>
              <p className="text-text-muted text-sm mb-4">
                {plan.description}
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="text-sm text-text-muted flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing">
              <Button 
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                → Compare Plans
              </Button>
            </Link>
            <Link href="/signup">
              <Button 
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                → Start Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 