import React from 'react';

export default function WhatIsXpeakSection() {
  const components = [
    {
      icon: '🧠',
      name: 'Sagea',
      description: 'Your lifelong learning partner'
    },
    {
      icon: '🧩',
      name: 'Word Maze',
      description: 'Vocabulary built into memory'
    },
    {
      icon: '✨',
      name: 'Topic Sparks',
      description: 'AI-generated ideas to explore'
    },
    {
      icon: '🗺️',
      name: 'Learning Treks',
      description: 'Structured paths from sparks'
    },
    {
      icon: '👥',
      name: 'Tutors & Crew',
      description: 'Human and AI support in sync'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-6">
            Built with the Power of Xpeak AI
          </h2>
          <p className="text-lg md:text-xl text-text-muted max-w-4xl mx-auto leading-relaxed">
            At the core of Xpeak is an adaptive learning engine that evolves with you. It remembers what you've learned, suggests what's next, and connects you with the right content, tools, and people — at the right time.
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-xl font-semibold text-text mb-8 text-center">
            Xpeak AI powers every step of your journey:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-surface rounded-xl shadow-sm border border-border">
                <div className="text-3xl flex-shrink-0">
                  {component.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-text mb-1">
                    {component.name}
                  </h4>
                  <p className="text-text-muted text-sm">
                    {component.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 