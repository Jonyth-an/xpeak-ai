import React from 'react';
import { HeartIcon, PencilIcon, PaperAirplaneIcon, Cog6ToothIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { Card } from '@/app/components/ui';

const benefits = [
  {
    icon: HeartIcon, bg: 'bg-token-primary',
    title: "Coach, Don't Just Chat",
    desc: 'Support real learner growth through structured guidance, goal-setting, and mentorship — not just small talk. Be the coach who changes lives.'
  },
  {
    icon: PencilIcon, bg: 'bg-token-accent',
    title: 'AI as Your Teaching Assistant',
    desc: 'From personalized topic suggestions to tracking student progress, our AI helps you teach smarter — and frees up your energy for what matters most.'
  },
  {
    icon: PaperAirplaneIcon, bg: 'bg-token-success',
    title: 'Teach From Anywhere, Anytime',
    desc: "Whether you're on a laptop in Lisbon or a café in Cape Town, your schedule is yours. Teach students around the globe, on your terms."
  },
  {
    icon: Cog6ToothIcon, bg: 'bg-token-warning',
    title: 'Built-In Tools, Less Admin',
    desc: 'Say goodbye to juggling spreadsheets. With Xpeak, scheduling, payments, and feedback are all in one seamless platform.'
  },
];

const avatars = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/men/45.jpg',
  'https://randomuser.me/api/portraits/men/11.jpg',
  'https://randomuser.me/api/portraits/women/65.jpg',
];

export default function WhyTeachSection() {
  return (
    <section className="bg-token-surface py-token-20 px-token-4 sm:px-token-6 lg:px-token-8">
      <div className="max-w-4xl mx-auto text-center mb-token-8">
        <h2 className="text-token-3xl md:text-token-4xl font-bold token-text-primary mb-token-2">
          Why Teach on Xpeak?
        </h2>
        <p className="text-token-lg token-text-secondary">
          Join a movement of passionate educators who are changing lives, one conversation at a time.
        </p>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-token-8 mb-token-10">
        {benefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <Card
              key={i}
              variant="default"
              padding="md"
              className="flex flex-col sm:flex-row items-start gap-token-4 relative overflow-hidden rounded-token-lg"
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${b.bg} mb-token-2 sm:mb-0`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-token-lg font-bold token-text-primary mb-token-1">{b.title}</h3>
                <p className="token-text-secondary text-token-base leading-relaxed">{b.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>
      {/* Community Card */}
      <div className="max-w-5xl mx-auto mt-token-8">
        <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-token-primary to-token-accent text-white text-center shadow-lg flex flex-col items-center rounded-token-lg">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-token-4 mx-auto">
            <UserGroupIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-token-2xl md:text-token-3xl font-bold mb-token-2">A Coaching Community, Not Just a Platform</h3>
          <p className="mb-token-6 text-white/90 max-w-2xl mx-auto text-token-lg">
            Join a global circle of passionate educators. Swap insights, celebrate wins, and grow together as part of something bigger.
          </p>
          <div className="flex justify-center gap-token-2 mb-token-2">
            {avatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Coach avatar"
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            ))}
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white font-semibold text-token-sm border-2 border-white ml-token-2">+100</span>
          </div>
        </Card>
      </div>
    </section>
  );
} 