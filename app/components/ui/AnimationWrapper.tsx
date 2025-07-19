'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimationWrapperProps {
  type?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  duration?: number;
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

const variants = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  'slide-up': { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  'slide-down': { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
  'slide-left': { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
  'slide-right': { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
};

export default function AnimationWrapper({
  type = 'fade',
  duration = 0.5,
  delay = 0,
  children,
  className
}: AnimationWrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants[type]}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
} 