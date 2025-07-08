'use client';

import React, { useState, useRef } from 'react';
import { Button, Card, Input, Textarea, Select, Badge, Text } from '@/app/components/ui';
import SignupForm from '@/app/components/molecules/SignupForm';
import Link from 'next/link';
import LanguageSelectorMenu from '@/app/components/molecules/LanguageSelectorMenu';

export default function UIDemo() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    category: '',
    priority: ''
  });

  const autoResizeRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Text variant="h1" className="mb-4">Xpeak AI Design System</Text>
          <Text variant="lead" className="max-w-2xl mx-auto">
            A comprehensive collection of reusable UI components built with design tokens for consistency and maintainability.
          </Text>
          <div className="flex items-center space-x-2">
            <Link href="/login" className="text-text-secondary hover:text-primary-600 px-4 py-2 text-sm font-medium border border-border rounded-md hover:border-primary-300 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Interactive Form Example */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Interactive Form Example</Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text variant="small" className="mb-2">Name</Text>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
                className="mb-4"
              />
            </div>
            <div>
              <Text variant="small" className="mb-2">Email</Text>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                success={formData.email.includes('@')}
                className="mb-4"
              />
            </div>
            <div>
              <Text variant="small" className="mb-2">Category</Text>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="mb-4"
              >
                <option value="">Select a category</option>
                <option value="general">General</option>
                <option value="support">Support</option>
                <option value="feedback">Feedback</option>
              </Select>
            </div>
            <div>
              <Text variant="small" className="mb-2">Priority</Text>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="mb-4"
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Text variant="small" className="mb-2">Message</Text>
              <Textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Enter your message"
                autoResize
                minRows={3}
                maxRows={8}
                showCharacterCount
                maxLength={500}
                className="mb-4"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="primary" size="lg">Submit</Button>
            <Button variant="outline" size="lg">Cancel</Button>
          </div>
        </Card>

        {/* Text Component Showcase */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Text Component</Text>
          
          {/* Typography Scale */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Typography Scale</Text>
            <div className="space-y-2">
              <Text variant="display" as="h1">Display Text</Text>
              <Text variant="h1" as="h1">Heading 1</Text>
              <Text variant="h2" as="h2">Heading 2</Text>
              <Text variant="h3" as="h3">Heading 3</Text>
              <Text variant="h4" as="h4">Heading 4</Text>
              <Text variant="h5" as="h5">Heading 5</Text>
              <Text variant="h6" as="h6">Heading 6</Text>
              <Text variant="subtitle">Subtitle Text</Text>
              <Text variant="body">Body Text - This is the default text style for regular content.</Text>
              <Text variant="lead">Lead Text - This is used for introductory paragraphs and important content.</Text>
              <Text variant="small">Small Text - Used for captions, metadata, and secondary information.</Text>
              <Text variant="caption">Caption Text - Very small text for fine print and labels.</Text>
              <Text variant="overline">OVERLINE TEXT</Text>
              <Text variant="muted">Muted Text - For less important or secondary information.</Text>
            </div>
          </div>

          {/* Font Weights */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Font Weights</Text>
            <div className="space-y-2">
              <Text variant="body" weight="light">Light weight text</Text>
              <Text variant="body" weight="normal">Normal weight text</Text>
              <Text variant="body" weight="medium">Medium weight text</Text>
              <Text variant="body" weight="semibold">Semibold weight text</Text>
              <Text variant="body" weight="bold">Bold weight text</Text>
              <Text variant="body" weight="extrabold">Extrabold weight text</Text>
            </div>
          </div>

          {/* Text Alignment */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Text Alignment</Text>
            <div className="space-y-4">
              <Text variant="body" align="left" className="border border-gray-200 p-2">Left aligned text</Text>
              <Text variant="body" align="center" className="border border-gray-200 p-2">Center aligned text</Text>
              <Text variant="body" align="right" className="border border-gray-200 p-2">Right aligned text</Text>
              <Text variant="body" align="justify" className="border border-gray-200 p-2">
                Justified text that spreads across the full width of the container. This creates even margins on both sides.
              </Text>
            </div>
          </div>

          {/* Truncation */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Text Truncation</Text>
            <div className="max-w-xs">
              <Text variant="body" truncate className="border border-gray-200 p-2">
                This is a very long text that will be truncated with an ellipsis when it exceeds the container width.
              </Text>
            </div>
          </div>

          {/* Element Types */}
          <div>
            <Text variant="h3" className="mb-4">Element Types</Text>
            <div className="space-y-2">
              <Text variant="body" as="h1">Rendered as H1</Text>
              <Text variant="body" as="span">Rendered as span</Text>
              <Text variant="body" as="div">Rendered as div</Text>
              <Text variant="body" as="label">Rendered as label</Text>
            </div>
          </div>
        </Card>

        {/* Button Component Showcase */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Button Component</Text>
          
          {/* Variants */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Variants</Text>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="tertiary">Ghost</Button>
              <Button variant="feature">Accent</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Sizes</Text>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
            </div>
          </div>

          {/* States */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">States</Text>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Normal</Button>
              <Button variant="primary" disabled>Disabled</Button>
              <Button variant="primary" className="opacity-50 cursor-not-allowed">Loading...</Button>
            </div>
          </div>
        </Card>

        {/* Card Component Showcase */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Card Component</Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="default" padding="sm">
              <Text variant="h4" className="mb-2">Default Card</Text>
              <Text variant="body">This is a default card with small padding.</Text>
            </Card>
            
            <Card variant="outlined" padding="md">
              <Text variant="h4" className="mb-2">Outlined Card</Text>
              <Text variant="body">This is an outlined card with medium padding.</Text>
            </Card>
            
            <Card variant="elevated" padding="lg">
              <Text variant="h4" className="mb-2">Elevated Card</Text>
              <Text variant="body">This is an elevated card with large padding and shadow.</Text>
            </Card>
            
            <Card variant="outlined" padding="lg">
              <Text variant="h4" className="mb-2">Outlined Card</Text>
              <Text variant="body">This is an outlined card with background color.</Text>
            </Card>
          </div>
        </Card>

        {/* Badge Component Showcase */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Badge Component</Text>
          
          {/* Variants */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Variants</Text>
            <div className="flex flex-wrap gap-4">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Sizes</Text>
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="default" size="sm">Small</Badge>
              <Badge variant="default" size="md">Medium</Badge>
              <Badge variant="default" size="lg">Large</Badge>
            </div>
          </div>
        </Card>

        {/* Input Component Showcase */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Input Component</Text>
          
          {/* Variants */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Variants</Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Text variant="small" className="mb-2">Default</Text>
                <Input placeholder="Default input" />
              </div>
              <div>
                <Text variant="small" className="mb-2">Outlined</Text>
                <Input variant="outlined" placeholder="Outlined input" />
              </div>
              <div>
                <Text variant="small" className="mb-2">Filled</Text>
                <Input variant="filled" placeholder="Filled input" />
              </div>
              <div>
                <Text variant="small" className="mb-2">Error State</Text>
                <Input error placeholder="Error input" />
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="mb-8">
            <Text variant="h3" className="mb-4">Sizes</Text>
            <div className="space-y-4">
              <Input size="sm" placeholder="Small input" />
              <Input size="md" placeholder="Medium input" />
              <Input size="lg" placeholder="Large input" />
            </div>
          </div>
        </Card>

        {/* Select Component Showcase */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Select Component</Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text variant="small" className="mb-2">Default Select</Text>
              <Select>
                <option value="">Choose an option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </Select>
            </div>
            <div>
              <Text variant="small" className="mb-2">Outlined Select</Text>
              <Select variant="outlined">
                <option value="">Choose an option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </Select>
            </div>
          </div>
        </Card>

        {/* Textarea Component Showcase */}
        <Card variant="elevated" padding="lg">
          <Text variant="h2" className="mb-6">Textarea Component</Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text variant="small" className="mb-2">Default Textarea</Text>
              <Textarea placeholder="Enter your message" />
            </div>
            <div>
              <Text variant="small" className="mb-2">With Character Count</Text>
              <Textarea 
                placeholder="Enter your message" 
                showCharacterCount 
                maxLength={100}
              />
            </div>
            <div>
              <Text variant="small" className="mb-2">Auto-resize</Text>
              <Textarea 
                placeholder="This textarea will resize automatically" 
                autoResize
                minRows={2}
                maxRows={6}
              />
            </div>
            <div>
              <Text variant="small" className="mb-2">Error State</Text>
              <Textarea 
                placeholder="Error textarea" 
                error
              />
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center py-8">
          <Text variant="muted">
            Xpeak AI Design System - Built with ❤️ for consistent, accessible, and beautiful user interfaces.
          </Text>
        </div>

        <SignupForm onSubmit={(data) => console.log('signup', data)} />

        <LanguageSelectorMenu
          options={[
            { label: 'English', code: 'EN', flag: '🇺🇸' },
            { label: 'Español', code: 'ES', flag: '🇪🇸' },
            { label: '中文', code: 'ZH', flag: '🇨🇳' },
            { label: '日本語', code: 'JA', flag: '🇯🇵' }
          ]}
          onSelect={lang => console.log('language selected:', lang)}
        />
      </div>
    </div>
  );
} 