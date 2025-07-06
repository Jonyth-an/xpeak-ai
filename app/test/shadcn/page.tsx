'use client';

import React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Button, Card, Text, Badge, Input, Textarea, Select, Dropdown, DropdownOption } from '@/app/components/ui';
import FeatureCard from '@/app/components/ui/FeatureCard';
import SmartMatchFeature, { SmartMatchFeatureItem } from '@/app/components/molecules/SmartMatchFeature';
import LanguageSelectorMenu from '@/app/components/molecules/LanguageSelectorMenu';

const tutorFeatures: SmartMatchFeatureItem[] = [
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

const topicFeatures: SmartMatchFeatureItem[] = [
  {
    icon: '🎯',
    title: 'Personalized Topics',
    text: 'AI generates topics based on your interests and learning goals.'
  },
  {
    icon: '📈',
    title: 'Trending Content',
    text: 'Stay current with topics that are popular in your target language.'
  },
  {
    icon: '🔄',
    title: 'Adaptive Learning',
    text: 'Topics evolve as you progress, keeping your learning fresh and relevant.'
  }
];

const wordFeatures: SmartMatchFeatureItem[] = [
  {
    icon: '🧩',
    title: 'Smart Word Collection',
    text: 'Automatically collect and organize words from your conversations.'
  },
  {
    icon: '🎮',
    title: 'Interactive Review',
    text: 'Practice with gamified exercises that adapt to your learning pace.'
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    text: 'See your vocabulary growth with detailed analytics and insights.'
  }
];

const dropdownOptions: DropdownOption[] = [
  { value: 'option1', label: 'Option 1', icon: '🚀' },
  { value: 'option2', label: 'Option 2', icon: '⚡' },
  { value: 'option3', label: 'Option 3', icon: '🎯' },
  { value: 'option4', label: 'Disabled Option', icon: '🔒', disabled: true }
];

const languageOptions = [
  { label: 'English', code: 'EN', flag: '🇺🇸' },
  { label: 'Español', code: 'ES', flag: '🇪🇸' },
  { label: '中文', code: 'ZH', flag: '🇨🇳' },
  { label: '日本語', code: 'JA', flag: '🇯🇵' }
];

export default function TestShadcnPage() {
  const handleDropdownSelect = (option: any) => {
    console.log('selected:', option);
  };

  const handleLanguageSelect = (lang: any) => {
    console.log('language selected:', lang);
  };

  return (
    <div className="min-h-screen bg-token-surface-accent-light p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <Text variant="h1" className="mb-4">shadcn/ui + Custom UI Integration Test</Text>
          <Text variant="lead">Testing the integration between shadcn/ui and our custom design token system.</Text>
        </div>

        {/* Custom UI Components */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Custom UI Components (Our Design System)</Text>
          
          <div className="space-y-6">
            <div>
              <Text variant="h3" className="mb-4">Custom Buttons</Text>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            <div>
              <Text variant="h3" className="mb-4">Custom Badges</Text>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
              </div>
            </div>

            <div>
              <Text variant="h3" className="mb-4">Custom Inputs</Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Custom Input" />
                <Textarea placeholder="Custom Textarea" />
              </div>
            </div>
          </div>
        </Card>

        {/* shadcn/ui Components */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">shadcn/ui Components</Text>
          
          <div className="space-y-6">
            <div>
              <Text variant="h3" className="mb-4">shadcn/ui Buttons</Text>
              <div className="flex flex-wrap gap-4">
                <ShadcnButton variant="default">Default</ShadcnButton>
                <ShadcnButton variant="destructive">Destructive</ShadcnButton>
                <ShadcnButton variant="outline">Outline</ShadcnButton>
                <ShadcnButton variant="secondary">Secondary</ShadcnButton>
                <ShadcnButton variant="ghost">Ghost</ShadcnButton>
                <ShadcnButton variant="link">Link</ShadcnButton>
              </div>
            </div>

            <div>
              <Text variant="h3" className="mb-4">shadcn/ui Button Sizes</Text>
              <div className="flex flex-wrap items-center gap-4">
                <ShadcnButton size="sm">Small</ShadcnButton>
                <ShadcnButton size="default">Default</ShadcnButton>
                <ShadcnButton size="lg">Large</ShadcnButton>
                <ShadcnButton size="icon">🔍</ShadcnButton>
              </div>
            </div>
          </div>
        </Card>

        {/* Mixed Usage */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Mixed Usage Example</Text>
          
          <div className="space-y-6">
            <div>
              <Text variant="h3" className="mb-4">Form with Mixed Components</Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text variant="small" className="mb-2">Custom Input</Text>
                  <Input placeholder="Enter your name" />
                </div>
                <div>
                  <Text variant="small" className="mb-2">shadcn/ui Button</Text>
                  <ShadcnButton className="w-full">Submit</ShadcnButton>
                </div>
              </div>
            </div>

            <div>
              <Text variant="h3" className="mb-4">Status Indicators</Text>
              <div className="flex flex-wrap gap-4 items-center">
                <Badge variant="success">Custom Badge</Badge>
                <ShadcnButton variant="outline" size="sm">shadcn/ui Button</ShadcnButton>
                <Text variant="body">Mixed component usage works!</Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Design Token Verification */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Design Token Verification</Text>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-token-primary text-white rounded-lg">
                <Text variant="body" className="text-white">Primary Color Token</Text>
              </div>
              <div className="p-4 bg-token-secondary text-white rounded-lg">
                <Text variant="body" className="text-white">Secondary Color Token</Text>
              </div>
              <div className="p-4 bg-accent text-black rounded-lg">
                <Text variant="body">Accent Color Token</Text>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <Text variant="body">Border Color Token</Text>
              </div>
              <div className="p-4 bg-surface rounded-lg shadow-lg">
                <Text variant="body">Surface + Shadow Tokens</Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Dropdown Component Showcase */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Dropdown Component</Text>
          
          <div className="space-y-8">
            {/* Basic Dropdowns */}
            <div>
              <Text variant="h3" className="mb-4">Basic Dropdowns</Text>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Text variant="small" className="mb-2">Default</Text>
                  <Dropdown
                    options={dropdownOptions}
                    onSelect={handleDropdownSelect}
                    placeholder="Choose an option"
                  />
                </div>
                <div>
                  <Text variant="small" className="mb-2">Outlined</Text>
                  <Dropdown
                    options={dropdownOptions}
                    onSelect={handleDropdownSelect}
                    placeholder="Choose an option"
                    variant="outlined"
                  />
                </div>
                <div>
                  <Text variant="small" className="mb-2">Filled</Text>
                  <Dropdown
                    options={dropdownOptions}
                    onSelect={handleDropdownSelect}
                    placeholder="Choose an option"
                    variant="filled"
                  />
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <Text variant="h3" className="mb-4">Sizes</Text>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Text variant="small" className="mb-2">Small</Text>
                  <Dropdown
                    options={dropdownOptions}
                    onSelect={handleDropdownSelect}
                    placeholder="Small"
                    size="sm"
                    width="sm"
                  />
                </div>
                <div>
                  <Text variant="small" className="mb-2">Medium</Text>
                  <Dropdown
                    options={dropdownOptions}
                    onSelect={handleDropdownSelect}
                    placeholder="Medium"
                    size="md"
                    width="md"
                  />
                </div>
                <div>
                  <Text variant="small" className="mb-2">Large</Text>
                  <Dropdown
                    options={dropdownOptions}
                    onSelect={handleDropdownSelect}
                    placeholder="Large"
                    size="lg"
                    width="lg"
                  />
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <Text variant="h3" className="mb-4">Language Selector</Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text variant="small" className="mb-2">Standard Language Selector</Text>
                  <LanguageSelectorMenu
                    options={languageOptions}
                    onSelect={handleLanguageSelect}
                  />
                </div>
                <div>
                  <Text variant="small" className="mb-2">Custom Language Selector</Text>
                  <LanguageSelectorMenu
                    options={languageOptions}
                    onSelect={handleLanguageSelect}
                    size="sm"
                    variant="filled"
                    width="lg"
                  />
                </div>
              </div>
            </div>

            {/* Custom Trigger */}
            <div>
              <Text variant="h3" className="mb-4">Custom Trigger</Text>
              <Dropdown
                options={dropdownOptions}
                onSelect={handleDropdownSelect}
                trigger={
                  <Button variant="outline" className="flex items-center gap-2">
                    <span>🎨</span>
                    Custom Trigger
                  </Button>
                }
              />
            </div>

            {/* Disabled State */}
            <div>
              <Text variant="h3" className="mb-4">Disabled State</Text>
              <Dropdown
                options={dropdownOptions}
                onSelect={handleDropdownSelect}
                placeholder="Disabled dropdown"
                disabled={true}
              />
            </div>
          </div>
        </Card>

        {/* Flexible FeatureCard Showcase */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Flexible FeatureCard Component</Text>
          
          <div className="space-y-8">
            {/* Different Sizes */}
            <div>
              <Text variant="h3" className="mb-4">Different Sizes</Text>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FeatureCard icon="🚀" title="Small" size="sm">
                  Compact card for tight spaces
                </FeatureCard>
                <FeatureCard icon="⚡" title="Medium" size="md">
                  Standard size for most use cases
                </FeatureCard>
                <FeatureCard icon="🎯" title="Large" size="lg">
                  Prominent display for important features
                </FeatureCard>
                <FeatureCard icon="🌟" title="Extra Large" size="xl">
                  Hero-style cards for key highlights
                </FeatureCard>
              </div>
            </div>

            {/* Different Variants */}
            <div>
              <Text variant="h3" className="mb-4">Different Variants</Text>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FeatureCard icon="📱" title="Default" variant="default">
                  Standard appearance
                </FeatureCard>
                <FeatureCard icon="💎" title="Elevated" variant="elevated">
                  Enhanced shadow with hover effects
                </FeatureCard>
                <FeatureCard icon="🎨" title="Outlined" variant="outlined">
                  Clean border style
                </FeatureCard>
                <FeatureCard icon="🎪" title="Filled" variant="filled">
                  Subtle background tint
                </FeatureCard>
              </div>
            </div>

            {/* Different Alignments */}
            <div>
              <Text variant="h3" className="mb-4">Different Alignments</Text>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FeatureCard icon="⬅️" title="Left Aligned" align="left">
                  Content aligned to the left for a more natural reading flow
                </FeatureCard>
                <FeatureCard icon="⬆️" title="Center Aligned" align="center">
                  Centered content for balanced presentation
                </FeatureCard>
                <FeatureCard icon="➡️" title="Right Aligned" align="right">
                  Right-aligned content for specific layouts
                </FeatureCard>
              </div>
            </div>

            {/* Icon Animations */}
            <div>
              <Text variant="h3" className="mb-4">Icon Animations (Hover to see)</Text>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FeatureCard icon="🔄" title="Spin" iconAnimation="spin">
                  Icon spins on hover
                </FeatureCard>
                <FeatureCard icon="⚡" title="Bounce" iconAnimation="bounce">
                  Icon bounces on hover
                </FeatureCard>
                <FeatureCard icon="💓" title="Pulse" iconAnimation="pulse">
                  Icon pulses on hover
                </FeatureCard>
                <FeatureCard icon="🎯" title="Static" iconAnimation="none">
                  No animation
                </FeatureCard>
              </div>
            </div>

            {/* Custom Icon Sizes */}
            <div>
              <Text variant="h3" className="mb-4">Custom Icon Sizes</Text>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FeatureCard icon="🔍" title="Small Icon" iconSize="sm">
                  Compact icon size
                </FeatureCard>
                <FeatureCard icon="🎯" title="Medium Icon" iconSize="md">
                  Standard icon size
                </FeatureCard>
                <FeatureCard icon="🌟" title="Large Icon" iconSize="lg">
                  Prominent icon size
                </FeatureCard>
                <FeatureCard icon="🚀" title="Extra Large Icon" iconSize="xl">
                  Hero icon size
                </FeatureCard>
              </div>
            </div>

            {/* Mixed Configuration */}
            <div>
              <Text variant="h3" className="mb-4">Mixed Configuration Examples</Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureCard 
                  icon="🎨" 
                  title="Premium Feature" 
                  size="lg"
                  variant="elevated"
                  iconSize="xl"
                  iconAnimation="pulse"
                  align="center"
                >
                  A premium feature with enhanced styling, larger size, elevated variant, 
                  and animated icon that pulses on hover.
                </FeatureCard>
                <FeatureCard 
                  icon="📝" 
                  title="Quick Note" 
                  size="sm"
                  variant="outlined"
                  iconSize="sm"
                  align="left"
                >
                  A compact note-style card with left alignment and outlined variant 
                  for a clean, minimal appearance.
                </FeatureCard>
              </div>
            </div>
          </div>
        </Card>

        {/* SmartMatchFeature Component */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">SmartMatchFeature Component</Text>
          
          <div className="space-y-6">
            {/* Default Configuration */}
            <div className="mb-16">
              <h2 className="text-2xl font-semibold mb-4 text-center">Default Configuration (Tutors)</h2>
              <SmartMatchFeature
                title="Let AI Help You Find the Right Coach"
                description="Finding your ideal tutor shouldn't be a guessing game. With Xpeak's smart matching system, you get recommendations based on what actually matters to you."
                features={tutorFeatures}
                footerText="Switch anytime. Explore freely. Learn your way."
                iconAnimation="bounce"
                cardVariant="elevated"
                cardSize="lg"
                iconSize="xl"
                align="center"
              />
            </div>

            {/* AI Topics Configuration */}
            <div className="mb-16">
              <h2 className="text-2xl font-semibold mb-4 text-center">AI Topics Configuration</h2>
              <SmartMatchFeature
                title="AI-Powered Topic Discovery"
                description="Discover engaging topics that match your interests and learning level. Our AI analyzes your preferences to suggest the perfect conversation starters."
                features={topicFeatures}
                footerText="Explore topics that spark your curiosity and drive your learning."
                iconAnimation="pulse"
                cardVariant="elevated"
                cardSize="lg"
                iconSize="xl"
                align="center"
                className="bg-gradient-to-r from-blue-50 to-indigo-50"
              />
            </div>

            {/* Word Maze Configuration */}
            <div className="mb-16">
              <h2 className="text-2xl font-semibold mb-4 text-center">Word Maze Configuration</h2>
              <SmartMatchFeature
                title="Smart Vocabulary Building"
                description="Transform your conversations into a powerful vocabulary learning system. Every word you encounter becomes part of your personalized learning journey."
                features={wordFeatures}
                footerText="Build your vocabulary one conversation at a time."
                iconAnimation="spin"
                cardVariant="elevated"
                cardSize="lg"
                iconSize="xl"
                align="center"
                className="bg-gradient-to-r from-green-50 to-emerald-50"
              />
            </div>

            {/* Minimal Configuration */}
            <div className="mb-16">
              <h2 className="text-2xl font-semibold mb-4 text-center">Minimal Configuration</h2>
              <SmartMatchFeature
                features={tutorFeatures.slice(0, 2)}
                iconAnimation="none"
                cardVariant="default"
                cardSize="md"
                iconSize="lg"
                align="center"
                footerText=""
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 