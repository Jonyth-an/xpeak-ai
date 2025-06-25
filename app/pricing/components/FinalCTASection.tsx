import React from 'react';

export default function FinalCTASection() {
  return (
    <section className="py-20 bg-primary-600 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
        Ready to Begin Your Language Adventure?
      </h2>
      <p className="text-lg text-white mb-10">
        Join a new kind of learning journey — where AI meets human connection.
      </p>
      <div className="flex justify-center gap-8">
        <a
          href="/signup"
          className="px-10 py-4 bg-white text-primary-600 text-lg font-semibold rounded-xl shadow transition hover:bg-gray-100 focus:outline-none"
        >
          Start Learning
        </a>
        <a
          href="/tutors"
          className="px-10 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl transition hover:bg-white hover:text-primary-600 focus:outline-none"
        >
          Explore Tutors
        </a>
      </div>
    </section>
  );
} 