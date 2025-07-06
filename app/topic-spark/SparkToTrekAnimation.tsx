"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Node {
  id: string;
  label: string;
  icon: string;
  position: { x: number; y: number };
  delay: number;
}

const nodes: Node[] = [
  {
    id: "spark",
    label: "Sparked Topic",
    icon: "💡",
    position: { x: 50, y: 50 },
    delay: 0,
  },
  {
    id: "vocab",
    label: "Vocab Focus",
    icon: "📚",
    position: { x: 150, y: 30 },
    delay: 1.2,
  },
  {
    id: "speaking",
    label: "Speaking Challenge",
    icon: "🎤",
    position: { x: 250, y: 60 },
    delay: 2.4,
  },
  {
    id: "cultural",
    label: "Cultural Insight",
    icon: "🌍",
    position: { x: 350, y: 40 },
    delay: 3.6,
  },
  {
    id: "tutor",
    label: "Tutor Session",
    icon: "👨‍🏫",
    position: { x: 450, y: 70 },
    delay: 4.8,
  },
];

export default function SparkToTrekAnimation() {
  const [animationStage, setAnimationStage] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate background stars only once to avoid hydration errors
  const backgroundStars = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      width: 2 + Math.random() * 3,
      height: 2 + Math.random() * 3,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 2 + Math.random() * 2,
      boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(255, 255, 255, 0.8), 0 0 ${8 + Math.random() * 16}px rgba(147, 197, 253, 0.4)`
    }));
  }, []);

  const startAnimation = () => {
    setIsPlaying(true);
    setAnimationStage(-1); // Start with -1 to clear everything

    // Clear everything first, then start animation
    setTimeout(() => setAnimationStage(0), 100);
    setTimeout(() => setAnimationStage(1), 800); // Show spark
    setTimeout(() => setAnimationStage(2), 1500); // Show connections
    setTimeout(() => setAnimationStage(3), 2200); // Show nodes
    setTimeout(() => setAnimationStage(4), 6500); // Show constellation
    setTimeout(() => setIsPlaying(false), 8000); // Reset
  };

  useEffect(() => {
    // Auto-start animation on mount
    startAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-token-6xl mx-auto p-token-8 bg-gradient-to-br from-token-secondary-light via-token-accent-light to-token-primary-light rounded-token-2xl overflow-hidden relative my-token-20 shadow-token-xl">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundStars.map((star, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-token-full opacity-70 animate-pulse shadow-token-lg"
            style={{
              width: `${star.width}px`,
              height: `${star.height}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
              boxShadow: star.boxShadow,
            }}
          />
        ))}
      </div>

      {/* Section Title */}
      <motion.div className="text-center mb-token-6">
        <h2 className="text-token-4xl font-bold token-text-primary mb-token-4">From a Spark to a Trek</h2>
        <p className="text-token-lg token-text-secondary max-w-token-3xl mx-auto leading-relaxed">
          Topic Spark uses your progress, interests, and vocabulary Maze to generate a dynamic, evolving learning path —
          one meaningful topic at a time.
        </p>
      </motion.div>

      {/* Animation Container */}
      <div className="relative" style={{ height: '15rem' }}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="xMidYMid meet">
          {/* Connection paths */}
          <AnimatePresence>
            {animationStage >= 2 && (
              <motion.path
                d="M 50 50 Q 150 20 250 60 Q 350 30 450 70"
                stroke="url(#gradient)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-secondary)" />
              <stop offset="50%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-primary)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Nodes */}
        {nodes.map((node, index) => (
          <AnimatePresence key={node.id}>
            {(animationStage >= 1 && index === 0) || (animationStage >= 3 && index > 0) ? (
              <motion.div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${(node.position.x / 500) * 100}%`,
                  top: `${(node.position.y / 120) * 100}%`,
                }}
                initial={{
                  scale: 0,
                  opacity: 0,
                  rotateZ: -180,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotateZ: 0,
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  delay: index === 0 ? 0 : node.delay - 2.2,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 150,
                }}
                whileHover={{ scale: 1.2 }}
                onHoverStart={() => setHoveredNode(node.id)}
                onHoverEnd={() => setHoveredNode(null)}
              >
                {/* Node glow effect */}
                <div className="absolute inset-0 rounded-token-full bg-gradient-to-r from-token-secondary to-token-accent blur-token-lg opacity-60 animate-pulse" />

                {/* Node */}
                <div className="relative w-token-16 h-token-16 bg-gradient-to-br from-token-secondary to-token-accent rounded-token-full flex items-center justify-center text-token-2xl shadow-token-2xl border-token-2 border-white/20">
                  {node.icon}
                </div>

                {/* Label - always visible */}
                <motion.div
                  className="absolute top-full mt-token-2 left-1/2 transform -translate-x-1/2 bg-token-surface-dark/80 text-token-text-inverse px-token-3 py-token-2 rounded-token-lg text-token-sm whitespace-nowrap backdrop-blur-sm border border-token-surface/20 text-center"
                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                  animate={{
                    opacity: hoveredNode === node.id ? 1 : 0.8,
                    y: 0,
                    scale: hoveredNode === node.id ? 1.1 : 1,
                  }}
                  transition={{
                    delay: index === 0 ? 0.3 : node.delay - 2.2 + 0.3,
                    duration: 0.5,
                  }}
                >
                  {node.label}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-token-4 border-transparent border-b-token-surface-dark/80" />
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        ))}

        {/* Constellation background effect */}
        <AnimatePresence>
          {animationStage >= 4 && (
            <motion.div
              className="absolute inset-0 opacity-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 1 }}
            >
              <svg className="w-full h-full" viewBox="0 0 500 120">
                {/* Additional constellation nodes */}
                <circle
                  cx="100"
                  cy="100"
                  r="2"
                  fill="var(--color-secondary)"
                  className="animate-pulse"
                  style={{ filter: "drop-shadow(0 0 4px var(--color-secondary))" }}
                />
                <circle
                  cx="200"
                  cy="20"
                  r="1.5"
                  fill="var(--color-accent)"
                  className="animate-pulse"
                  style={{ filter: "drop-shadow(0 0 4px var(--color-accent))" }}
                />
                <circle
                  cx="300"
                  cy="100"
                  r="2"
                  fill="var(--color-primary)"
                  className="animate-pulse"
                  style={{ filter: "drop-shadow(0 0 4px var(--color-primary))" }}
                />
                <circle
                  cx="400"
                  cy="20"
                  r="1.5"
                  fill="var(--color-accent)"
                  className="animate-pulse"
                  style={{ filter: "drop-shadow(0 0 4px var(--color-accent))" }}
                />

                {/* Connecting lines */}
                <line x1="100" y1="100" x2="200" y2="20" stroke="var(--color-secondary)" strokeWidth="0.5" opacity="0.5" />
                <line x1="200" y1="20" x2="300" y2="100" stroke="var(--color-accent)" strokeWidth="0.5" opacity="0.5" />
                <line x1="300" y1="100" x2="400" y2="20" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.5" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Supporting text */}
      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
        <p className="text-token-primary font-medium mb-token-6 leading-relaxed">
          Each Spark expands into a curated Trek — updated in real-time, as Sagea tracks your progress and shapes what
          comes next.
        </p>

        {/* Replay button */}
        <motion.button
          onClick={startAnimation}
          disabled={isPlaying}
          className="btn-token-secondary px-token-6 py-token-3 bg-gradient-to-r from-token-secondary to-token-accent text-token-text-inverse font-semibold rounded-token-full hover:from-token-secondary-dark hover:to-token-accent-dark transition-token-normal disabled:opacity-50 disabled:cursor-not-allowed shadow-token-lg hover:shadow-token-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? "Playing..." : "Replay Animation"}
        </motion.button>
      </motion.div>
    </div>
  );
} 