import React from 'react';
import { Card } from '@/app/components/ui';

const tutors = [
  {
    flag: '🇺🇸',
    name: 'Sarah',
    country: 'USA',
    quote: "Let's talk travel, business, or your next big idea.",
    background: 'Chicago-based • Business English & TOEFL',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    flag: '🇬🇧',
    name: 'James',
    country: 'UK',
    quote: 'Accent coaching with clarity and warmth.',
    background: 'London native • Conversation & Pronunciation',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    flag: '🇨🇦',
    name: 'Emma',
    country: 'Canada',
    quote: "From Netflix to news, let's build natural fluency.",
    background: 'Toronto • Cultural immersion expert',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    flag: '🇦🇺',
    name: 'Liam',
    country: 'Australia',
    quote: 'Confident speaking starts with small wins.',
    background: 'Sydney • Teens & adult learners',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
  },
  {
    flag: '🇿🇦',
    name: 'Thandi',
    country: 'South Africa',
    quote: "I'll guide your goals with honest, kind feedback.",
    background: 'Johannesburg • IELTS & growth coaching',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
  {
    flag: '🇮🇪',
    name: 'Aoife',
    country: 'Ireland',
    quote: "Let's make English fun and truly yours.",
    background: 'Dublin • Everyday English & confidence',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
  },
];

export default function GlobalCoachGridSection() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            English Coaches Around the World
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Xpeak connects you with passionate English tutors from across the globe — each bringing unique insights, accents, and experiences.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tutors.map((tutor, idx) => (
            <Card
              key={idx}
              variant="default"
              padding="lg"
              className="flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-200"
            >
              <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-4 border-indigo-100 shadow">
                <img src={tutor.avatar} alt={tutor.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">{tutor.flag}</span>
                <span className="text-lg font-bold text-text">{tutor.name}</span>
              </div>
              <div className="text-sm text-text-secondary mb-2">{tutor.background}</div>
              <div className="italic text-indigo-700 text-base">"{tutor.quote}"</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 