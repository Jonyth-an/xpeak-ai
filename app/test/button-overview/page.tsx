"use client"

import { Button } from '@/app/components/ui/Button';
import React from 'react';

export default function ButtonOverviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-token-text mb-4">
            🎨 Unified Button System Overview
          </h1>
          <p className="text-lg text-token-text-secondary max-w-2xl mx-auto">
            Comprehensive showcase of all button variants, sizes, and feature-specific colors. This system ensures consistency across the entire application.
          </p>
        </div>
        <div className="space-y-12">
          {/* Primary Buttons */}
          <div>
            <h2 className="text-2xl font-semibold text-token-text mb-4">Primary Buttons (Main CTAs)</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="sm">Small Primary</Button>
              <Button variant="primary" size="md">Medium Primary</Button>
              <Button variant="primary" size="lg">Large Primary</Button>
            </div>
          </div>
          {/* Secondary Buttons */}
          <div>
            <h2 className="text-2xl font-semibold text-token-text mb-4">Secondary Buttons (Outline)</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="sm">Small Secondary</Button>
              <Button variant="secondary" size="md">Medium Secondary</Button>
              <Button variant="secondary" size="lg">Large Secondary</Button>
            </div>
          </div>
          {/* Feature-Specific Buttons */}
          <div>
            <h2 className="text-2xl font-semibold text-token-text mb-4">Feature-Specific Buttons (Gradients)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="feature" feature="sagea" size="md">Sagea Feature</Button>
              <Button variant="feature" feature="word-maze" size="md">Word Maze Feature</Button>
              <Button variant="feature" feature="topic-sparks" size="md">Topic Sparks Feature</Button>
              <Button variant="feature" feature="learning-treks" size="md">Learning Treks Feature</Button>
              <Button variant="feature" feature="tutors-crew" size="md">Tutors Crew Feature</Button>
            </div>
          </div>
          {/* Tertiary Buttons */}
          <div>
            <h2 className="text-2xl font-semibold text-token-text mb-4">Tertiary Buttons (Minimal)</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="tertiary" size="sm">Small Tertiary</Button>
              <Button variant="tertiary" size="md">Medium Tertiary</Button>
              <Button variant="tertiary" size="lg">Large Tertiary</Button>
            </div>
          </div>
          {/* Success & Warning Buttons */}
          <div>
            <h2 className="text-2xl font-semibold text-token-text mb-4">Status Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="success" size="md">Success Action</Button>
              <Button variant="warning" size="md">Warning Action</Button>
            </div>
          </div>
          {/* Disabled States */}
          <div>
            <h2 className="text-2xl font-semibold text-token-text mb-4">Disabled States</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="md" disabled>Disabled Primary</Button>
              <Button variant="secondary" size="md" disabled>Disabled Secondary</Button>
              <Button variant="feature" feature="sagea" size="md" disabled>Disabled Feature</Button>
            </div>
          </div>
          {/* Interactive Demo */}
          <div>
            <h2 className="text-2xl font-semibold text-token-text mb-4">Interactive Demo</h2>
            <div className="bg-token-surface-subtle p-6 rounded-token-lg">
              <p className="text-token-text-secondary mb-4">
                Try hovering and clicking these buttons to see the interactive states:
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" size="md" onClick={() => alert('Primary button clicked!')}>
                  Click Me (Primary)
                </Button>
                <Button variant="feature" feature="word-maze" size="md" onClick={() => alert('Word Maze feature clicked!')}>
                  Click Me (Word Maze)
                </Button>
                <Button variant="secondary" size="md" onClick={() => alert('Secondary button clicked!')}>
                  Click Me (Secondary)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 