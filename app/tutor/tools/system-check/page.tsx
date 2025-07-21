'use client';

import SystemCheck from '@/app/components/video/SystemCheck';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/app/components/ui';

export default function SystemCheckPage() {
  const router = useRouter();
  const [testPassed, setTestPassed] = useState<boolean | null>(null);

  return (
    <div className="min-h-screen bg-token-surface-subtle flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl mx-auto">
        {testPassed === null ? (
          <SystemCheck 
            onComplete={(passed) => setTestPassed(passed)}
            onBack={() => router.push('/tutor/tools')}
          />
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">{testPassed ? 'All Systems Ready!' : 'Some Issues Detected'}</h2>
            <p className="mb-6">
              {testPassed
                ? 'Your camera, microphone, and internet connection are working. You are ready to teach!'
                : 'Some tests failed. You can still teach, but your experience may be affected.'}
            </p>
            <Button onClick={() => setTestPassed(null)} className="mr-4">Run Again</Button>
            <Button variant="outline" onClick={() => router.push('/tutor/tools')}>Back to Tools</Button>
          </div>
        )}
      </div>
    </div>
  );
} 