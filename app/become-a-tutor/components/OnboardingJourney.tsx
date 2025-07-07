import React from 'react';
import { PencilIcon, UserGroupIcon, UserCircleIcon, AcademicCapIcon, RocketLaunchIcon, StarIcon } from '@heroicons/react/24/solid';
import { Button, Card } from '@/app/components/ui';

const steps = [
  {
    number: 1,
    icon: PencilIcon,
    iconBg: 'bg-token-accent',
    badgeBg: 'bg-token-accent',
    title: 'Submit Your Application',
    desc: 'Tell us about your teaching experience, what languages you speak, and what lights you up. Passion counts.'
  },
  {
    number: 2,
    icon: UserGroupIcon,
    iconBg: 'bg-token-primary',
    badgeBg: 'bg-token-primary',
    title: 'Meet the Team',
    desc: 'Our coach onboarding team will review your profile and reach out with next steps. We want to get to know *you*, not just your resume.'
  },
  {
    number: 3,
    icon: UserCircleIcon,
    iconBg: 'bg-token-secondary',
    badgeBg: 'bg-token-secondary',
    title: 'Build Your Profile',
    desc: 'Add a photo, record a short video intro, and set your availability. This is your space to shine.'
  },
  {
    number: 4,
    icon: AcademicCapIcon,
    iconBg: 'bg-token-success',
    badgeBg: 'bg-token-success',
    title: 'Get Ready to Coach',
    desc: 'Join a short onboarding — learn how our AI tools support your teaching, and pick up tips from top coaches.'
  }
];

export default function OnboardingJourney() {
  return (
    <section className="bg-token-surface py-token-20 px-token-4 sm:px-token-6 lg:px-token-8">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center mb-token-12">
        <h2 className="text-token-3xl md:text-token-4xl font-bold token-text-primary">
          Your Journey to Becoming a Coach
        </h2>
        <p className="mt-token-2 text-token-lg token-text-secondary">
          A simple, supportive path from application to your first student. We're here to guide you every step of the way.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-token-8 mb-token-8">
        {/* Row 1: Steps 1, 2, 3 */}
        {steps.slice(0, 3).map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.number} variant="elevated" padding="lg" className="relative flex flex-col items-center text-center min-h-[320px] rounded-token-lg">
              {/* Numbered Badge */}
              <div className={`absolute -top-token-4 right-token-6 w-8 h-8 flex items-center justify-center text-white rounded-full text-base font-bold shadow ${step.badgeBg}`}>{step.number}</div>
              {/* Icon */}
              <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${step.iconBg} mb-token-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-token-lg font-bold token-text-primary mb-token-2">{step.title}</h3>
              <p className="token-text-secondary text-token-base leading-relaxed">{step.desc}</p>
            </Card>
          );
        })}
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-token-8 mb-token-8">
        {/* Row 2: Step 4 and Final Card */}
        <Card variant="elevated" padding="lg" className="relative flex flex-col items-center text-center min-h-[320px] rounded-token-lg">
          {/* Numbered Badge for Step 4 */}
          <div className="absolute -top-token-4 right-token-6 w-8 h-8 flex items-center justify-center text-white rounded-full text-base font-bold shadow bg-token-success">4</div>
          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 mb-token-4">
            <span className="text-token-2xl">🚀</span>
          </div>
          <h3 className="text-token-lg font-bold token-text-primary mb-token-2">Get Ready to Coach</h3>
          <p className="token-text-secondary text-token-base leading-relaxed">Join a short onboarding — learn how our AI tools support your teaching, and pick up tips from top coaches.</p>
          <div className="flex items-center gap-token-2 bg-white rounded-full px-token-4 py-token-2 shadow">
            <span className="text-token-warning">⏰</span>
            <span className="font-semibold">30 min session</span>
            <span className="ml-token-2 token-text-secondary text-token-sm">Your journey starts here</span>
          </div>
        </Card>
        <Card variant="elevated" padding="lg" className="relative bg-gradient-to-br from-token-warning to-token-error text-white flex flex-col items-center text-center min-h-[320px] md:col-span-2 rounded-token-lg">
          {/* Numbered Badge for Step 5 */}
          <div className="absolute -top-token-4 right-token-6 w-8 h-8 flex items-center justify-center text-white rounded-full text-base font-bold shadow bg-token-warning">5</div>
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 mb-token-4">
            <RocketLaunchIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-token-lg font-bold mb-token-2">Start Teaching</h3>
          <p className="text-white/90 text-token-base leading-relaxed">Connect with learners from around the world. Inspire real progress and build your own global classroom.</p>
        </Card>
      </div>

      {/* Progress Indicator & Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-token-4 mt-token-8">
        <div className="flex items-center gap-token-2 bg-white rounded-full px-token-4 py-token-2 shadow">
          <span className="w-3 h-3 rounded-full bg-token-accent" />
          <span className="w-3 h-3 rounded-full bg-token-primary" />
          <span className="w-3 h-3 rounded-full bg-token-secondary" />
          <span className="w-3 h-3 rounded-full bg-token-success" />
          <span className="w-3 h-3 rounded-full bg-token-warning" />
          <span className="ml-token-2 token-text-secondary text-token-sm">Your journey starts here</span>
        </div>
        <Button variant="primary" size="lg">
          Apply Now
        </Button>
      </div>
    </section>
  );
} 