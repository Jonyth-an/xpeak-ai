'use client';
import React from 'react';
import { Button, Badge } from '@/app/components/ui';

export default function TopUpSection() {
  const topUpOptions = [
    {
      id: 1,
      name: 'Quick Top-Up',
      lessons: 3,
      price: 45,
      savings: null,
      popular: false
    },
    {
      id: 2,
      name: 'Value Pack',
      lessons: 6,
      price: 80,
      savings: 'Save 11%',
      popular: true
    },
    {
      id: 3,
      name: 'Bulk Pack',
      lessons: 12,
      price: 150,
      savings: 'Save 17%',
      popular: false
    }
  ];

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
          {topUpOptions.map((option) => (
            <div
              key={option.id}
              className={`relative bg-white rounded-xl shadow-sm border p-8 text-center ${
                option.popular 
                  ? 'border-primary-500 shadow-lg ring-2 ring-primary-100' 
                  : 'border-gray-200'
              }`}
            >
              {option.popular && (
                <Badge variant="accent" className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Best Value
                </Badge>
              )}

              {/* Option Header */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.name}</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ${option.price}
              </div>
              <p className="text-gray-600 mb-4">{option.lessons} lessons</p>

              {/* Savings Badge */}
              {option.savings && (
                <div className="mb-6">
                  <Badge variant="success" size="sm">
                    {option.savings}
                  </Badge>
                </div>
              )}

              {/* Features */}
              <ul className="text-left space-y-2 mb-8 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Valid for 6 months
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Use with any tutor
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  No expiration fees
                </li>
              </ul>

              {/* CTA Button */}
              <Button
                variant={option.popular ? 'accent' : 'outline'}
                className="w-full"
              >
                Purchase Top-Up
              </Button>
            </div>
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