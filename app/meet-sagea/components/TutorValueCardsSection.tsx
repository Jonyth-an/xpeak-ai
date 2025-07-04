import React from 'react';

const features = [
  {
    icon: '👥',
    bg: 'bg-blue-100',
    title: 'One Guide, Many Voices',
    subtext: 'Sagea is your central learning companion — supported by a diverse crew of AI personas and real human tutors.'
  },
  {
    icon: '🧠',
    bg: 'bg-indigo-100',
    title: 'Memory That Matters',
    subtext: 'Every chat, quiz, and topic builds Sagea\'s understanding of you — so each recommendation feels personal.'
  },
  {
    icon: '🤝',
    bg: 'bg-green-100',
    title: 'Human-AI Synergy',
    subtext: 'Switch seamlessly between AI tutors and real tutors, while Sagea ensures continuity, context, and care.'
  },
  {
    icon: '💪',
    bg: 'bg-purple-100',
    title: 'Motivation Meets Mind',
    subtext: 'Sagea nudges, celebrates, and challenges you — keeping you engaged and improving at your pace.'
  },
  {
    icon: '🔄',
    bg: 'bg-cyan-100',
    title: 'Always-On Support',
    subtext: 'Whether you need feedback, a pep talk, or a path forward — Sagea is here, 24/7.'
  }
];

export default function TutorValueCardsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            💡 Feature Highlights
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-surface rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-200"
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-full mb-5 text-3xl ${feature.bg}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-text mb-2">{feature.title}</h3>
              <p className="text-text-muted text-base">{feature.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 