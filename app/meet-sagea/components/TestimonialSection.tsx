import React from 'react';

export default function TestimonialSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="text-6xl mb-6">💬</div>
            <blockquote className="text-2xl md:text-3xl font-medium text-text mb-6 italic">
              "Even with different tutors, I feel like Sagea always remembers me. It's like having a coach who gets it."
            </blockquote>
            <div className="text-lg text-text-secondary">
              — Akira, Global English Learner
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 