'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Text, Button } from '@/app/components/ui';

const TEMPLATES = [
  {
    key: 'weekday_evenings',
    label: 'Weekday Evenings (Mon–Fri, 6–9 PM)',
    description: 'Great for students who prefer after-work lessons.'
  },
  {
    key: 'weekend_mornings',
    label: 'Weekend Mornings (Sat–Sun, 9 AM–12 PM)',
    description: 'Ideal for weekend learners.'
  },
  {
    key: 'flexible',
    label: 'Flexible Schedule (Custom)',
    description: 'Set your own custom availability.'
  }
];

export default function TutorOnboardingAvailability() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
  const [saving, setSaving] = useState(false);
  // Placeholder: Assume 5+ hours if any template is selected
  const hasMinimumHours = !!selectedTemplate;

  const handleContinue = async () => {
    setSaving(true);
    // TODO: Save availability via API
    setTimeout(() => {
      setSaving(false);
      router.push('/tutor/onboarding/materials');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-token-surface">
      <Card className="max-w-xl w-full p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Text variant="h2" className="text-token-primary mb-2">Set Your Availability</Text>
          <Text variant="body" className="text-token-text-primary">
            Choose a template or set your own schedule. You can always update your availability later.
          </Text>
        </div>
        <div className="mb-6 flex items-center justify-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div className="bg-token-primary h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <span className="text-xs text-token-text-secondary ml-2">Step 3 of 5</span>
        </div>
        <div className="mb-6">
          <Text variant="h4" className="mb-2">Quick Setup Templates</Text>
          <div className="flex flex-col gap-3">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.key}
                type="button"
                className={`w-full text-left p-4 rounded-lg border transition-colors ${selectedTemplate === tpl.key ? 'bg-token-primary/10 border-token-primary' : 'bg-token-surface border-token'}`}
                onClick={() => setSelectedTemplate(tpl.key)}
              >
                <div className="font-medium text-token-primary">{tpl.label}</div>
                <div className="text-sm text-token-text-secondary">{tpl.description}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <Text variant="h4" className="mb-2">Timezone</Text>
          <input
            type="text"
            className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            required
          />
          <div className="text-xs text-token-text-secondary mt-1">Please confirm your timezone for accurate scheduling.</div>
        </div>
        <div className="mb-6">
          <Text variant="h4" className="mb-2">Preview</Text>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center text-sm text-token-text-secondary">
            {/* Placeholder for calendar preview */}
            {selectedTemplate === 'weekday_evenings' && 'Mon–Fri, 6:00 PM–9:00 PM'}
            {selectedTemplate === 'weekend_mornings' && 'Sat–Sun, 9:00 AM–12:00 PM'}
            {selectedTemplate === 'flexible' && 'Custom schedule (calendar grid coming soon)'}
            {!selectedTemplate && 'Select a template to preview your schedule.'}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!hasMinimumHours || saving}
            onClick={handleContinue}
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => router.push('/tutor/onboarding/materials')}
            disabled={saving}
          >
            Skip for Now
          </Button>
        </div>
      </Card>
    </div>
  );
} 