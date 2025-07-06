import React from 'react';
import { Button } from '@/app/components/ui';

export default function BecomeTutorHero() {
  return (
    <section className="bg-token-surface-accent-light py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left: Text */}
        <div className="flex-1 text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text mb-6 leading-tight">
            Be More Than a Tutor —<br />
            Be a Coach, a<br />
            Cheerleader, a<br />
            Changemaker.
          </h1>
          <p className="text-lg font-semibold text-text mb-2">
            Xpeak is where passionate tutors become lifelong coaches.
          </p>
          <p className="text-base text-text-tertiary mb-8 max-w-xl">
            We're building a global community of mentors who empower learners to truly speak with confidence.
          </p>
          <Button
            asChild
            variant="primary"
            size="lg"
          >
            <a href="/become-a-tutor">
              Become a Tutor
            </a>
          </Button>
        </div>
        {/* Right: Image */}
        <div className="flex-1 flex justify-center">
          <img
            src="/images/tutor-hero-group.jpg"
            alt="Diverse group of tutors and students on video call"
            className="rounded-2xl shadow-xl w-full max-w-xl object-cover"
            style={{ minHeight: 320 }}
          />
        </div>
      </div>
    </section>
  );
} 