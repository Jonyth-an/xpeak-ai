'use client';
import React from 'react';
import { Button, Badge } from '@/app/components/ui';

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$89",
      lessons: "6 Lessons / month",
      features: [
        "1-on-1 sessions with top-rated tutors",
        "Full AI feature access",
        "Flexible lesson scheduling",
        "Cancel anytime"
      ],
      button: "Choose Starter",
      highlight: false,
    },
    {
      name: "Growth",
      price: "$159",
      lessons: "12 Lessons / month",
      features: [
        "1-on-1 sessions with top-rated tutors",
        "Full AI feature access",
        "Flexible lesson scheduling",
        "Cancel anytime"
      ],
      button: "Choose Growth",
      highlight: true,
    },
    {
      name: "Pro",
      price: "$219",
      lessons: "18 Lessons / month",
      features: [
        "1-on-1 sessions with top-rated tutors",
        "Full AI feature access",
        "Flexible lesson scheduling",
        "Cancel anytime"
      ],
      button: "Choose Pro",
      highlight: false,
    }
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your learning goals. All plans include our core features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              $0<span className="text-lg font-normal text-gray-600">/month</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                5 AI-generated topics per month
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Basic word maze features
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Community support
              </li>
            </ul>
            <Button variant="outline" className="w-full">
              Get Started Free
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-primary-500 p-8 text-center relative">
            <Badge variant="accent" className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              Most Popular
            </Badge>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Pro</h3>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              $19<span className="text-lg font-normal text-gray-600">/month</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited AI-generated topics
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Advanced word maze features
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                1-on-1 tutor sessions
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Priority support
              </li>
            </ul>
            <Button variant="accent" className="w-full">
              Start Pro Trial
            </Button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium</h3>
            <div className="text-3xl font-bold text-gray-900 mb-6">
              $39<span className="text-lg font-normal text-gray-600">/month</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Everything in Pro
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Unlimited tutor sessions
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Custom learning paths
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Dedicated success manager
              </li>
            </ul>
            <Button variant="outline" className="w-full">
              Start Premium Trial
            </Button>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            All plans include a 7-day free trial. No credit card required.
          </p>
          <Button variant="accent" size="lg">
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
}
  