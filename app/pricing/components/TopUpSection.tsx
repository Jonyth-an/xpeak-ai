'use client';
import React from 'react';
import { Button, Badge } from '@/app/components/ui';
import TopUpPackCard from '../../components/molecules/TopUpPackCard';

export default function TopUpSection() {
  const packs = [
    { 
      id: 'p20', 
      lessons: 20, 
      description: 'Top up 20 lessons anytime', 
      buttonLabel: 'Top Up 20', 
      comingSoon: false 
    },
    { 
      id: 'p50', 
      lessons: 50, 
      description: 'Top up 50 lessons anytime', 
      buttonLabel: 'Top Up 50', 
      comingSoon: false 
    },
    { 
      id: 'p100', 
      lessons: 100, 
      description: 'Top up 100 lessons anytime', 
      buttonLabel: 'Top Up 100', 
      comingSoon: true 
    },
  ];

  function handlePurchase(id: string) {
    console.log(`Purchase top-up pack: ${id}`);
    // Add your purchase logic here
  }

  return (
    <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Need More Lessons?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Top up your account with additional lessons whenever you need them. Perfect for when you want extra practice.
          </p>
        </div>

        {/* Top-Up Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packs.map((pack) => (
            <TopUpPackCard
              key={pack.lessons}
              lessons={pack.lessons}
              description={pack.description}
              buttonLabel={pack.buttonLabel}
              onPurchase={() => handlePurchase(pack.id)}
              isComingSoon={pack.comingSoon}
            />
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Top-up lessons are valid for 6 months and can be used with any tutor on the platform.
          </p>
          <p className="text-sm text-gray-500">
            Questions about top-ups? <a href="#" className="text-primary-600 hover:text-primary-700">Contact support</a>
          </p>
        </div>
      </div>
    </section>
  );
} 