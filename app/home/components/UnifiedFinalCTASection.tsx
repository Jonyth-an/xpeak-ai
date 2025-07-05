import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui';

export default function UnifiedFinalCTASection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          You're not just learning a language. You're building a world.
        </h2>
        <p className="text-lg md:text-xl mb-10 text-blue-100 leading-relaxed">
          With Sagea at your side and Xpeak AI beneath it all — you're ready to grow.
        </p>
        <Link href="/signup">
          <Button 
            variant="secondary"
            size="lg"
            className="text-blue-600 bg-white hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
          >
            → Start Learning with Xpeak AI
          </Button>
        </Link>
      </div>
    </section>
  );
} 