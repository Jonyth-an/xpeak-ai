import React from 'react';
import { Button } from '@/app/components/ui';

export default function BecomeTutorHero() {
  return (
    <section className="bg-token-surface-accent-light py-token-20 px-token-4 sm:px-token-6 lg:px-token-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-token-12">
        {/* Left: Text */}
        <div className="flex-1 text-left">
          <h1 className="text-token-4xl md:text-token-5xl font-extrabold token-text-primary mb-token-6 leading-tight">
            Be More Than a Tutor —<br />
            Be a Coach, a<br />
            Cheerleader, a<br />
            Changemaker.
          </h1>
          <p className="text-token-xl font-semibold token-text-primary mb-token-2">
            Xpeak is where passionate tutors become lifelong coaches.
          </p>
          <p className="text-token-base token-text-secondary mb-token-8 max-w-xl">
            We're building a global community of mentors who empower learners to truly speak with confidence.
          </p>
          <a
            href="/become-a-tutor"
            className="inline-flex items-center justify-center px-token-8 py-token-4 bg-token-primary text-white font-semibold rounded-token-lg hover:bg-token-primary-dark transition-colors text-token-lg"
          >
            Become a Tutor
          </a>
        </div>
        {/* Right: Image */}
        <div className="flex-1 flex justify-center">
          <img
            src="/images/tutor-hero-group.jpg"
            alt="Diverse group of tutors and students on video call"
            className="rounded-token-2xl shadow-xl w-full max-w-xl object-cover"
            style={{ minHeight: 320 }}
          />
        </div>
      </div>
    </section>
  );
} 