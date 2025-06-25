import React from 'react';
import Link from 'next/link';

export default function FinalCTASection() {
  return (
    <section className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 py-20">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-white text-3xl md:text-4xl font-bold">
          Your Language Coach Is Just a Click Away
        </h2>
        <p className="text-white text-opacity-80 text-lg max-w-xl mx-auto mt-4 mb-8">
          Get to know our English coaches and experience your first lesson today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link href="/tutors" legacyBehavior>
            <a className="bg-white text-indigo-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 shadow-md transition text-center">
              Explore Tutors
            </a>
          </Link>
          <Link href="/signup" legacyBehavior>
            <a className="border-2 border-white text-white font-semibold py-3 px-6 rounded-lg hover:bg-surface-muted hover:text-indigo-600 transition text-center">
              Book a Trial Lesson
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
} 