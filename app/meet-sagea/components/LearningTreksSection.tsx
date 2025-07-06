'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { Button } from '@/app/components/ui';

export default function LearningTreksSection() {
  return (
    <section className="py-token-12 bg-token-surface">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-token-10 items-center max-w-6xl mx-auto">
          {/* Left side - Content */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-token-4 mb-token-6">
              <div className="w-token-16 h-token-16 bg-gradient-to-r from-token-accent to-token-accent-light rounded-token-2xl flex items-center justify-center">
                <Map className="w-token-8 h-token-8 text-white" />
              </div>
              <h2 className="text-token-display-lg md:text-token-display-xl font-token-bold text-token-text">
                Your Learning Trek, Mapped Just for You
              </h2>
            </div>

            <p className="text-token-xl text-token-text-secondary mb-token-8 leading-token-relaxed">
              Sagea organizes your Sparks into Trek paths — helping you stay curious or follow structured paths to
              fluency.
            </p>

            {/* Trek features */}
            <div className="space-y-token-4 mb-token-8">
              {[
                "Personalized learning pathways",
                "Flexible pacing and scheduling",
                "Progress tracking and milestones",
                "Adaptive difficulty adjustment",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-token-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-token-2 h-token-2 bg-token-accent rounded-token-full"></div>
                  <span className="text-token-text-secondary">{feature}</span>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-token-accent to-token-accent-light hover:from-token-accent-dark hover:to-token-accent text-white px-token-8 py-token-3 rounded-token-full text-token-lg font-token-semibold shadow-token-lg"
            >
              See Your Trek Map
              <Map className="ml-token-2 w-token-5 h-token-5" />
            </Button>
          </motion.div>

          {/* Right side - Trek path visualization */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-token-accent/10 to-token-accent-light/10 rounded-token-3xl p-token-8 relative overflow-hidden h-96">
              {/* Winding path */}
              <svg className="absolute inset-0 w-full h-full">
                <motion.path
                  d="M 80 270 Q 120 230 180 190 T 280 150 Q 320 110 360 130 T 380 190 Q 370 230 350 250"
                  stroke="url(#trekGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray="12,8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="trekGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-accent)" />
                    <stop offset="50%" stopColor="var(--color-accent-light)" />
                    <stop offset="100%" stopColor="var(--color-accent)" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Trek milestones along the path */}
              {[
                { label: "Start", x: 100, y: 250 },
                { label: "Explore", x: 180, y: 200 },
                { label: "Practice", x: 280, y: 150 },
                { label: "Master", x: 380, y: 120 },
                { label: "Apply", x: 360, y: 230 },
              ].map((milestone, index) => (
                <motion.div
                  key={milestone.label}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: milestone.x, top: milestone.y }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                >
                  <div className="bg-token-surface rounded-token-full w-token-12 h-token-12 flex items-center justify-center shadow-token-lg border-token-4 border-token-accent/20 relative">
                    <span className="text-token-sm font-token-bold text-token-accent">{index + 1}</span>

                    {/* Pulsing effect for active milestone */}
                    {index === 2 && (
                      <motion.div
                        className="absolute inset-0 rounded-token-full bg-token-accent/30"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    )}
                  </div>

                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
                    <span className="text-token-xs font-token-semibold text-token-text-secondary bg-token-surface px-token-2 py-token-1 rounded-token-full shadow-token-md whitespace-nowrap">
                      {milestone.label}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Floating progress indicators */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-token-1.5 h-token-1.5 bg-token-accent/60 rounded-token-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.4, 0.8, 0.4],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 