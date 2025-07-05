'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';
import { Button } from '@/app/components/ui';

export default function LearningTreksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left side - Content */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <Map className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800">
                Your Learning Trek, Mapped Just for You
              </h2>
            </div>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Sagea organizes your Sparks into Trek paths — helping you stay curious or follow structured paths to
              fluency.
            </p>

            {/* Trek features */}
            <div className="space-y-4 mb-8">
              {[
                "Personalized learning pathways",
                "Flexible pacing and scheduling",
                "Progress tracking and milestones",
                "Adaptive difficulty adjustment",
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-slate-700">{feature}</span>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
            >
              See Your Trek Map
              <Map className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Right side - Trek path visualization */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 relative overflow-hidden h-96">
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
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="50%" stopColor="#14B8A6" />
                    <stop offset="100%" stopColor="#06B6D4" />
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
                  <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border-4 border-emerald-200 relative">
                    <span className="text-sm font-bold text-emerald-600">{index + 1}</span>

                    {/* Pulsing effect for active milestone */}
                    {index === 2 && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-emerald-400/30"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    )}
                  </div>

                  <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
                    <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-1 rounded-full shadow-md whitespace-nowrap">
                      {milestone.label}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Floating progress indicators */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 bg-emerald-400/60 rounded-full"
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