import React from 'react';

export default function TutorHeroSection() {
  return (
    <section className="bg-gradient-to-br from-indigo-50 to-blue-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side: Text & Buttons */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-text leading-tight">
              Meet the Coaches Behind Your Language Breakthrough
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              They're more than fluent — they're here to coach, motivate, and guide you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                Browse English Tutors
              </button>
              <button className="px-8 py-4 text-lg font-semibold text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
                Book a Trial Lesson
              </button>
            </div>
          </div>
          {/* Right Side: Visual */}
          <div className="flex justify-center md:justify-end mt-10 md:mt-0">
            <div className="w-64 h-64 bg-white rounded-2xl shadow-xl flex items-center justify-center text-6xl">
              <span role="img" aria-label="graduation cap">🎓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 