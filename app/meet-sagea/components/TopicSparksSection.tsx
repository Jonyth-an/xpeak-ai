'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/app/components/ui';

export default function TopicSparksSection() {
  return (
    <section className="py-token-12 bg-gradient-to-br from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-token-10 items-center max-w-6xl mx-auto">
          {/* Left side - Visual with floating sparks */}
          <motion.div
            className="relative order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-gradient-to-br from-token-primary/10 to-token-secondary/10 rounded-token-2xl p-token-6 relative overflow-hidden h-80">
              {/* Central rotating spark */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="w-token-20 h-token-20 bg-gradient-to-r from-token-primary to-token-secondary rounded-token-full flex items-center justify-center shadow-token-2xl"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                    scale: { duration: 3, repeat: Number.POSITIVE_INFINITY },
                  }}
                >
                  <Sparkles className="w-token-10 h-token-10 text-white" />
                </motion.div>
              </div>

              {/* Orbiting topic sparks */}
              {["Travel", "Food", "Tech", "Art", "Science"].map((topic, index) => {
                const angle = index * 72 * (Math.PI / 180)
                const radius = 120
                const x = 200 + radius * Math.cos(angle - Math.PI / 2)
                const y = 200 + radius * Math.sin(angle - Math.PI / 2)

                return (
                  <motion.div
                    key={topic}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: x, top: y }}
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                      delay: index * 0.5,
                    }}
                  >
                    <div className="bg-token-surface rounded-token-full px-token-4 py-token-2 shadow-token-lg border-token-2 border-token-primary/20 text-token-sm font-token-semibold text-token-primary">
                      {topic}
                    </div>
                  </motion.div>
                )
              })}

              {/* Floating particles */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-token-2 h-token-2 bg-gradient-to-r from-token-primary/60 to-token-secondary/60 rounded-token-full opacity-60"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    x: [0, Math.random() * 10 - 5, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Right side - Content */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-token-4 mb-token-6">
              <div className="w-token-16 h-token-16 bg-gradient-to-r from-token-primary to-token-secondary rounded-token-xl flex items-center justify-center">
                <Sparkles className="w-token-8 h-token-8 text-white" />
              </div>
              <h2 className="text-token-display-lg md:text-token-display-xl font-token-bold text-token-text">Spark New Topics from What You Know</h2>
            </div>

            {/* Vertical feature cards */}
            <div className="space-y-token-4 mb-token-6">
              {[
                { title: "Personalized", desc: "Based on your interests and progress" },
                { title: "Timely", desc: "Suggested at the perfect learning moment" },
                { title: "Ready to Practice", desc: "Prepared for AI or tutor sessions" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-token-surface/80 backdrop-blur-sm rounded-token-lg p-token-4 shadow-token-lg border border-token-primary/20 flex items-center gap-token-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <div className="w-token-3 h-token-3 bg-gradient-to-r from-token-primary to-token-secondary rounded-token-full flex-shrink-0"></div>
                  <div>
                    <h3 className="font-token-semibold text-token-text">{feature.title}</h3>
                    <p className="text-token-sm text-token-text-secondary">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-token-lg text-token-text-secondary mb-token-6 leading-token-relaxed">
              Based on your progress and interests, Sagea suggests timely, personalized sparks — ready for AI practice
              or tutor sessions.
            </p>

            <Button
              size="lg"
              className="bg-gradient-to-r from-token-primary to-token-secondary hover:from-token-primary-dark hover:to-token-secondary-dark text-white px-token-6 py-token-3 rounded-token-full text-token-lg font-token-semibold shadow-token-lg"
            >
              Discover Sparks
              <Sparkles className="ml-token-2 w-token-5 h-token-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 