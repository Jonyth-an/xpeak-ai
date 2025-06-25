import React from 'react';
import Link from "next/link";

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
          <Link
            href="/signup"
            className="bg-white text-blue-600 hover:bg-blue-100 font-semibold py-3 px-6 rounded-xl shadow-md transition duration-200"
          >
            🔵 Start Learning
          </Link>
          <Link
            href="/tutors"
            className="bg-transparent border-2 border-white text-text-inverse hover:bg-surface-muted hover:text-blue-600 font-semibold py-3 px-6 rounded-xl shadow-md transition duration-200"
          >
            ⚪ Explore Tutors
          </Link>
        </div>
      </div>
    </section>
  );
}
