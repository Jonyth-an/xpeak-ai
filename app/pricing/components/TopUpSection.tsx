'use client';
import React from 'react';
import { Card, Badge, Button, Text } from '@/app/components/ui';

export default function TopUpSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Top-Up Packs</h2>
          <p className="text-gray-600 text-base">
            Need more hours? Add on anytime. Available for all Plus and Pro users.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <Card className="flex-1 flex flex-col items-center p-6">
            <div className="text-lg font-medium mb-2">1 Extra Hour</div>
            <div className="text-gray-500 mb-4 text-sm">of AI tutoring</div>
            <div className="text-2xl font-bold mb-4">$5</div>
            <Button variant="primary" className="w-full">Add 1 Hour</Button>
          </Card>
          <Card className="flex-1 flex flex-col items-center p-6">
            <div className="text-lg font-medium mb-2">5 Extra Hours <Badge className='ml-2 bg-gray-200 text-gray-700 text-xs font-semibold'>Save 20%</Badge></div>
            <div className="text-gray-500 mb-4 text-sm">of AI tutoring</div>
            <div className="text-2xl font-bold mb-4">$20</div>
            <Button variant="primary" className="w-full">Add 5 Hours</Button>
          </Card>
        </div>
        <div className="flex flex-col md:flex-row gap-4 text-gray-500 text-sm mb-2">
          <div className="flex items-center gap-2">
            <span role="img" aria-label="clock">⏲️</span>
            Sessions expire in 3 months
          </div>
          <div className="flex items-center gap-2">
            <span role="img" aria-label="bell">🔔</span>
            Auto-reminder when you run low
          </div>
        </div>
      </div>
    </section>
  );
} 