import React from 'react';
import { Button } from '@/app/components/ui/Button';

export default function TutorHeroSection() {
  return (
    <section className="bg-gradient-to-br from-token-surface-accent-light to-token-surface-accent py-token-12 pt-[5.5rem]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-token-8 items-center">
          {/* Left Side: Text & Buttons */}
          <div className="space-y-token-6 min-h-[18rem] md:min-h-[22rem] relative z-10">
            <h1 className="text-token-display-2xl md:text-token-display-xl font-token-bold text-token-text leading-token-tight mb-token-6">
              Meet Sagea
              <br />
              <span className="text-token-primary">Your Learning Coach and Partner</span>
            </h1>
            <p className="text-token-lg text-token-text-secondary leading-token-relaxed">
              Sagea is your ever-present coach, listener and motivator — built from both human warmth and AI intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-token-4">
              <Button variant="primary" size="lg">
                → Start Learning with Sagea
              </Button>
            </div>
          </div>
          {/* Right Side: Visual Metaphor */}
          <div className="flex justify-center md:justify-end items-center mt-token-8 md:mt-0">
            <div className="relative min-w-[18rem] min-h-[18rem] md:min-w-[22rem] md:min-h-[22rem] flex items-center justify-center">
              {/* Glowing figure in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-token-24 h-token-24 bg-gradient-to-br from-token-primary to-token-secondary rounded-token-full flex items-center justify-center text-5xl text-token-surface shadow-token-xl animate-pulse">
                  🧠
                </div>
              </div>
              {/* Swirling connections */}
              <div className="absolute inset-0">
                <div className="w-full h-full border-token-2 border-token-primary/30 rounded-token-full animate-spin-slow"></div>
                <div className="absolute top-1/4 left-1/4 w-token-4 h-token-4 bg-token-primary/40 rounded-token-full"></div>
                <div className="absolute top-3/4 right-1/4 w-token-4 h-token-4 bg-token-secondary/40 rounded-token-full"></div>
                <div className="absolute bottom-1/4 left-1/3 w-token-4 h-token-4 bg-token-accent/40 rounded-token-full"></div>
                <div className="absolute top-1/2 right-1/3 w-token-4 h-token-4 bg-token-accent-light/40 rounded-token-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 