import React from 'react';

const testimonials = [
  {
    quote: "Even with different tutors, I feel like Sagea always remembers me.",
    author: "Akira, Global English Learner",
    rating: 5,
  },
  {
    quote: "Word Maze + Sagea? Vocabulary finally makes sense.",
    author: "Carlos, UX Designer",
    rating: 5,
  },
  {
    quote: "It's not just lessons, it's a journey.",
    author: "Mina, Study Abroad Student",
    rating: 5,
  },
];

export default function TestimonialSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-token-surface-accent-light to-token-surface-accent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-text mb-12">What Learners Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-token-surface rounded-2xl shadow-lg min-w-[340px] p-6 flex flex-col border border-token-primary/20">
              <div className="text-4xl mb-4 text-token-primary">{/* Chat bubble icon */}
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-4.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/></svg>
              </div>
              <blockquote className="text-xl md:text-2xl font-medium text-text mb-4 italic">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(t.rating)].map((_, idx) => (
                  <span key={idx} className="text-token-accent text-lg">★</span>
                ))}
              </div>
              <div className="text-base text-text-secondary font-medium">
                — {t.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 