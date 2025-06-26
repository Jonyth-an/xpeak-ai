'use client';
import React from 'react';
import { Button, Badge, ToggleGroup, ToggleGroupOption } from '@/app/components/ui';
import PlanCard from '../../components/molecules/PlanCard';
import { useState } from 'react';

export default function PlanTiersSection() {
  const plans = [
    {
      id: 1,
      name: 'Starter',
      price: '$9',
      billingCycle: '/month',
      description: 'Perfect for beginners',
      features: [
        '5 AI-generated topics per month',
        'Basic word maze features',
        'Community support',
        'Mobile app access'
      ],
      buttonText: 'Start Free Trial',
      isPopular: false
    },
    {
      id: 2,
      name: 'Pro',
      price: '$19',
      billingCycle: '/month',
      description: 'Most popular choice',
      features: [
        'Unlimited AI-generated topics',
        'Advanced word maze features',
        '1-on-1 tutor sessions (2/month)',
        'Priority support',
        'Progress analytics',
        'Custom learning paths'
      ],
      buttonText: 'Start Pro Trial',
      isPopular: true
    },
    {
      id: 3,
      name: 'Premium',
      price: '$39',
      billingCycle: '/month',
      description: 'For serious learners',
      features: [
        'Everything in Pro',
        'Unlimited tutor sessions',
        'Custom learning paths',
        'Dedicated success manager',
        'Advanced analytics',
        'Priority booking'
      ],
      buttonText: 'Start Premium Trial',
      isPopular: false
    }
  ];

  const billingOptions: ToggleGroupOption[] = [
    { label: 'Monthly', value: 'month' },
    { label: <><span>Quarterly</span><span className="text-green-600 font-semibold ml-1">Save 10%</span></>, value: 'quarter' },
    { label: <><span>Yearly</span><span className="text-green-600 font-semibold ml-1">Save 20%</span></>, value: 'year' },
  ];
  const [billing, setBilling] = useState<string>('month');

  const handleSelectPlan = (planId: number) => {
    console.log(`Selected plan ${planId}`);
    // Add your plan selection logic here
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Learning Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start with our free trial and upgrade as you progress. All plans include our core AI-powered features.
          </p>
        </div>
        {/* Billing Period Selector */}
        <div className="flex justify-center mb-12">
          <ToggleGroup
            options={billingOptions}
            value={billing}
            onChange={setBilling}
          />
        </div>
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              billingCycle={
                billing === 'month' ? '/month' :
                billing === 'quarter' ? '/quarter' :
                billing === 'year' ? '/year' :
                plan.billingCycle
              }
              features={plan.features}
              isPopular={plan.isPopular}
              onSelect={() => handleSelectPlan(plan.id)}
            />
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            All plans include a 7-day free trial. No credit card required.
          </p>
          <p className="text-sm text-gray-500">
            Need a custom plan? <a href="#" className="text-primary-600 hover:text-primary-700">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
} 