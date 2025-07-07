"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/app/components/ui";
import { Puzzle, Link, Sparkles, Map, GraduationCap, Brain } from "lucide-react";

type AnimationStep = {
  id: number;
  title: string;
  caption: string;
  icon: React.ReactNode;
  color: string;
  position: { x: number; y: number };
};

const calculatePosition = (angle: number, radius: number = 137.5): { x: number; y: number } => {
  const centerX = 250;
  const centerY = 180;
  const radians = (angle * Math.PI) / 180;
  return {
    x: centerX + radius * Math.sin(radians),
    y: centerY - radius * Math.cos(radians),
  };
};

const animationSteps: AnimationStep[] = [
  {
    id: 1,
    title: "Word Unlocked",
    caption: 'You learn "serendipity."',
    icon: <Puzzle className="w-6 h-6" />,
    color: "from-[#43cea2] to-[#185a9d]",
    position: calculatePosition(0),
  },
  {
    id: 2,
    title: "Maze Connection",
    caption: 'Sagea links it to "coincidence" and "chance."',
    icon: <Link className="w-6 h-6" />,
    color: "from-[#43cea2] to-[#185a9d]",
    position: calculatePosition(72),
  },
  {
    id: 3,
    title: "Spark Ignition",
    caption: "You're ready for a new Topic Spark.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-[#f7971e] to-[#ffd200]",
    position: calculatePosition(144),
  },
  {
    id: 4,
    title: "Trek Formed",
    caption: "Sagea plots your personalized Trek.",
    icon: <Map className="w-6 h-6" />,
    color: "from-[#00c6ff] to-[#0072ff]",
    position: calculatePosition(216),
  },
  {
    id: 5,
    title: "Tutor Touchpoint",
    caption: "Your tutor jumps in with tailored guidance.",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "from-[#f953c6] to-[#b91d73]",
    position: calculatePosition(288),
  },
];

const iconOffsets = [
  { x: -25, y: -35 },
  { x: -25, y: -18 },
  { x: -38, y: -25 },
  { x: -38, y: -25 },
  { x: -38, y: -22 },
];

export default function SageaAnimation() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepCount, setStepCount] = useState<number>(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsPlaying(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % animationSteps.length;
        setCompletedSteps((completed) => {
          if (!completed.includes(prev)) return [...completed, prev];
          return completed;
        });
        return nextStep;
      });
      setStepCount((count) => count + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full">
      <div className="relative w-full max-w-[450px] h-[600px] rounded-3xl overflow-hidden mx-auto z-45">
        {/* Central Sagea */}
        <div className="absolute" style={{ left: "255px", top: "170px", transform: "translate(-50%, -50%)" }}>
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] rounded-full shadow-lg border-4 border-token-surface flex items-center justify-center relative z-20"
            animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 20px var(--color-primary)", "0 0 40px var(--color-accent)", "0 0 20px var(--color-primary)"] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <Brain className="w-6 h-6 text-white" />
          </motion.div>
        </div>
        {/* Orbital Path */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <circle cx="250" cy="180" r="137.5" fill="none" stroke="url(#orbitGradient)" strokeWidth="3" strokeDasharray="8,4" opacity="0.8" />
        </svg>
        {/* Animation Steps */}
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
              animate={{ opacity: 1, scale: currentStep === index ? 1.2 : completedSteps.includes(index) ? 1 : 0.8 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-full shadow-lg border-4 border-token-surface flex items-center justify-center text-white relative`}>
                <div className="w-6 h-6 flex items-center justify-center">{step.icon}</div>
                {currentStep === index && (
                  <motion.div className="absolute inset-0 rounded-full bg-white/30" animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }} />
                )}
              </div>
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md border border-slate-200/50 whitespace-nowrap">
                  <span className="text-sm font-semibold text-slate-700">{step.title}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {/* Traveling Dot */}
        <motion.div 
          className="absolute w-4 h-4 bg-gradient-to-r from-token-warning to-token-warning-dark rounded-full shadow-lg border-2 border-token-surface transform -translate-x-1/2 -translate-y-1/2 z-30" 
          animate={{ rotate: stepCount * 72 }} 
          transition={{ duration: 1.5, ease: "easeInOut" }} 
          style={{ left: "250px", top: "180px", transformOrigin: "0 0" }}
        >
          <div className="absolute" style={{ left: "0px", top: "-137.5px" }}>
            <div className="w-4 h-4 bg-gradient-to-r from-token-warning to-token-warning-dark rounded-full shadow-lg border-2 border-token-surface relative">
              <motion.div className="absolute inset-0 rounded-full bg-token-warning/50" animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }} />
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Current Step Description */}
      <div className="mt-6 relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.5 }} 
            className="max-w-full"
            style={{ 
              position: 'absolute',
              top: '-200px',    // Move up/down: change this value
              left: '220px',   // Move left/right: change this value
              zIndex: 10
            }}
          >
            <div className="p-4 bg-transparent">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-6 h-6 bg-gradient-to-r ${animationSteps[currentStep].color} rounded-full flex items-center justify-center text-white flex-shrink-0`}>
                  {animationSteps[currentStep].icon}
                </div>
                <h3 className="text-base font-bold text-slate-800">{animationSteps[currentStep].title}</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{animationSteps[currentStep].caption}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 