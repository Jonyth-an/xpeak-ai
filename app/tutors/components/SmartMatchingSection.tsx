import React from 'react';
import { Card } from '@/app/components/ui';

const features = [
  {
    icon: '🔍',
    title: 'Recommended Coaches',
    text: 'Based on popular picks in your country or region.'
  },
  {
    icon: '🧭',
    title: 'Matched by Learning Goal',
    text: 'Get paired with tutors who helped others like you.'
  },
  {
    icon: '🧠',
    title: 'Context-Aware Matching',
    text: 'The more you learn, the better our AI understands what you need and who fits your style.'
  }
];

export default function SmartMatchingSection() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-text text-center">
          Let AI Help You Find the Right Coach
        </h2>
        <p className="text-lg text-text-muted mt-4 mb-10 text-center max-w-2xl mx-auto">
          Finding your ideal tutor shouldn't be a guessing game. With Xpeak's smart matching system, you get recommendations based on what actually matters to you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {features.map((f, idx) => (
            <Card
              key={idx}
              variant="default"
              padding="lg"
              className="flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-200 group"
            >
              <div className="text-5xl mb-4 group-hover:animate-bounce">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-text mb-2">{f.title}</h3>
              <p className="text-text-muted text-base">{f.text}</p>
            </Card>
          ))}
        </div>
        <div className="italic text-center text-text-muted text-lg">
          Switch anytime. Explore freely. Learn your way.
        </div>
      </div>
    </section>
  );
} 