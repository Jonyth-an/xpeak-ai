import React from 'react';
import { Button } from '@/app/components/ui';

export default function TutorHeroSection() {
  return (
    <section className="bg-gradient-to-br from-token-surface-accent-light to-token-surface-accent py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side: Text & Buttons */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-text leading-tight mb-8">
              Meet Sagea
              <br />
              <span className="text-token-primary">Your Lifelong Learning Coach and Partner</span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              Sagea is your ever-present coach, listener and motivator — built from both human warmth and AI intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg">
                → Start Learning with Sagea
              </Button>
            </div>
          </div>
          {/* Right Side: Visual Metaphor */}
          <div className="flex justify-center md:justify-end mt-10 md:mt-0">
            <div className="relative w-80 h-80">
              {/* Glowing figure in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-token-primary to-token-secondary rounded-full flex items-center justify-center text-4xl text-white shadow-2xl animate-pulse">
                  🧠
                </div>
              </div>
              {/* Swirling connections */}
              <div className="absolute inset-0">
                <div className="w-full h-full border-2 border-token-primary/30 rounded-full animate-spin-slow"></div>
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-token-primary/40 rounded-full"></div>
                <div className="absolute top-3/4 right-1/4 w-4 h-4 bg-token-secondary/40 rounded-full"></div>
                <div className="absolute bottom-1/4 left-1/3 w-4 h-4 bg-token-accent/40 rounded-full"></div>
                <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-token-accent-light/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 