import React from 'react';
import Link from 'next/link';

export default function TeachLanguageSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
          Teach the Language You Know
        </h2>
        <p className="text-lg text-text-muted mb-8">
          We're currently accepting applications for English tutors.  
          Interested in teaching Chinese or Spanish? Join our waitlist and be the first to know when those languages open.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/become-a-tutor?lang=en"
            className="inline-block px-6 py-3 bg-token-accent text-token-text-on-accent font-semibold rounded-lg shadow hover:bg-token-accent-dark focus:ring-2 focus:ring-token-accent transition border-2 border-token-accent"
          >
            Apply for English Tutor
          </Link>
          <Link
            href="/become-a-tutor?lang=zh&waitlist=true"
            className="inline-block px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Join Chinese Waitlist
          </Link>
          <Link
            href="/become-a-tutor?lang=es&waitlist=true"
            className="inline-block px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
          >
            Join Spanish Waitlist
          </Link>
        </div>
      </div>
    </section>
  );
} 