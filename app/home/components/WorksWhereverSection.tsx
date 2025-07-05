import React from 'react';

export default function WorksWhereverSection() {
  const features = [
    {
      icon: '💻',
      title: 'Desktop and mobile web',
      description: 'Access your learning journey from any device, anywhere in the world.'
    },
    {
      icon: '🎥',
      title: 'Tutors via video or chat',
      description: 'Connect with tutors through your preferred communication method.'
    },
    {
      icon: '🌐',
      title: 'Syncs across time zones, levels, and contexts',
      description: 'Your progress follows you, adapting to your schedule and learning environment.'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Works Wherever You Learn
          </h2>
          <p className="text-lg text-text-muted max-w-3xl mx-auto">
            Your learning journey adapts to your lifestyle, not the other way around
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">
                {feature.title}
              </h3>
              <p className="text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 