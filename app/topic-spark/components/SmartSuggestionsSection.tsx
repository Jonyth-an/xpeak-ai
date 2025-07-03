import React from 'react';
import { Sparkles, User, BookOpenText, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: <User className="w-6 h-6 text-token-text" />,
    title: 'Your Interests',
    desc: 'Topics shaped by what you like — hobbies, goals, and real-world use cases.',
  },
  {
    icon: <BookOpenText className="w-6 h-6 text-token-text" />,
    title: 'Lesson History',
    desc: 'Smart follow-ups based on what you recently learned or practiced.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-token-text" />,
    title: 'Popular Trends',
    desc: 'See what\'s trending in your region, age group, or learning level.',
  },
  {
    icon: <Sparkles className="w-6 h-6 text-token-text" />,
    title: 'AI + Human Touch',
    desc: 'Combining smart recommendations with tutor validation for better outcomes.',
  },
];

export default function SmartSuggestionsSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-token-text mb-4">
          🔍 How We Suggest Topics
        </h2>
        <p className="text-base text-token-text-secondary mb-10 max-w-2xl mx-auto">
          Behind every suggestion is a mix of real-world context and AI smarts. Here's what powers your personalized topics:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-token shadow-token text-left flex items-start gap-4 hover:shadow-token-lg transition-shadow duration-200"
            >
              <div className="flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-token-text mb-1">{feature.title}</h3>
                <p className="text-sm text-token-text-secondary">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 