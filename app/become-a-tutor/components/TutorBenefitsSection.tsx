import React from 'react';
import { GlobeAltIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, BriefcaseIcon } from '@heroicons/react/24/solid';

const benefits = [
  {
    icon: GlobeAltIcon,
    title: 'Teach from Anywhere',
    desc: 'All you need is Wi-Fi and passion. Work from home, cafés, or while traveling.',
    bg: 'bg-token-surface-accent-light',
    iconColor: 'text-token-primary'
  },
  {
    icon: AcademicCapIcon,
    title: 'Focus on Coaching',
    desc: 'Admin tools and logistics are handled for you, so you can focus on teaching.',
    bg: 'bg-token-surface-accent',
    iconColor: 'text-token-accent'
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Supportive Team & Tools',
    desc: 'Get ongoing training support and connect with a community of fellow coaches.',
    bg: 'bg-token-surface-success',
    iconColor: 'text-token-success'
  },
  {
    icon: BriefcaseIcon,
    title: 'Build a Brand',
    desc: 'Grow your reviews, build your teaching portfolio, and expand your impact.',
    bg: 'bg-token-surface-warning',
    iconColor: 'text-token-warning'
  }
];

export default function TutorBenefitsSection() {
  return (
    <section className="py-20 bg-token-surface">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-text">
          Empower Learners. Grow as a Coach.
        </h2>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div
              key={idx}
              className={`rounded-2xl shadow p-6 ${b.bg}`}
            >
              <div className={`w-12 h-12 mb-4 flex items-center justify-center rounded-full bg-white/50 ${b.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-text mb-2">
                {b.title}
              </h3>
              <p className="text-text-tertiary">{b.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
} 