"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Spark {
  id: string;
  position: { x: number; y: number };
  delay: number;
  topic: string;
  color: string;
}

// Set each spark's delay to index * 1 (1 second per spark)
const baseSparks: Omit<Spark, 'delay'>[] = [
  { id: "coffee", position: { x: 15, y: 25 }, topic: "Coffee Culture", color: "var(--color-secondary)" },
  { id: "travel", position: { x: 35, y: 15 }, topic: "Travel Planning", color: "var(--color-accent)" },
  { id: "business", position: { x: 25, y: 45 }, topic: "Business Meetings", color: "var(--color-primary)" },
  { id: "cooking", position: { x: 55, y: 20 }, topic: "Cooking Basics", color: "var(--color-accent)" },
  { id: "sports", position: { x: 45, y: 50 }, topic: "Sports Discussion", color: "var(--color-primary)" },
  { id: "tech", position: { x: 75, y: 30 }, topic: "Technology", color: "var(--color-secondary)" },
  { id: "culture", position: { x: 65, y: 60 }, topic: "Cultural Events", color: "var(--color-accent)" },
  { id: "health", position: { x: 85, y: 45 }, topic: "Health & Wellness", color: "var(--color-primary)" },
  { id: "music", position: { x: 20, y: 65 }, topic: "Music & Arts", color: "var(--color-accent)" },
  { id: "shopping", position: { x: 40, y: 35 }, topic: "Shopping", color: "var(--color-primary)" },
  { id: "weather", position: { x: 60, y: 10 }, topic: "Weather Talk", color: "var(--color-secondary)" },
  { id: "family", position: { x: 80, y: 65 }, topic: "Family Life", color: "var(--color-accent)" },
];
const sparks: Spark[] = baseSparks.map((spark, i) => ({ ...spark, delay: i }));

const connections = [
  { from: "coffee", to: "travel" },
  { from: "travel", to: "business" },
  { from: "business", to: "cooking" },
  { from: "cooking", to: "sports" },
  { from: "sports", to: "tech" },
  { from: "tech", to: "culture" },
  { from: "culture", to: "health" },
  { from: "coffee", to: "cooking" },
  { from: "business", to: "tech" },
  { from: "sports", to: "culture" },
  { from: "music", to: "shopping" },
  { from: "shopping", to: "weather" },
  { from: "weather", to: "family" },
  { from: "health", to: "music" },
  { from: "culture", to: "family" },
];

export default function ConstellationSparks() {
  const [animationStage, setAnimationStage] = useState(0);
  const [hoveredSpark, setHoveredSpark] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSparkIndex, setActiveSparkIndex] = useState<number>(-1);

  // Sequentially activate sparks and show only one label at a time
  useEffect(() => {
    if (!isPlaying) return;
    let timeouts: NodeJS.Timeout[] = [];
    sparks.forEach((spark, i) => {
      timeouts.push(
        setTimeout(() => {
          setActiveSparkIndex(i);
        }, i * 1500)
      );
    });
    // Optionally hide label after last spark
    timeouts.push(
      setTimeout(() => {
        setActiveSparkIndex(-1);
      }, (sparks.length) * 1500 + 100)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [isPlaying]);

  const startAnimation = () => {
    setIsPlaying(true);
    setAnimationStage(-1);
    setActiveSparkIndex(-1);
    setTimeout(() => setAnimationStage(0), 100);
    setTimeout(() => setAnimationStage(1), 500); // Show sparks
    setTimeout(() => setAnimationStage(2), 10000); // Show connections
    setTimeout(() => setAnimationStage(3), 11000); // Full constellation
    setTimeout(() => setIsPlaying(false), 13000);
  };

  useEffect(() => {
    startAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSpark = (id: string) => sparks.find((s) => s.id === id);

  // Generate background stars only once on the client to avoid hydration errors
  const backgroundStars = useMemo(() => {
    return Array.from({ length: 30 }).map(() => ({
      width: 1 + Math.random() * 2,
      height: 1 + Math.random() * 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 3 + Math.random() * 2,
      boxShadow: `0 0 ${2 + Math.random() * 4}px rgba(255, 255, 255, 0.6)`
    }));
  }, []);

  return (
    <section
      className="w-full flex items-center justify-center py-8"
      style={{ height: '12rem' }}
    >
      <div
        className="flex items-center justify-center w-full h-full"
      >
        {/* Background stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {backgroundStars.map((star, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-token-full opacity-40 animate-pulse"
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

        {/* Constellation Container */}
        <div className="relative w-full h-[40rem] max-w-[90vw] mb-token-8 flex justify-center items-center">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet">
            {/* Connection lines */}
            <AnimatePresence>
              {animationStage >= 2 &&
                connections.map((connection, index) => {
                  const fromSpark = getSpark(connection.from);
                  const toSpark = getSpark(connection.to);
                  if (!fromSpark || !toSpark) return null;

                  return (
                    <motion.line
                      key={`${connection.from}-${connection.to}`}
                      x1={fromSpark.position.x}
                      y1={fromSpark.position.y}
                      x2={toSpark.position.x}
                      y2={toSpark.position.y}
                      stroke="url(#constellationGradient)"
                      strokeWidth="0.3"
                      opacity="0.6"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.8,
                        ease: "easeInOut",
                      }}
                    />
                  );
                })}
            </AnimatePresence>

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-secondary)" />
                <stop offset="50%" stopColor="var(--color-accent)" />
                <stop offset="100%" stopColor="var(--color-primary)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Sparks */}
          {sparks.map((spark, index) => (
            <AnimatePresence key={spark.id}>
              {animationStage >= 1 && (
                <motion.div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${spark.position.x}%`,
                    top: `${spark.position.y}%`,
                  }}
                  initial={{
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{
                    delay: spark.delay,
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.3 }}
                  onHoverStart={() => setHoveredSpark(spark.id)}
                  onHoverEnd={() => setHoveredSpark(null)}
                >
                  {/* Spark glow */}
                  <div
                    className="absolute inset-0 rounded-token-full blur-token-sm opacity-70 animate-pulse"
                    style={{ backgroundColor: spark.color }}
                  />

                  {/* Spark core */}
                  <div
                    className="relative w-token-3 h-token-3 rounded-token-full shadow-token-lg border border-white/30"
                    style={{ backgroundColor: spark.color }}
                  />

                  {/* Label: Only show for the currently active spark */}
                  <AnimatePresence>
                    {activeSparkIndex === index && (
                      <motion.div
                        className="absolute top-full mt-token-2 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-token-2 py-token-1 rounded-token-xs whitespace-nowrap backdrop-blur-sm border border-white/20"
                        initial={{ opacity: 0, y: -5, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        {spark.topic}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-token-2 border-transparent border-b-token-surface-dark/80" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          ))}

          {/* Constellation completion effect */}
          <AnimatePresence>
            {animationStage >= 3 && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-token-secondary-light/20 via-token-accent-light/20 to-token-primary-light/20 rounded-token-lg animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
} 