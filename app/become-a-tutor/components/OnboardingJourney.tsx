import React from 'react';
import { PencilIcon, UserGroupIcon, UserCircleIcon, AcademicCapIcon, RocketLaunchIcon, StarIcon } from '@heroicons/react/24/solid';
import { Button, Card } from '@/app/components/ui';

const steps = [
  {
    number: 1,
    icon: PencilIcon,
    iconBg: 'bg-purple-500',
    badgeBg: 'bg-purple-500',
    title: 'Submit Your Application',
    desc: 'Tell us about your teaching experience, what languages you speak, and what lights you up. Passion counts.'
  },
  {
    number: 2,
    icon: UserGroupIcon,
    iconBg: 'bg-blue-500',
    badgeBg: 'bg-blue-500',
    title: 'Meet the Team',
    desc: 'Our coach onboarding team will review your profile and reach out with next steps. We want to get to know *you*, not just your resume.'
  },
  {
    number: 3,
    icon: UserCircleIcon,
    iconBg: 'bg-indigo-500',
    badgeBg: 'bg-indigo-500',
    title: 'Build Your Profile',
    desc: 'Add a photo, record a short video intro, and set your availability. This is your space to shine.'
  },
  {
    number: 4,
    icon: AcademicCapIcon,
    iconBg: 'bg-green-500',
    badgeBg: 'bg-green-500',
    title: 'Get Ready to Coach',
    desc: 'Join a short onboarding — learn how our AI tools support your teaching, and pick up tips from top coaches.'
  }
];

export default function OnboardingJourney() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-text">
          Your Journey to Becoming a Coach
        </h2>
        <p className="mt-2 text-lg text-text-muted">
          A simple, supportive path from application to your first student. We're here to guide you every step of the way.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Row 1: Steps 1, 2, 3 */}
        {steps.slice(0, 3).map((step) => {
          const Icon = step.icon;
          return (
            <Card key={step.number} variant="elevated" padding="lg" className="relative flex flex-col items-center text-center min-h-[320px]">
              {/* Numbered Badge */}
              <div className={`absolute -top-4 right-6 w-8 h-8 flex items-center justify-center text-white rounded-full text-base font-bold shadow ${step.badgeBg}`}>{step.number}</div>
              {/* Icon */}
              <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${step.iconBg} mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">{step.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{step.desc}</p>
            </Card>
          );
        })}
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Row 2: Step 4 and Final Card */}
        <Card variant="elevated" padding="lg" className="relative flex flex-col items-center text-center min-h-[320px]">
          {/* Special Badge */}
          <div className="absolute -top-4 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white text-orange-500 text-base font-bold shadow">
            <span>🎯</span>
          </div>
          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="text-lg font-bold text-text mb-2">Get Ready to Coach</h3>
          <p className="text-text-muted text-sm leading-relaxed">Join a short onboarding — learn how our AI tools support your teaching, and pick up tips from top coaches.</p>
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow">
            <span className="text-orange-500">⏰</span>
            <span className="font-semibold">30 min session</span>
            <span className="ml-2 text-text-muted text-sm">Your journey starts here</span>
          </div>
        </Card>
        <Card variant="elevated" padding="lg" className="relative bg-gradient-to-br from-orange-400 to-red-500 text-white flex flex-col items-center text-center min-h-[320px] md:col-span-2">
          <div className="absolute -top-4 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white text-orange-500 text-base font-bold shadow">
            <StarIcon className="w-5 h-5" />
          </div>
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 mb-4">
            <RocketLaunchIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-2">Start Teaching</h3>
          <p className="text-white/90 text-sm leading-relaxed">Connect with learners from around the world. Inspire real progress and build your own global classroom.</p>
        </Card>
      </div>

      {/* Progress Indicator & Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow">
          <span className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="w-3 h-3 rounded-full bg-orange-400" />
          <span className="ml-2 text-text-muted text-sm">Your journey starts here</span>
        </div>
        <Button variant="primary" size="lg">
          Apply Now
        </Button>
      </div>
    </section>
  );
} 