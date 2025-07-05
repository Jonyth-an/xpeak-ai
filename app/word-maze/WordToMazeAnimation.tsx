"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card } from "@/app/components/ui";
import { Lightbulb, Rocket, Link as LinkIcon, PenTool, Gamepad2, Sparkles } from "lucide-react";

interface WordNode {
  id: string;
  word: string;
  x: number;
  y: number;
  connected?: boolean;
}

interface AnimationStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const animationSteps: AnimationStep[] = [
  {
    id: 1,
    title: "Word Capture",
    description: "You learn a new word during a lesson or reading.",
    icon: <PenTool className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Maze Connection",
    description: "Word is added to your evolving Word Maze.",
    icon: <LinkIcon className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    title: "AI Enhancement",
    description: "AI adds examples, definitions, and smart review cards.",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: 4,
    title: "Review & Play",
    description: "You review it with mini-games and earn XP.",
    icon: <Gamepad2 className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 5,
    title: "Maze Powers Your Next Spark",
    description: "Your Maze insights help unlock your next Topic Spark.",
    icon: <Rocket className="w-6 h-6" />,
    color: "from-violet-500 to-purple-500",
  },
];

const relatedWords = [
  { word: "coincidence", x: 150, y: 100 },
  { word: "chance", x: 250, y: 180 },
  { word: "fortune", x: 100, y: 220 },
  { word: "destiny", x: 300, y: 120 },
  { word: "luck", x: 200, y: 280 },
];

export default function WordToMazeAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordNodes, setWordNodes] = useState<WordNode[]>([]);
  const [showConnections, setShowConnections] = useState(false);
  const [showEnhancements, setShowEnhancements] = useState(false);

  // Memoize random positions, durations, and delays for the background dots
  const backgroundDots = useMemo(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
    }));
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= animationSteps.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2000);

      return () => clearInterval(timer);
    }
  }, [isPlaying]);

  // Auto-start animation after 5 seconds
  useEffect(() => {
    const autoStartTimer = setTimeout(() => {
      if (!isPlaying && currentStep === 0) {
        setIsPlaying(true);
      }
    }, 5000); // 5 seconds delay

    return () => clearTimeout(autoStartTimer);
  }, [isPlaying, currentStep]);

  useEffect(() => {
    // Reset animations when step changes
    setShowConnections(false);
    setShowEnhancements(false);
    setWordNodes([]);

    if (currentStep === 1) {
      // Show maze connections
      setTimeout(() => {
        setWordNodes(
          relatedWords.map((word, index) => ({
            id: `word-${index}`,
            word: word.word,
            x: word.x,
            y: word.y,
            connected: false,
          }))
        );
      }, 500);

      setTimeout(() => {
        setShowConnections(true);
        setWordNodes((prev) => prev.map((node) => ({ ...node, connected: true })));
      }, 1000);
    } else if (currentStep === 2) {
      // Show AI enhancements
      setTimeout(() => setShowEnhancements(true), 500);
    }
  }, [currentStep]);

  const startAnimation = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            See How Words Become Worlds
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Watch your vocabulary transform into an interconnected universe of knowledge
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Animation Visualization */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 min-h-[500px] relative overflow-hidden">
              {/* Background constellation effect */}
              <div className="absolute inset-0 opacity-10">
                {backgroundDots.map((dot, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-500 rounded-full"
                    style={{
                      left: `${dot.left}%`,
                      top: `${dot.top}%`,
                    }}
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: dot.duration,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: dot.delay,
                    }}
                  />
                ))}
              </div>

              {/* Main word - Serendipity */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: currentStep >= 0 ? 1 : 0,
                  scale: currentStep >= 0 ? 1 : 0,
                }}
                transition={{ duration: 0.8, type: "spring" }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg">
                  serendipity
                </div>
              </motion.div>

              {/* Related word nodes */}
              <AnimatePresence>
                {wordNodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    className="absolute"
                    style={{ left: node.x, top: node.y }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ delay: index * 0.1, type: "spring" }}
                  >
                    <div className="bg-white border-2 border-purple-300 px-4 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-shadow">
                      {node.word}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Connection lines */}
              {showConnections && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {wordNodes.map((node, index) => (
                    <motion.line
                      key={`line-${index}`}
                      x1="50%"
                      y1="50%"
                      x2={node.x + 50}
                      y2={node.y + 20}
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                    />
                  ))}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {/* AI Enhancement cards */}
              <AnimatePresence>
                {showEnhancements && (
                  <>
                    <motion.div
                      className="absolute top-16 right-8"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="p-3 bg-amber-50 border-amber-200">
                        <div className="text-xs font-medium text-amber-800">Definition</div>
                        <div className="text-xs text-amber-700">A pleasant surprise</div>
                      </Card>
                    </motion.div>

                    <motion.div
                      className="absolute bottom-16 left-8"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="p-3 bg-green-50 border-green-200">
                        <div className="text-xs font-medium text-green-800">Example</div>
                        <div className="text-xs text-green-700">"What a serendipity!"</div>
                      </Card>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Spark effect for final step */}
              {currentStep === 4 && (
                <motion.div
                  className="absolute top-8 right-8"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Topic Spark
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="space-y-6">
            {animationSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`relative p-6 rounded-xl transition-all duration-500 ${
                  currentStep === index
                    ? "bg-white shadow-xl scale-105 border-2 border-blue-200"
                    : "bg-white/50 shadow-md hover:shadow-lg"
                }`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${step.color} text-white flex-shrink-0`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      {step.title}
                      {currentStep === index && (
                        <motion.div
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        />
                      )}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-200">
                  <motion.div
                    className="w-full bg-gradient-to-b from-blue-500 to-purple-500"
                    initial={{ height: 0 }}
                    animate={{ height: currentStep > index ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex justify-center gap-4">
            <Button
              onClick={startAnimation}
              disabled={isPlaying}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isPlaying ? "Playing..." : "🔄 Restart Animation"}
            </Button>

            <Button
              variant="outline"
              className="px-8 py-3 rounded-full text-lg font-semibold border-2 border-purple-300 hover:bg-purple-50 transition-all duration-300 bg-transparent"
            >
              🎮 Try Your Maze
            </Button>
          </div>

          <Button variant="ghost" className="text-purple-600 hover:text-purple-700 font-medium">
            🔍 View My Vocabulary World
          </Button>
        </div>
      </div>
    </section>
  );
} 