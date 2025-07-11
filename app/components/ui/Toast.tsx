'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose?: (id: string) => void;
  className?: string;
}

const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.3 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const colors = {
  success: 'bg-token-success text-white border-token-success-600',
  error: 'bg-token-error text-white border-token-error-600',
  warning: 'bg-token-warning text-white border-token-warning-600',
  info: 'bg-token-primary text-white border-token-primary-600'
};

export default function Toast({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  className
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(id);
    }, 200);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={cn(
            'relative flex items-start gap-3 p-4 rounded-token-lg shadow-token-lg border min-w-[300px] max-w-[400px]',
            colors[type],
            className
          )}
        >
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            {title && (
              <div className="font-semibold text-sm mb-1">{title}</div>
            )}
            <div className="text-sm opacity-90">{message}</div>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 