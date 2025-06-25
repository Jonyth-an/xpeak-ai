import React from 'react';

export default function FeaturesSection() {
  const features = [
    {
      icon: "🎯",
      title: "Smart Learning Paths",
      description: "AI-powered curriculum that adapts to your learning style and pace"
    },
    {
      icon: "👥",
      title: "Real Human Tutors",
      description: "Connect with native speakers and certified language instructors"
    },
    {
      icon: "🎮",
      title: "Interactive Games",
      description: "Learn through fun, engaging games and challenges"
    },
    {
      icon: "📊",
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics and insights"
    },
    {
      icon: "🌍",
      title: "Cultural Immersion",
      description: "Experience real-world contexts and cultural nuances"
    }
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Why Choose Xpeak?
          </h2>
          <p className="text-xl text-text-muted max-w-3xl mx-auto">
            Discover the unique features that set us apart from traditional language learning platforms
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-text mb-2">
                {feature.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 