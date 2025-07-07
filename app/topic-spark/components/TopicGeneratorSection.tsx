import React from 'react';
import { Button, Card } from '@/app/components/ui';

const cards = [
  {
    icon: <span className="text-4xl">🖼️</span>,
    title: 'Upload a File',
    subtitle: <><span className="text-lg">🖼️</span> <span className="font-bold">Upload a File</span></>,
    desc: 'Menu, homework, guide — turn it into a conversation.',
    variant: 'secondary' as const,
    buttonText: 'Upload File',
  },
  {
    icon: <span className="text-4xl">🔗</span>,
    title: 'Add a Website Link',
    subtitle: <><span className="text-lg">🔗</span> <span className="font-bold">Add a Website Link</span></>,
    desc: 'Paste any URL — we\'ll build a speaking session around it.',
    variant: 'secondary' as const,
    buttonText: 'Add Link',
  },
  {
    icon: <span className="text-4xl">✍️</span>,
    title: 'Write a Prompt',
    subtitle: <><span className="text-lg">✍️</span> <span className="font-bold">Write a Prompt</span></>,
    desc: 'Describe your dream lesson, and we\'ll make it real.',
    variant: 'feature' as const,
    buttonText: 'Write Prompt',
  },
];

export default function TopicGeneratorSection() {
  return (
    <section className="py-token-16 px-token-4 bg-token-surface-accent-light">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-token-display-lg font-token-bold text-token-primary mb-token-6 text-center">
          🚀 Generate a Topic Your Way
        </h2>
        <p className="text-token-body-lg text-token-text-secondary mb-token-12 text-center">
          Choose your favorite way to spark a new lesson. Upload, link, or write — Sagea adapts to you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-token-8">
          {cards.map((card, idx) => (
            <Card key={idx} className="flex flex-col items-center p-token-8 rounded-token-xl shadow-token-md bg-white">
              <div className="mb-token-4">{card.icon}</div>
              <h3 className="text-token-heading-lg font-token-semibold text-token-primary mb-token-2 text-center">
                {card.title}
              </h3>
              <p className="text-token-body-lg text-token-text-secondary mb-token-6 text-center">
                {card.desc}
              </p>
              <Button variant={card.variant} size="md" className="w-full">
                {card.buttonText}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 