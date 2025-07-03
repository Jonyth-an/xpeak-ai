import React from 'react';

const values = [
  {
    icon: '🧠',
    bg: 'bg-blue-100',
    title: 'Real Teaching Experience',
    subtext: 'Experienced in language education, not just casual conversation.'
  },
  {
    icon: '💙',
    bg: 'bg-indigo-100',
    title: 'Empathy & Encouragement',
    subtext: 'Supportive mentors who truly care about your growth.'
  },
  {
    icon: '🎯',
    bg: 'bg-green-100',
    title: 'Coaching Trained',
    subtext: 'Skilled in feedback, motivation, and goal-setting.'
  },
  {
    icon: '🤖',
    bg: 'bg-accent-light',
    title: 'AI-Enhanced Support',
    subtext: 'Trained to use our AI tools to personalize your path.'
  }
];

export default function TutorValueCardsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Coaches Who Guide, Not Just Talk
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Every tutor on Xpeak AI is trained to do more than just talk. They guide your learning journey — helping you build confidence, speak naturally, and reach your goals with support that sticks.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, idx) => (
            <div
              key={idx}
              className="bg-surface rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-200"
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-5 text-3xl ${v.bg}`}>
                {v.icon}
              </div>
              <h3 className="text-xl font-bold text-text mb-2">{v.title}</h3>
              <p className="text-text-muted text-base">{v.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 