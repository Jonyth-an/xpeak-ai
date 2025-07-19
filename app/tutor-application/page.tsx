'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TutorApplicationRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the become-a-tutor page
    router.replace('/become-a-tutor');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary mx-auto mb-4"></div>
        <p className="text-token-text-secondary">Redirecting to tutor application...</p>
      </div>
    </div>
  );
} 