'use client';
import React from 'react';
import { Button, Badge } from '@/app/components/ui';

export default function PlanTiersSection() {
  const plans = [
    {
      name: 'Starter',
      price: '$9',
      period: '/month',
      description: 'Perfect for beginners',
      features: [
        '5 AI-generated topics per month',
        'Basic word maze features',
        'Community support',
        'Mobile app access'
      ],
      buttonText: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
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
      popular: true
    },
    {
      name: 'Premium',
      price: '$39',
      period: '/month',
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
      popular: false
    }
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Learning Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start with our free trial and upgrade as you progress. All plans include our core AI-powered features.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-xl shadow-sm border p-8 ${
                plan.popular 
                  ? 'border-primary-500 shadow-lg ring-2 ring-primary-100' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <Badge variant="accent" className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="text-3xl font-bold text-gray-900">
                  {plan.price}
                  <span className="text-lg font-normal text-gray-600">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5">✓</span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.popular ? 'accent' : 'outline'}
                className="w-full"
              >
                {plan.buttonText}
              </Button>
            </div>
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