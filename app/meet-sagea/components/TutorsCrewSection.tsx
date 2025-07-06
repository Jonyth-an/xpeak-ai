'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Brain, Sparkles, Puzzle, GraduationCap } from 'lucide-react';
import { Button } from '@/app/components/ui';

export default function TutorsCrewSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <Users className="w-12 h-12 text-token-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-text">Real Tutors Meet Smart Intelligence</h2>
            </div>
          </motion.div>

          {/* Team visualization */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Team circles */}
            <motion.div
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-80 h-80 mx-auto">
                {/* Central Sagea coordinator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-20 h-20 bg-gradient-to-r from-token-primary to-token-secondary rounded-full flex items-center justify-center shadow-lg border-4 border-token-surface">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-text-secondary whitespace-nowrap">
                    Sagea Partner
                  </span>
                </div>

                {/* Surrounding team members */}
                {[
                  { role: "AI Tutor", color: "bg-token-accent", icon: "🤖" },
                  { role: "Human Tutor by Heart", color: "bg-token-accent-light", icon: "👨‍🏫" },
                  { role: "Topic Spark", color: "bg-token-primary-light", icon: <Sparkles className="w-4 h-4 text-white" /> },
                  { role: "Word Maze", color: "bg-token-secondary", icon: <Puzzle className="w-4 h-4 text-white" /> },
                  { role: "Lesson", color: "bg-token-accent-dark", icon: <GraduationCap className="w-4 h-4 text-white" /> },
                ].map((member, index) => {
                  const angle = index * 72 * (Math.PI / 180) // 72° intervals for 5 members
                  const radius = 120
                  const x = 130 + radius * Math.cos(angle - Math.PI / 2)
                  const y = 130 + radius * Math.sin(angle - Math.PI / 2)

                  return (
                    <motion.div
                      key={member.role}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: x, top: y }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    >
                      <div
                        className={`w-16 h-16 ${member.color} rounded-full flex items-center justify-center shadow-lg border-2 border-token-surface text-2xl`}
                      >
                        {typeof member.icon === "string" ? member.icon : member.icon}
                      </div>
                      <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-text-secondary whitespace-nowrap">
                        {member.role}
                      </span>
                    </motion.div>
                  )
                })}

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {[...Array(5)].map((_, i) => {
                    const angle = i * 72 * (Math.PI / 180)
                    const radius = 120
                    const x = 160 + radius * Math.cos(angle - Math.PI / 2)
                    const y = 160 + radius * Math.sin(angle - Math.PI / 2)

                    return (
                      <motion.line
                        key={i}
                        x1="160"
                        y1="160"
                        x2={x}
                        y2={y}
                        stroke="rgba(255, 107, 107, 0.3)"
                        strokeWidth="2"
                        strokeDasharray="4,2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 1 + i * 0.1 }}
                      />
                    )
                  })}
                </svg>
              </div>
            </motion.div>

            {/* Right side - Content */}
            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                Behind Sagea is a team of real human tutors and AI experts — dynamically matched to your needs, but
                all coordinated by Sagea.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Seamless handoffs between AI and human tutors",
                  "Consistent learning context across all sessions",
                  "Personalized matching based on your learning style",
                  "Real-time coordination and progress tracking",
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-token-primary rounded-full"></div>
                    <span className="text-text-secondary">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                size="lg"
                className="bg-gradient-to-r from-token-primary to-token-secondary hover:from-token-primary-dark hover:to-token-secondary-dark text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
              >
                Meet Your Crew
                <Users className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 