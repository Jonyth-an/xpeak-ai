import React from 'react';
import Link from 'next/link';
import { Button, Text } from '@/app/components/ui';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-token-surface-subtle via-token-surface to-token-surface-accent p-token-20 px-token-4 sm:px-token-6 lg:px-token-8">
      <div className="container-xl mx-auto text-token-center">
        <h1 className="text-token-display-2xl md:text-token-display-xl lg:text-token-display-2xl font-token-bold text-token-primary leading-tight mb-token-6">
          Help the World Speak as One
        </h1>
        <Text 
          variant="lead" 
          className="mb-token-8 max-w-4xl mx-auto text-token-body-xl md:text-token-body-lg text-token-secondary"
        >
          Xpeak AI blends superintelligent systems with human guidance — to help you learn languages faster, deeper, and with real-world fluency.
        </Text>
        <div className="flex flex-col sm:flex-row gap-token-4 justify-center items-center">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button 
              variant="primary"
              size="lg"
              className="w-full sm:w-auto transition-base hover:shadow-lg focus:shadow-lg"
            >
              → Start Learning Free
            </Button>
          </Link>
          <Link href="/meet-sagea" className="w-full sm:w-auto">
            <Button 
              variant="outline"
              size="lg"
              className="w-full sm:w-auto transition-base hover:shadow-md focus:shadow-md"
            >
              → Meet Sagea
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 