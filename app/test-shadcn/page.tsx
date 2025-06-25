import React from 'react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { Button, Card, Text, Badge, Input, Textarea, Select } from '@/app/components/ui';

export default function TestShadcnPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
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
              <div className="p-4 bg-primary text-white rounded-lg">
                <Text variant="body" className="text-white">Primary Color Token</Text>
              </div>
              <div className="p-4 bg-secondary text-white rounded-lg">
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
      </div>
    </div>
  );
} 