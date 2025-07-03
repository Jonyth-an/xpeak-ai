import React from 'react';

export default function TopicHeroSection() {
  return (
    <section className="bg-gradient-to-b from-[#f6fafd] to-[#fdf7f2] py-16 px-4 sm:px-6 lg:px-8 rounded-token-lg">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-4xl md:text-5xl">🧠</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#14213d]">Discover Topics Tailored for You</h1>
        </div>
        <p className="text-lg md:text-xl text-[#22304a] max-w-2xl mx-auto mt-2">
          Whether you're learning for travel, work, or daily life, Xpeak suggests topics based on your level, interests, culture, and past lessons — so every conversation feels personal.
        </p>
      </div>
    </section>
  );
} 