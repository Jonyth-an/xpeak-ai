'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Text, Button } from '@/app/components/ui';

const SPECIALIZATIONS = [
  'Conversation',
  'Exam Prep',
  'Business English',
  'Kids',
  'Grammar',
  'Pronunciation',
  'Writing',
  'Other',
];

export default function TutorOnboardingProfile() {
  const router = useRouter();
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [teachingPhilosophy, setTeachingPhilosophy] = useState('');
  const [certifications, setCertifications] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);

  const isValid = bio.trim() && hourlyRate && specializations.length > 0;

  const handleSpecializationChange = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec]
    );
  };

  const handleContinue = async () => {
    setSaving(true);
    // TODO: Save profile data via API
    setTimeout(() => {
      setSaving(false);
      router.push('/tutor/onboarding/availability');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-token-surface">
      <Card className="max-w-xl w-full p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Text variant="h2" className="text-token-primary mb-2">Profile Setup</Text>
          <Text variant="body" className="text-token-text-primary">
            Tell us about yourself and your teaching style. This information will help students get to know you.
          </Text>
        </div>
        <div className="mb-6 flex items-center justify-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div className="bg-token-primary h-2 rounded-full" style={{ width: '40%' }}></div>
          </div>
          <span className="text-xs text-token-text-secondary ml-2">Step 2 of 5</span>
        </div>
        <form
          className="space-y-5"
          onSubmit={e => {
            e.preventDefault();
            if (isValid) handleContinue();
          }}
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-token-text-secondary">Bio <span className="text-red-500">*</span></label>
            <textarea
              className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              required
              placeholder="Tell students about your background, experience, and teaching approach."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-token-text-secondary">Hourly Rate (USD) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min={1}
              step={1}
              className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
              value={hourlyRate}
              onChange={e => setHourlyRate(e.target.value)}
              required
              placeholder="e.g. 25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-token-text-secondary">Specializations <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {SPECIALIZATIONS.map(spec => (
                <button
                  type="button"
                  key={spec}
                  className={`px-3 py-1 rounded-full border text-sm transition-colors ${specializations.includes(spec) ? 'bg-token-primary text-white border-token-primary' : 'bg-token-surface border-token text-token-text-secondary'}`}
                  onClick={() => handleSpecializationChange(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-token-text-secondary">Teaching Philosophy</label>
            <textarea
              className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
              rows={2}
              value={teachingPhilosophy}
              onChange={e => setTeachingPhilosophy(e.target.value)}
              placeholder="Share your teaching philosophy (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-token-text-secondary">Certifications</label>
            <input
              type="text"
              className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
              value={certifications}
              onChange={e => setCertifications(e.target.value)}
              placeholder="List your certifications, separated by commas (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-token-text-secondary">Social Media</label>
            <div className="flex flex-col gap-2">
              <input
                type="url"
                className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="LinkedIn URL (optional)"
              />
              <input
                type="url"
                className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                value={youtube}
                onChange={e => setYoutube(e.target.value)}
                placeholder="YouTube URL (optional)"
              />
              <input
                type="url"
                className="w-full p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="Personal Website (optional)"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={!isValid || saving}
            >
              {saving ? 'Saving...' : 'Save & Continue'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => router.push('/tutor/onboarding/availability')}
              disabled={saving}
            >
              Skip for Now
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 