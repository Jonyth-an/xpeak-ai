"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import {
  Brain,
  ArrowRight,
} from "lucide-react"

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  showButtons?: boolean;
}

export default function HeroSection({ 
  title = "Help the World Speak as One",
  subtitle = "Xpeak AI blends superintelligent systems with human guidance — to help you learn languages faster, deeper, and with real-world fluency.",
  showButtons = true 
}: HeroSectionProps) {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-token-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          <motion.h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-token-primary via-token-secondary to-token-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-text-secondary mb-12 leading-relaxed max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {subtitle}
          </motion.p>

          {showButtons && (
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-token-primary to-token-secondary hover:from-token-primary-dark hover:to-token-secondary-dark text-white px-10 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Start Learning Free
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/meet-sagea">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-token-secondary text-token-secondary hover:bg-token-secondary/10 px-10 py-4 rounded-full text-xl font-semibold transition-all duration-300 bg-transparent"
                >
                  Meet Sagea
                  <Brain className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
} 