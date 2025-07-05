import React from 'react';

export default function GlobalLearnerProofSection() {
  const stats = [
    {
      number: '1M+',
      label: 'Sparks Ignited'
    },
    {
      number: '500K+',
      label: 'Maze Nodes Unlocked'
    },
    {
      number: '2M+',
      label: 'AI + Human Tutor Minutes Logged'
    }
  ];

  const testimonials = [
    {
      quote: "It feels like I have a personal guide who actually remembers me.",
      author: "Mei",
      role: "Study Abroad Student"
    },
    {
      quote: "The Word Maze got me hooked. But it's the Sparks that keep me growing.",
      author: "Luca",
      role: "Startup Founder"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Trusted by Learners in 130+ Countries
          </h2>
          <p className="text-lg text-text-muted mb-8">
            Real-world learners, real-world results
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-text-muted font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-surface p-8 rounded-xl shadow-sm border border-border">
                <blockquote className="text-lg text-text-muted italic mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-text">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-text-muted">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 