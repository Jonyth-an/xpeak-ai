import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Brain,
  Puzzle,
  Sparkles,
  Map,
  Users,
  ArrowRight,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: <Puzzle className="w-8 h-8" />,
    title: "Word Maze",
    description: "Learn words by unlocking a maze of meaning.",
    detail: "Your vocabulary journey becomes a game of discovery — powered by AI and context-aware reviews.",
    color: "from-token-primary to-token-primary-dark",
    cta: "Explore Word Maze",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Topic Sparks",
    description: "New ideas, auto-generated, just for you.",
    detail: "Sparks are personalized prompts that turn into full lessons, podcasts, or tutor sessions.",
    color: "from-token-secondary to-token-secondary-dark",
    cta: "Ignite a Topic Spark",
  },
  {
    icon: <Map className="w-8 h-8" />,
    title: "Learning Treks",
    description: "Trek through your progress.",
    detail: "Your sparks form a constellation of interconnected topics — a roadmap that adapts as you learn.",
    color: "from-token-accent to-token-accent-dark",
    cta: "View Trek Map",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Human & AI Tutors",
    description: "Guidance, support, and context.",
    detail: "Match with tutors based on your goals, while Sagea ensures the learning stays continuous.",
    color: "from-token-accent-light to-token-primary-light",
    cta: "Find Your Tutor",
  },
];

export default function EverythingYouNeedSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section className="p-token-20">
      <div className="container-xl mx-auto px-token-4">
        <motion.h2
          className="text-token-display-lg md:text-token-display-xl font-token-bold text-token-center mb-token-16 text-token-primary"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Everything You Need to Learn
        </motion.h2>

        <div className="max-w-7xl mx-auto">
          {/* Featured card - Sagea */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-token-8"
          >
            <Card className="p-token-8 transition-base hover:shadow-xl border-regular border-token-secondary bg-gradient-to-r from-token-secondary/10 to-token-accent/10">
              <div className="flex items-center justify-center gap-token-8">
                <div className="w-20 h-20 bg-gradient-to-r from-token-accent to-token-secondary rounded-2xl flex items-center justify-center text-token-inverse flex-shrink-0">
                  <Brain className="w-10 h-10" />
                </div>
                <div className="text-token-center flex-1">
                  <div className="flex items-center justify-center gap-token-2 mb-token-3">
                    <Check className="w-5 h-5 text-token-success" />
                    <h3 className="text-token-display-sm font-token-bold text-token-primary">Sagea</h3>
                  </div>
                  <p className="text-token-body-xl font-token-medium text-token-secondary mb-token-3">The partner that ties it all together.</p>
                  <p className="text-token-secondary mb-token-6 leading-relaxed max-w-2xl mx-auto">
                    Sagea tracks your learning, nudges your progress, and personalizes your experience — with heart
                    and intelligence.
                  </p>
                  <Link href="/meet-sagea">
                    <Button
                      variant="outline"
                      className="border-regular border-token-secondary text-token-secondary hover:bg-token-secondary/10 group bg-transparent transition-base"
                    >
                      Meet Sagea
                      <ArrowRight className="ml-token-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Other 4 cards in 2x2 grid */}
          <div className="grid lg:grid-cols-2 gap-token-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
              >
                <Card
                  className={`p-token-8 h-full transition-base hover:shadow-xl border-regular ${
                    hoveredFeature === index ? "border-token-primary shadow-lg scale-105" : "border-token-border"
                  }`}
                >
                  <div className="flex items-start gap-token-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-token-inverse flex-shrink-0`}
                    >
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-token-2 mb-token-3">
                        <Check className="w-5 h-5 text-token-success" />
                        <h3 className="text-token-heading-xl font-token-bold text-token-primary">{feature.title}</h3>
                      </div>
                      <p className="text-token-body-lg font-token-medium text-token-secondary mb-token-3">{feature.description}</p>
                      <p className="text-token-secondary mb-token-6 leading-relaxed">{feature.detail}</p>
                      <Link href={feature.title === "Word Maze" ? "/word-maze" : feature.title === "Topic Sparks" ? "/topic-spark" : feature.title === "Learning Treks" ? "/topic-spark" : "/meet-sagea"}>
                        <Button
                          variant="outline"
                          className="border-regular border-token-border text-token-secondary hover:bg-token-surface-subtle group bg-transparent transition-base"
                        >
                          {feature.cta}
                          <ArrowRight className="ml-token-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 