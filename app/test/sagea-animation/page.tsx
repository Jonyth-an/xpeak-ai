"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button, Card } from "@/app/components/ui"
import { Puzzle, Link, Sparkles, Map, GraduationCap, Brain, Play, Pause } from "lucide-react"

interface AnimationStep {
  id: number
  title: string
  caption: string
  icon: React.ReactNode
  color: string
  position: { x: number; y: number }
}

// Calculate exact positions using 72° intervals (360° ÷ 5 steps)
// Starting from top (0°) and going clockwise
// Center is at (400, 300), radius is 137.5 (increased by 5% from 131)
const calculatePosition = (angle: number, radius: number = 137.5) => {
  const centerX = 400
  const centerY = 300
  const radians = (angle * Math.PI) / 180
  return {
    x: centerX + radius * Math.sin(radians),
    y: centerY - radius * Math.cos(radians)
  }
}

const animationSteps: AnimationStep[] = [
  {
    id: 1,
    title: "Word Unlocked",
    caption: 'You learn "serendipity."',
    icon: <Puzzle className="w-6 h-6" />,
    color: "from-token-primary to-token-accent",
    position: calculatePosition(0), // 0° (top)
  },
  {
    id: 2,
    title: "Maze Connection",
    caption: 'Sagea links it to "coincidence" and "chance."',
    icon: <Link className="w-6 h-6" />,
    color: "from-token-accent to-token-secondary",
    position: calculatePosition(72), // 72° (top right)
  },
  {
    id: 3,
    title: "Spark Ignition",
    caption: "You're ready for a new Topic Spark.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-token-warning to-token-error",
    position: calculatePosition(144), // 144° (bottom right)
  },
  {
    id: 4,
    title: "Trek Formed",
    caption: "Sagea plots your personalized Trek.",
    icon: <Map className="w-6 h-6" />,
    color: "from-token-success to-token-accent",
    position: calculatePosition(216), // 216° (bottom left)
  },
  {
    id: 5,
    title: "Tutor Touchpoint",
    caption: "Your tutor jumps in with tailored guidance.",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "from-token-error to-token-primary",
    position: calculatePosition(288), // 288° (top left)
  },
]

// Add per-icon offset support for fine-tuning
const iconOffsets = [
  { x: -25, y: -35 }, // Word Unlocked
  { x: -25, y: -18 }, // Maze Connection
  { x: -38, y: -25 }, // Spark Ignition
  { x: -38, y: -25 }, // Trek Formed
  { x: -38, y: -22 }, // Tutor Touchpoint
];

export default function SageaAnimation() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showConnections, setShowConnections] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [debug, setDebug] = useState(false);
  const [stepCount, setStepCount] = useState(0);

  // Auto-start animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Animation cycle
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % animationSteps.length
        // Add completed step
        setCompletedSteps((completed) => {
          if (!completed.includes(prev)) {
            return [...completed, prev]
          }
          return completed
        })
        // Show connections after first cycle
        if (nextStep === 0 && !showConnections) {
          setShowConnections(true)
        }
        return nextStep
      })
      setStepCount((count) => count + 1); // Move this outside so it only increments once per interval
    }, 3000)

    return () => clearInterval(interval)
  }, [isPlaying, showConnections])

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
  }

  const restartAnimation = () => {
    setCurrentStep(0)
    setCompletedSteps([])
    setShowConnections(false)
    setIsPlaying(true)
    setStepCount(0) // Reset step count
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent">
      {/* Debug toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setDebug((d) => !d)}
          className="px-3 py-1 rounded bg-token-primary/20 text-token-primary-dark font-bold shadow hover:bg-token-primary/30"
        >
          {debug ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>
      {/* Header Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-token-primary via-token-accent to-token-success bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              How Sagea Guides Your Entire Journey
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-text-tertiary leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              From your very first word to your next real-world conversation — Sagea is always there, connecting the
              dots, lighting the path, and cheering you on.
            </motion.p>
          </div>

          {/* Main Animation Container */}
          <div className="flex justify-center mb-0">
            <div className="relative w-[800px] h-[600px] rounded-3xl overflow-hidden">
              {/* Central Sagea */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="w-24 h-24 bg-gradient-to-r from-token-primary to-token-accent rounded-full shadow-lg border-4 border-white flex items-center justify-center relative z-20"
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 20px rgba(var(--token-primary-rgb), 0.3)",
                      "0 0 40px rgba(var(--token-accent-rgb), 0.6)",
                      "0 0 20px rgba(var(--token-primary-rgb), 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
              </div>

              {/* Orbital Path */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
                  </linearGradient>
                </defs>

                {/* Orbital circle */}
                <circle
                  cx="400"
                  cy="300"
                  r="137.5"
                  fill="none"
                  stroke="url(#orbitGradient)"
                  strokeWidth="3"
                  strokeDasharray="8,4"
                  opacity="0.8"
                />
              </svg>

              {/* Animation Steps with debug overlay and offsets */}
              {animationSteps.map((step, index) => {
                const offset = iconOffsets[index];
                const x = step.position.x + offset.x;
                const y = step.position.y + offset.y;
                return (
                  <motion.div
                    key={step.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: x, top: y }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: 1,
                      scale: currentStep === index ? 1.2 : completedSteps.includes(index) ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    {/* Debug dot and coordinates */}
                    {debug && (
                      <>
                        <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-50" />
                        <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 text-xs bg-white/80 px-2 py-1 rounded shadow z-50">
                          ({Math.round(x)}, {Math.round(y)})
                        </div>
                      </>
                    )}
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full shadow-lg border-4 border-white flex items-center justify-center text-white relative`}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">{step.icon}</div>

                      {/* Active pulse effect */}
                      {currentStep === index && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-white/30"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        />
                      )}
                    </div>

                    {/* Step label */}
                    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md border border-slate-200/50 whitespace-nowrap">
                        <span className="text-sm font-semibold text-slate-700">{step.title}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Traveling Dot - moves along circular path clockwise */}
              <motion.div
                className="absolute w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg border-2 border-white transform -translate-x-1/2 -translate-y-1/2 z-30"
                animate={{
                  rotate: stepCount * 72, // Always increases, so always clockwise
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeInOut",
                }}
                style={{
                  left: "400px",
                  top: "300px",
                  transformOrigin: "0 0",
                }}
              >
                                  <div
                    className="absolute"
                    style={{
                      left: "0px",
                      top: "-137.5px", // radius distance from center
                    }}
                  >
                  <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg border-2 border-white relative">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-yellow-300/50"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.2, 0.6, 0.2],
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

              {/* Center Sagea icon and label inside SVG */}
              <g>
                <foreignObject x="360" y="260" width="80" height="100">
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center">
                      <Brain className="w-10 h-10 text-white" />
                    </div>
                    <span className="mt-20 bg-white px-5 py-2 rounded-full shadow text-base font-bold text-slate-700 drop-shadow-sm whitespace-nowrap">
                      Sagea
                    </span>
                  </div>
                </foreignObject>
              </g>
            </div>
          </div>

          {/* Current Step Description */}
          <div className="text-center mt-[-64px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="p-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div
                      className={`w-8 h-8 bg-gradient-to-r ${animationSteps[currentStep].color} rounded-full flex items-center justify-center text-white`}
                    >
                      {animationSteps[currentStep].icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 drop-shadow-sm">
                      {animationSteps[currentStep].title}
                    </h3>
                  </div>
                  <p className="text-base text-slate-600 drop-shadow-sm leading-relaxed">
                    {animationSteps[currentStep].caption}
                  </p>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  )
} 