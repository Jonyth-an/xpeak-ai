"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Layout from '../../components/Layout';
import PlanTiersSection from '../pricing/components/PlanTiersSection';
import BuiltWithXpeakSection from './components/BuiltWithXpeakSection';
import EverythingYouNeedSection from './components/EverythingYouNeedSection';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Puzzle,
  Sparkles,
  Map,
  Users,
  ArrowRight,
  Globe,
  Monitor,
  Star,
  Check,
  Video,
} from "lucide-react"
import TrustedByLearnersSection from './components/TrustedByLearnersSection';

const stats = [
  { number: "1M+", label: "Sparks Ignited", icon: <Sparkles className="w-6 h-6" /> },
  { number: "500K+", label: "Maze Nodes Unlocked", icon: <Puzzle className="w-6 h-6" /> },
  { number: "2M+", label: "AI + Human Tutor Minutes", icon: <Users className="w-6 h-6" /> },
  { number: "130+", label: "Countries", icon: <Globe className="w-6 h-6" /> },
]

const testimonials = [
  {
    quote: "It feels like I have a personal guide who actually remembers me.",
    author: "Mei, Study Abroad Student",
  },
  {
    quote: "The Word Maze got me hooked. But it's the Sparks that keep me growing.",
    author: "Luca, Startup Founder",
  },
  {
    quote: "Finally, a learning platform that connects everything together.",
    author: "Sofia, Language Teacher",
  },
]

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-token-surface-subtle via-token-surface to-token-surface-accent">
        {/* Hero Section */}
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
                Help the World Speak as One
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-text-secondary mb-12 leading-relaxed max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Xpeak AI blends superintelligent systems with human guidance — to help you learn languages faster, deeper,
                and with real-world fluency.
              </motion.p>

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
            </div>
          </div>
        </section>

        {/* Built with the Power of Xpeak AI Section */}
        <BuiltWithXpeakSection />

        {/* Everything You Need to Learn Section */}
        <EverythingYouNeedSection />

        {/* Trusted by Learners in 130+ Countries Section */}
        <TrustedByLearnersSection />

        {/* Plans & Pricing Section */}
        <PlanTiersSection />

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-token-surface-dark to-token-surface-darker">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-8">
                <span className="text-token-primary">
                  You're not just learning a language.
                </span>
                <br />
                <span className="bg-gradient-to-r from-token-primary-light to-token-secondary-light bg-clip-text text-transparent">
                  You're building a world.
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-token-text-inverse/70 mb-12 leading-relaxed">
                With Sagea at your side and Xpeak AI beneath it all — you're ready to grow.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-token-primary to-token-secondary hover:from-token-primary-dark hover:to-token-secondary-dark text-white px-12 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Start Learning with Xpeak AI
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 