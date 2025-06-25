import React from 'react';
import Link from "next/link";
import { Button } from '@/app/components/ui';

export default function FinalCTASection() {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-20 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          🌍 Ready to Begin Your Language Adventure?
        </h2>
        <p className="text-lg sm:text-xl mb-10">
          Join a new kind of learning journey — where AI meets human connection, and progress feels personal.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            variant="secondary"
            size="lg"
          >
            <Link href="/signup">
              🔵 Start Learning
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-blue-600"
          >
            <Link href="/tutors">
              ⚪ Explore Tutors
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
