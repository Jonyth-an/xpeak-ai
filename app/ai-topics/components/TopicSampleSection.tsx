'use client';
import React from 'react';
import { Button, Card, Badge } from '@/app/components/ui';

export default function TopicSampleSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <Card variant="elevated" padding="lg" className="text-center max-w-3xl mx-auto">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-token-accent/10 flex items-center justify-center text-token-accent text-xl">
            ✏️
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-token-text mb-1">AI-Generated Topic Sample</h3>
        <h4 className="text-lg font-bold text-token-accent mb-3">
          "Ordering Coffee Around the World"
        </h4>

        {/* Tags */}
        <div className="flex justify-center gap-2 mb-3">
          <Badge variant="accent" size="sm">Travel</Badge>
          <Badge variant="accent" size="sm">Culture</Badge>
        </div>

        {/* Vocabulary & Level */}
        <p className="text-sm text-token-text-secondary mb-1">
          <span className="font-medium text-token-text">Vocabulary:</span> espresso, latte, barista, menu, order
        </p>
        <p className="text-sm text-token-text-secondary mb-6">
          <span className="font-medium text-token-text">Level:</span> Intermediate
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button variant="outline">
            Practice with AI
          </Button>
          <Button variant="accent">
            Book Tutor for This Topic
          </Button>
          <Button variant="ghost">
            Save for Later
          </Button>
        </div>
      </Card>
    </section>
  );
} 