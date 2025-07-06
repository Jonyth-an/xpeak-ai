import React from 'react';
import Link from 'next/link';
import { Button, Text } from '@/app/components/ui';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-token-surface-subtle via-token-surface to-token-surface-accent py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text leading-tight mb-6">
          Help the World Speak as One
        </h1>
        <Text variant="lead" className="mb-8 max-w-4xl mx-auto text-lg md:text-xl">
          Xpeak AI blends superintelligent systems with human guidance — to help you learn languages faster, deeper, and with real-world fluency.
        </Text>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <Button 
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              → Start Learning Free
            </Button>
          </Link>
          <Link href="/meet-sagea">
            <Button 
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              → Meet Sagea
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 