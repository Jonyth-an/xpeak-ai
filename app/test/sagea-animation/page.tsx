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
// Center is at (400, 300), radius is 170 (adjusted from 180)
const calculatePosition = (angle: number, radius: number = 170) => {
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
    color: "from-blue-500 to-cyan-500",
    position: calculatePosition(0), // 0° (top)
  },
  {
    id: 2,
    title: "Maze Connection",
    caption: 'Sagea links it to "coincidence" and "chance."',
    icon: <Link className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
    position: calculatePosition(72), // 72° (top right)
  },
  {
    id: 3,
    title: "Spark Ignition",
    caption: "You're ready for a new Topic Spark.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-amber-500 to-orange-500",
    position: calculatePosition(144), // 144° (bottom right)
  },
  {
    id: 4,
    title: "Trek Formed",
    caption: "Sagea plots your personalized Trek.",
    icon: <Map className="w-6 h-6" />,
    color: "from-emerald-500 to-teal-500",
    position: calculatePosition(216), // 216° (bottom left)
  },
  {
    id: 5,
    title: "Tutor Touchpoint",
    caption: "Your tutor jumps in with tailored guidance.",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "from-rose-500 to-red-500",
    position: calculatePosition(288), // 288° (top left)
  },
]

// Add per-icon offset support for fine-tuning
const iconOffsets = [
  { x: -30, y: -40 }, // Word Unlocked
  { x: -18, y: -20 }, // Maze Connection
  { x: -30, y: -20 }, // Spark Ignition
  { x: -40, y: -20 }, // Trek Formed
  { x: -45, y: -30 }, // Tutor Touchpoint
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Debug toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setDebug((d) => !d)}
          className="px-3 py-1 rounded bg-blue-200 text-blue-900 font-bold shadow hover:bg-blue-300"
        >
          {debug ? 'Hide Debug' : 'Show Debug'}
        </button>
      </div>
      {/* Header Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              How Sagea Guides Your Entire Journey
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-slate-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              From your very first word to your next real-world conversation — Sagea is always there, connecting the
              dots, lighting the path, and cheering you on.
            </motion.p>
          </div>

          {/* Main Animation Container */}
          <div className="flex justify-center mb-16">
            <div className="relative w-[800px] h-[600px] bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
              {/* Central Sagea */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg border-4 border-white flex items-center justify-center relative z-20"
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                      "0 0 40px rgba(139, 92, 246, 0.6)",
                      "0 0 20px rgba(59, 130, 246, 0.3)",
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
                  r="180"
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
                      <div className="bg-white px-3 py-1 rounded-full shadow-md border border-slate-200 whitespace-nowrap">
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
                    top: "-180px", // radius distance from center
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
            </div>
          </div>

          {/* Current Step Description */}
          <div className="text-center mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="p-8 bg-white/90 backdrop-blur-sm border-2 border-blue-100 shadow-lg">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${animationSteps[currentStep].color} rounded-full flex items-center justify-center text-white`}
                    >
                      {animationSteps[currentStep].icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">{animationSteps[currentStep].title}</h3>
                  </div>
                  <p className="text-lg text-slate-600">{animationSteps[currentStep].caption}</p>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="text-center space-y-6">
            <div className="flex justify-center gap-4">
              <Button
                onClick={toggleAnimation}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 w-5 h-5" />
                    Pause Journey
                  </>
                ) : (
                  <>
                    <Play className="mr-2 w-5 h-5" />
                    Resume Journey
                  </>
                )}
              </Button>

              <Button
                onClick={restartAnimation}
                variant="outline"
                className="px-8 py-3 rounded-full text-lg font-semibold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all duration-300 bg-transparent"
              >
                🔄 Restart Journey
              </Button>
            </div>

            <div className="flex justify-center gap-6">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50">
                🎮 Start Your Journey
              </Button>
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700 font-medium hover:bg-purple-50">
                🔍 Learn More About Sagea
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 