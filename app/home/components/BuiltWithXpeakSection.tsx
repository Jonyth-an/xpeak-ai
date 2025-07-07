import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Brain, Puzzle, Sparkles, Map, Users } from 'lucide-react';

const xpeakFeatures = [
  {
    icon: <Brain className="w-6 h-6" />, 
    title: "Sagea", 
    subtitle: "Your lifelong learning partner",
    gradient: "from-[#ff7e5f] to-[#feb47b]" // orange-pink to peach
  },
  {
    icon: <Puzzle className="w-6 h-6" />, 
    title: "Word Maze", 
    subtitle: "Vocabulary built into memory",
    gradient: "from-[#43cea2] to-[#185a9d]" // green to blue
  },
  {
    icon: <Sparkles className="w-6 h-6" />, 
    title: "Topic Sparks", 
    subtitle: "AI-generated ideas to explore",
    gradient: "from-[#f7971e] to-[#ffd200]" // golden yellow
  },
  {
    icon: <Map className="w-6 h-6" />, 
    title: "Learning Treks", 
    subtitle: "Structured paths from sparks",
    gradient: "from-[#00c6ff] to-[#0072ff]" // light blue to deep blue
  },
  {
    icon: <Users className="w-6 h-6" />, 
    title: "Tutors & Crew", 
    subtitle: "Human and AI support in sync",
    gradient: "from-[#f953c6] to-[#b91d73]" // pink to purple
  },
];

export default function BuiltWithXpeakSection() {
  return (
    <section className="p-token-20 bg-token-surface/50">
      <div className="container-xl mx-auto px-token-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-token-center mb-token-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-token-display-lg md:text-token-display-xl font-token-bold mb-token-8 bg-gradient-to-r from-token-primary to-token-secondary bg-clip-text text-transparent">
              Built with the Power of Xpeak AI
            </h2>
            <p className="text-token-body-xl text-token-secondary leading-relaxed max-w-4xl mx-auto mb-token-12">
              At the core of Xpeak is an adaptive learning engine that evolves with you. It remembers what you've
              learned, suggests what's next, and connects you with the right content, tools, and people — at the right
              time.
            </p>
            <p className="text-token-body-lg text-token-secondary mb-token-8">Xpeak AI powers every step of your journey:</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-token-6 max-w-6xl mx-auto">
            {xpeakFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex-1 min-w-[200px] max-w-[220px]"
              >
                <Card className="p-token-6 text-token-center hover:shadow-lg transition-base border-regular border-token-border hover:border-token-primary h-full bg-token-surface">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-token-4 text-token-inverse`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-token-heading-lg font-token-bold text-token-primary mb-token-2">{feature.title}</h3>
                  <p className="text-token-body-md text-token-secondary">{feature.subtitle}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 