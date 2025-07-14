'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, Text, Button } from '@/app/components/ui';

export default function TutorOnboardingWelcome() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-token-surface">
      <Card className="max-w-lg w-full p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Text variant="h2" className="text-token-primary mb-2">🎉 Congratulations!</Text>
          <Text variant="body" className="text-token-text-primary">
            Your application has been approved. Welcome to the Xpeak Tutor Community!
          </Text>
        </div>
        <div className="mb-6">
          <Text variant="h4" className="mb-2">Get Started with Onboarding</Text>
          <ul className="list-disc list-inside text-token-text-secondary text-sm space-y-1">
            <li>Set up your profile and teaching preferences</li>
            <li>Configure your availability</li>
            <li>Upload your first teaching materials</li>
            <li>Test your video call setup</li>
            <li>Access your tutor dashboard</li>
          </ul>
        </div>
        <div className="mb-8 flex items-center justify-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div className="bg-token-primary h-2 rounded-full" style={{ width: '20%' }}></div>
          </div>
          <span className="text-xs text-token-text-secondary ml-2">Step 1 of 5</span>
        </div>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => router.push('/tutor/onboarding/profile')}
        >
          Get Started
        </Button>
      </Card>
    </div>
  );
} 