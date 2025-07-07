import React from 'react';

const features = [
  {
    icon: '👥',
    bg: 'bg-token-primary/10',
    title: 'One Guide, Many Voices',
    subtext: 'Sagea is your central learning companion — supported by a diverse crew of AI personas and real human tutors.'
  },
  {
    icon: '🧠',
    bg: 'bg-token-secondary/10',
    title: 'Memory That Matters',
    subtext: 'Every chat, quiz, and topic builds Sagea\'s understanding of you — so each recommendation feels personal.'
  },
  {
    icon: '🤝',
    bg: 'bg-token-accent/10',
    title: 'Human-AI Synergy',
    subtext: 'Switch seamlessly between AI tutors and real tutors, while Sagea ensures continuity, context, and care.'
  },
  {
    icon: '💪',
    bg: 'bg-token-primary-light/10',
    title: 'Motivation Meets Mind',
    subtext: 'Sagea nudges, celebrates, and challenges you — keeping you engaged and improving at your pace.'
  },
  {
    icon: '🔄',
    bg: 'bg-token-accent-light/10',
    title: 'Always-On Support',
    subtext: 'Whether you need feedback, a pep talk, or a path forward — Sagea is here, 24/7.'
  }
];

export default function TutorValueCardsSection() {
  return (
    <section className="py-token-12 bg-token-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-token-8">
          <h2 className="text-token-display-lg md:text-token-display-xl font-token-bold text-token-text mb-token-4">
            💡 How Sagea Supports You Every Step of the Way
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-token-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-token-surface-subtle rounded-token-xl shadow-token-md p-token-6 flex flex-col items-center text-center hover:shadow-token-lg transition-shadow duration-200"
            >
              <div className={`w-token-16 h-token-16 flex items-center justify-center rounded-token-full mb-token-4 text-token-3xl ${feature.bg}`}>
                {feature.icon}
              </div>
              <h3 className="text-token-xl font-token-bold text-token-text mb-token-2">{feature.title}</h3>
              <p className="text-token-text-muted text-token-base">{feature.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 