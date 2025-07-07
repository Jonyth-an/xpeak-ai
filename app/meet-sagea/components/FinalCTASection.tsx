import React from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';

export default function FinalCTASection() {
  return (
    <section className="w-full bg-gradient-to-r from-token-primary to-token-secondary py-token-12">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-token-text-inverse text-token-display-xl md:text-token-display-2xl font-token-extrabold text-center mb-token-4">
          "You don't just learn words. You explore a world."
        </h2>
        <p className="text-token-text-inverse/80 text-token-lg max-w-xl mx-auto mt-token-4 mb-token-8">
        "Sagea will be with you — every word, every spark, every step."
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-token-4 mt-token-6">
          <Link href="/signup">
            <Button variant="primary" size="lg" className="hover:bg-[#ff7f50] hover:text-white">
              → Start Learning with Sagea
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 