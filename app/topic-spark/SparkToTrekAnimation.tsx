"use client";

import { useState, useEffect } from "react";
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
    <div className="w-full max-w-6xl mx-auto p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-200 rounded-2xl overflow-hidden relative my-20 shadow-xl">
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-70 animate-pulse shadow-lg"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(255, 255, 255, 0.8), 0 0 ${8 + Math.random() * 16}px rgba(147, 197, 253, 0.4)`,
            }}
          />
        ))}
      </div>

      {/* Section Title */}
      <motion.div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">From a Spark to a Trek</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Topic Spark uses your progress, interests, and vocabulary Maze to generate a dynamic, evolving learning path —
          one meaningful topic at a time.
        </p>
      </motion.div>

      {/* Animation Container */}
      <div className="relative h-80 mb-6">
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
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
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
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 blur-lg opacity-60 animate-pulse" />

                {/* Node */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl shadow-2xl border-2 border-white/20">
                  {node.icon}
                </div>

                {/* Label - always visible */}
                <motion.div
                  className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap backdrop-blur-sm border border-white/20 text-center"
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
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-black/80" />
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
                  fill="#8B5CF6"
                  className="animate-pulse"
                  style={{ filter: "drop-shadow(0 0 4px #8B5CF6)" }}
                />
                <circle
                  cx="200"
                  cy="20"
                  r="1.5"
                  fill="#06B6D4"
                  className="animate-pulse"
                  style={{ filter: "drop-shadow(0 0 4px #06B6D4)" }}
                />
                <circle
                  cx="300"
                  cy="100"
                  r="2"
                  fill="#10B981"
                  className="animate-pulse"
                  style={{ filter: "drop-shadow(0 0 4px #10B981)" }}
                />
                <circle
                  cx="400"
                  cy="20"
                  r="1.5"
                  fill="#F59E0B"
                  className="animate-pulse"
                  style={{ filter: "drop-shadow(0 0 4px #F59E0B)" }}
                />

                {/* Connecting lines */}
                <line x1="100" y1="100" x2="200" y2="20" stroke="#8B5CF6" strokeWidth="0.5" opacity="0.5" />
                <line x1="200" y1="20" x2="300" y2="100" stroke="#06B6D4" strokeWidth="0.5" opacity="0.5" />
                <line x1="300" y1="100" x2="400" y2="20" stroke="#10B981" strokeWidth="0.5" opacity="0.5" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Supporting text */}
      <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
        <p className="text-blue-600 font-medium mb-6">
          Each Spark expands into a curated Trek — updated in real-time, as Sagea tracks your progress and shapes what
          comes next.
        </p>

        {/* Replay button */}
        <motion.button
          onClick={startAnimation}
          disabled={isPlaying}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? "Playing..." : "Replay Animation"}
        </motion.button>
      </motion.div>
    </div>
  );
} 