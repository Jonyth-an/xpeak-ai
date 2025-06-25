import React from 'react';

const testimonials = [
    {
      name: "Sofia",
      country: "🇨🇳 China",
      quote: "I love how Xpeak lets me choose topics I care about. I talked with a tutor about photography, then the AI gave me new vocab from our chat — it's like learning built around my passions.",
      tag: "🧭 Intermediate learner focused on lifestyle conversation."
    },
    {
      name: "Carlos",
      country: "🇰🇷 Korea",
      quote: "I was stuck in boring lessons before. Now, I learn through music and trending topics. Xpeak is fun, fresh, and actually makes me want to keep learning.",
      tag: "🎵 Intermediate learner passionate about pop culture & media."
    },
    {
      name: "Aylin",
      country: "🇹🇷 Turkey",
      quote: "I used to feel lost with too many resources. Xpeak gave me structure — real coaching with AI that helps me review exactly what I need. It's smart and human at the same time.",
      tag: "📚 Upper-intermediate learner preparing for study abroad."
    },
    {
      name: "Mateus",
      country: "🇧🇷 Brazil",
      quote: "What I love most is the Word Maze. It turns new words into real-life examples, and my tutor helps me use them right away. It finally clicks.",
      tag: "🧠 Ambitious learner aiming to use English at work."
    },
    {
      name: "Kalid",
      country: "🇸🇦 Saudi Arabia",
      quote: "The combination of AI and tutors is brilliant. One session I'm practicing business phrases, the next I'm getting instant feedback on my pronunciation. It feels like the future of learning.",
      tag: "💼 Professional learner focused on global communication."
    },
    {
      name: "Hiroshi",
      country: "🇯🇵 Japan",
      quote: "I was nervous to start learning English again, but Xpeak made it easy. The AI gave me simple, friendly lessons, and my tutor always encouraged me. Now I speak with more confidence, step by step.",
      tag: "👶 Beginner learner rebuilding confidence and basics."
    }
  ];
  
  export default function TestimonialsSection() {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-text mb-12">
            What Our Learners Are Saying
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-surface p-6 rounded-xl shadow-sm border border-border">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t.name} <span className="ml-1 text-sm text-text-secondary">{t.country}</span>
                  </h3>
                </div>
                <p className="text-text-secondary italic mb-4">"{t.quote}"</p>
                <p className="text-sm text-text-secondary">{t.tag}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  