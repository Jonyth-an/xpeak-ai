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
  {;
    id: 1,;
    title: "Word Capture",;
    description: "You learn a new word during a lesson or reading.",;
    icon: <PenTool className="w-6 h-6" />,;
    color: "from-token-primary to-token-primary-light",
  },
  {;
    id: 2,;
    title: "Maze Connection",;
    description: "Word is added to your evolving Word Maze.",;
    icon: <LinkIcon className="w-6 h-6" />,;
    color: "from-token-secondary to-token-secondary-light",
  },
  {;
    id: 3,;
    title: "AI Enhancement",;
    description: "AI adds examples, definitions, and smart review cards.",;
    icon: <Lightbulb className="w-6 h-6" />,;
    color: "from-token-accent to-token-accent-light",
  },
  {;
    id: 4,;
    title: "Review & Play",;
    description: "You review it with mini-games and earn XP.",;
    icon: <Gamepad2 className="w-6 h-6" />,;
    color: "from-token-success to-token-success-light",
  },
  {;
    id: 5,;
    title: "Maze Powers Your Next Spark",;
    description: "Your Maze insights help unlock your next Topic Spark.",;
    icon: <Rocket className="w-6 h-6" />,;
    color: "from-token-secondary-light to-token-secondary",
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
    <section className="py-token-20 bg-gradient-to-br from-token-surface-subtle to-token-primary/5 overflow-hidden">
      <div className="container-token-lg mx-auto px-token-4 sm:px-token-6 lg:px-token-8">
        {/* Section Header */}
        <div className="text-center mb-token-16">
          <motion.h2
            className="text-token-4xl md:text-token-5xl font-bold mb-token-6 bg-gradient-to-r from-token-primary to-token-secondary bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            See How Words Become Worlds
          </motion.h2>
          <motion.p
            className="text-token-xl token-text-secondary max-w-token-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Watch your vocabulary transform into an interconnected universe of knowledge
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-token-12 items-center">
          {/* Animation Visualization */}
          <div className="relative">
            <div className="bg-token-surface rounded-token-2xl shadow-token-2xl p-token-8 min-h-[500px] relative overflow-hidden border border-token-border-light">
              {/* Background constellation effect */}
              <div className="absolute inset-0 opacity-10">
                {backgroundDots.map((dot, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-token-1 h-token-1 bg-token-primary rounded-token-full"
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
                <div className="bg-gradient-to-r from-token-primary to-token-secondary text-token-text-inverse px-token-6 py-token-3 rounded-token-full text-token-lg font-semibold shadow-token-lg">
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
                    <div className="bg-token-surface border-token-2 border-token-secondary-light px-token-4 py-token-2 rounded-token-full text-token-sm font-medium shadow-token-md hover:shadow-token-lg transition-token-normal">
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
                      <stop offset="0%" stopColor="var(--color-secondary)" />
                      <stop offset="100%" stopColor="var(--color-secondary-light)" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {/* AI Enhancement cards */}
              <AnimatePresence>
                {showEnhancements && (
                  <>
                    <motion.div
                      className="absolute top-token-16 right-token-8"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="p-token-3 bg-token-accent/5 border-token-accent/20 shadow-token-md">
                        <div className="text-token-xs font-medium token-text-accent-dark">Definition</div>
                        <div className="text-token-xs token-text-accent">A pleasant surprise</div>
                      </Card>
                    </motion.div>

                    <motion.div
                      className="absolute bottom-token-16 left-token-8"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="p-token-3 bg-token-success/5 border-token-success/20 shadow-token-md">
                        <div className="text-token-xs font-medium token-text-success-dark">Example</div>
                        <div className="text-token-xs token-text-success">"What a serendipity!"</div>
                      </Card>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Spark effect for final step */}
              {currentStep === 4 && (
                <motion.div
                  className="absolute top-token-8 right-token-8"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-token-secondary-light to-token-secondary text-token-text-inverse px-token-4 py-token-2 rounded-token-full text-token-sm font-semibold shadow-token-lg flex items-center gap-token-2">
                    <Sparkles className="w-token-4 h-token-4" />
                    Topic Spark
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="space-y-token-6">
            {animationSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`relative p-token-6 rounded-token-xl transition-token-normal duration-500 ${
                  currentStep === index
                    ? "bg-token-surface shadow-token-xl scale-token-105 border-token-2 border-token-primary-light"
                    : "bg-token-surface/50 shadow-token-md hover:shadow-token-lg"
                }`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-token-4">
                  <div className={`p-token-3 rounded-token-full bg-gradient-to-r ${step.color} text-token-text-inverse flex-shrink-0 shadow-token-md`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-token-lg font-semibold mb-token-2 flex items-center gap-token-2 token-text-primary">
                      {step.title}
                      {currentStep === index && (
                        <motion.div
                          className="w-token-2 h-token-2 bg-token-primary rounded-token-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        />
                      )}
                    </h3>
                    <p className="token-text-secondary leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="absolute left-token-8 top-token-16 w-token-0-5 h-token-8 bg-token-border">
                  <motion.div
                    className="w-full bg-gradient-to-b from-token-primary to-token-secondary"
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
        <div className="text-center mt-token-12 space-y-token-4">
          <div className="flex justify-center gap-token-4">
            <Button
              onClick={startAnimation}
              disabled={isPlaying}
              className="btn-token-primary bg-gradient-to-r from-token-primary to-token-secondary hover:from-token-primary-dark hover:to-token-secondary-dark text-token-text-inverse px-token-8 py-token-3 rounded-token-full text-token-lg font-semibold shadow-token-lg hover:shadow-token-xl transition-token-normal"
            >
              {isPlaying ? "Playing..." : "🔄 Restart Animation"}
            </Button>

            <Button
              variant="outline"
              className="px-token-8 py-token-3 rounded-token-full text-token-lg font-semibold border-token-2 border-token-secondary-light hover:bg-token-secondary/5 transition-token-normal bg-transparent"
            >
              🎮 Try Your Maze
            </Button>
          </div>

          <Button variant="ghost" className="token-text-secondary hover:token-text-secondary-dark font-medium">
            🔍 View My Vocabulary World
          </Button>
        </div>
      </div>
    </section>
  );
} 