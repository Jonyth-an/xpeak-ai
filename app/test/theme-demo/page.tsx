'use client';

import React from 'react';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { useTheme } from '@/lib/ThemeContext';
import { Button, Card, Text } from '@/app/components/ui';

export default function ThemeDemoPage() {
  const { theme, resolvedTheme, isDark } = useTheme();

  return (
    <div className="min-h-screen bg-token-bg text-token-text p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-token-display-lg font-token-bold text-token-primary">
            Theme Demo
          </h1>
          <p className="text-token-body-lg text-token-text-secondary">
            Test the dark mode and theme switching functionality
          </p>
        </div>

        {/* Theme Controls */}
        <Card className="p-6 bg-token-surface border-token-border">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Text variant="h3" className="text-token-text">
                Theme Controls
              </Text>
              <div className="flex items-center gap-4 text-token-text-secondary">
                <span>Current Theme: <strong className="text-token-primary">{theme}</strong></span>
                <span>Resolved: <strong className="text-token-primary">{resolvedTheme}</strong></span>
                <span>Is Dark: <strong className="text-token-primary">{isDark ? 'Yes' : 'No'}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle variant="button" />
              <ThemeToggle variant="dropdown" />
            </div>
          </div>
        </Card>

        {/* Color Palette Demo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Brand Colors */}
          <Card className="p-6 bg-token-surface border-token-border">
            <Text variant="h4" className="text-token-text mb-4">Brand Colors</Text>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-primary rounded-token-sm"></div>
                <span className="text-token-sm text-token-text-secondary">Primary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-secondary rounded-token-sm"></div>
                <span className="text-token-sm text-token-text-secondary">Secondary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-accent rounded-token-sm"></div>
                <span className="text-token-sm text-token-text-secondary">Accent</span>
              </div>
            </div>
          </Card>

          {/* Background Colors */}
          <Card className="p-6 bg-token-surface border-token-border">
            <Text variant="h4" className="text-token-text mb-4">Backgrounds</Text>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-bg rounded-token-sm border border-token-border"></div>
                <span className="text-token-sm text-token-text-secondary">Main BG</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-surface rounded-token-sm border border-token-border"></div>
                <span className="text-token-sm text-token-text-secondary">Surface</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-surface-subtle rounded-token-sm border border-token-border"></div>
                <span className="text-token-sm text-token-text-secondary">Subtle</span>
              </div>
            </div>
          </Card>

          {/* Text Colors */}
          <Card className="p-6 bg-token-surface border-token-border">
            <Text variant="h4" className="text-token-text mb-4">Text Colors</Text>
            <div className="space-y-3">
              <div className="text-token-text font-medium">Primary Text</div>
              <div className="text-token-text-secondary font-medium">Secondary Text</div>
              <div className="text-token-text-muted font-medium">Muted Text</div>
            </div>
          </Card>

          {/* Status Colors */}
          <Card className="p-6 bg-token-surface border-token-border">
            <Text variant="h4" className="text-token-text mb-4">Status Colors</Text>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-success rounded-token-sm"></div>
                <span className="text-token-sm text-token-text-secondary">Success</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-warning rounded-token-sm"></div>
                <span className="text-token-sm text-token-text-secondary">Warning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-error rounded-token-sm"></div>
                <span className="text-token-sm text-token-text-secondary">Error</span>
              </div>
            </div>
          </Card>

          {/* Interactive States */}
          <Card className="p-6 bg-token-surface border-token-border">
            <Text variant="h4" className="text-token-text mb-4">Interactive States</Text>
            <div className="space-y-3">
              <Button variant="primary" className="w-full">Primary Button</Button>
              <Button variant="secondary" className="w-full">Secondary Button</Button>
              <Button variant="outline" className="w-full">Outline Button</Button>
            </div>
          </Card>

          {/* Borders */}
          <Card className="p-6 bg-token-surface border-token-border">
            <Text variant="h4" className="text-token-text mb-4">Borders</Text>
            <div className="space-y-3">
              <div className="w-full h-8 border-2 border-token-border rounded-token-sm"></div>
              <div className="w-full h-8 border-2 border-token-border-strong rounded-token-sm"></div>
              <div className="w-full h-8 border-2 border-token-border-focus rounded-token-sm"></div>
            </div>
          </Card>
        </div>

        {/* Gradient Examples */}
        <Card className="p-6 bg-token-surface border-token-border">
          <Text variant="h4" className="text-token-text mb-4">Gradients</Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-gradient-to-r from-token-primary to-token-secondary rounded-token-lg flex items-center justify-center">
              <span className="text-token-text-inverse font-medium">Primary → Secondary</span>
            </div>
            <div className="h-20 bg-gradient-to-r from-token-secondary to-token-accent rounded-token-lg flex items-center justify-center">
              <span className="text-token-text-inverse font-medium">Secondary → Accent</span>
            </div>
            <div className="h-20 bg-gradient-to-r from-token-accent to-token-primary rounded-token-lg flex items-center justify-center">
              <span className="text-token-text-inverse font-medium">Accent → Primary</span>
            </div>
          </div>
        </Card>

        {/* Typography Examples */}
        <Card className="p-6 bg-token-surface border-token-border">
          <Text variant="h4" className="text-token-text mb-4">Typography</Text>
          <div className="space-y-2">
            <Text variant="display" className="text-token-text">Display</Text>
            <Text variant="h1" className="text-token-text">Heading 1</Text>
            <Text variant="h2" className="text-token-text">Heading 2</Text>
            <Text variant="h3" className="text-token-text">Heading 3</Text>
            <Text variant="body" className="text-token-text">Body</Text>
            <Text variant="lead" className="text-token-text">Lead</Text>
            <Text variant="small" className="text-token-text">Small</Text>
          </div>
        </Card>

        {/* Spacing Examples */}
        <Card className="p-6 bg-token-surface border-token-border">
          <Text variant="h4" className="text-token-text mb-4">Spacing</Text>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-token-primary rounded"></div>
              <span className="text-token-sm text-token-text-secondary">4px (xs)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-token-secondary rounded"></div>
              <span className="text-token-sm text-token-text-secondary">8px (sm)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-token-accent rounded"></div>
              <span className="text-token-sm text-token-text-secondary">16px (md)</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-token-primary rounded"></div>
              <span className="text-token-sm text-token-text-secondary">24px (lg)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 