"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Layout from '../../components/Layout';
import PlanTiersSection from '../pricing/components/PlanTiersSection';
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

const features = [
  {
    icon: <Puzzle className="w-8 h-8" />,
    title: "Word Maze",
    description: "Learn words by unlocking a maze of meaning.",
    detail: "Your vocabulary journey becomes a game of discovery — powered by AI and context-aware reviews.",
    color: "from-blue-500 to-indigo-600",
    cta: "Explore Word Maze",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Topic Sparks",
    description: "New ideas, auto-generated, just for you.",
    detail: "Sparks are personalized prompts that turn into full lessons, podcasts, or tutor sessions.",
    color: "from-purple-500 to-violet-600",
    cta: "Ignite a Topic Spark",
  },
  {
    icon: <Map className="w-8 h-8" />,
    title: "Learning Treks",
    description: "Trek through your progress.",
    detail: "Your sparks form a constellation of interconnected topics — a roadmap that adapts as you learn.",
    color: "from-emerald-500 to-teal-600",
    cta: "View Trek Map",
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "Sagea",
    description: "The partner that ties it all together.",
    detail:
      "Sagea tracks your learning, nudges your progress, and personalizes your experience — with heart and intelligence.",
    color: "from-rose-500 to-pink-600",
    cta: "Meet Sagea",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Human & AI Tutors",
    description: "Guidance, support, and context.",
    detail: "Match with tutors based on your goals, while Sagea ensures the learning stays continuous.",
    color: "from-amber-500 to-orange-600",
    cta: "Find Your Tutor",
  },
]

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

const xpeakFeatures = [
  { icon: <Brain className="w-6 h-6" />, title: "Sagea", subtitle: "Your lifelong learning partner" },
  { icon: <Puzzle className="w-6 h-6" />, title: "Word Maze", subtitle: "Vocabulary built into memory" },
  { icon: <Sparkles className="w-6 h-6" />, title: "Topic Sparks", subtitle: "AI-generated ideas to explore" },
  { icon: <Map className="w-6 h-6" />, title: "Learning Treks", subtitle: "Structured paths from sparks" },
  { icon: <Users className="w-6 h-6" />, title: "Tutors & Crew", subtitle: "Human and AI support in sync" },
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
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
                className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Help the World Speak as One
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-slate-700 mb-12 leading-relaxed max-w-4xl mx-auto"
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
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    Start Learning Free
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link href="/meet-sagea">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-10 py-4 rounded-full text-xl font-semibold transition-all duration-300 bg-transparent"
                  >
                    Meet Sagea
                    <Brain className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* What is Xpeak AI Section */}
        <section className="py-20 bg-white/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                  Built with the Power of Xpeak AI
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed max-w-4xl mx-auto mb-12">
                  At the core of Xpeak is an adaptive learning engine that evolves with you. It remembers what you've
                  learned, suggests what's next, and connects you with the right content, tools, and people — at the right
                  time.
                </p>
                <p className="text-lg text-slate-600 mb-8">Xpeak AI powers every step of your journey:</p>
              </motion.div>

              <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
                {xpeakFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex-1 min-w-[200px] max-w-[220px]"
                  >
                    <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-2 border-slate-200 hover:border-blue-200 h-full">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{feature.title}</h3>
                      <p className="text-slate-600 text-sm">{feature.subtitle}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Overview Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Everything You Need to Learn
            </motion.h2>

            <div className="max-w-7xl mx-auto">
              {/* Featured card - Sagea */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <Card className="p-8 transition-all duration-300 hover:shadow-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-center gap-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                      <Brain className="w-10 h-10" />
                    </div>
                    <div className="text-center flex-1">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <h3 className="text-3xl font-bold text-slate-800">Sagea</h3>
                      </div>
                      <p className="text-xl font-medium text-slate-700 mb-3">The partner that ties it all together.</p>
                      <p className="text-slate-600 mb-6 leading-relaxed max-w-2xl mx-auto">
                        Sagea tracks your learning, nudges your progress, and personalizes your experience — with heart
                        and intelligence.
                      </p>
                      <Link href="/meet-sagea">
                        <Button
                          variant="outline"
                          className="border-2 border-purple-400 text-purple-700 hover:bg-purple-50 group bg-transparent"
                        >
                          Meet Sagea
                          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Other 4 cards in 2x2 grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                {features.slice(0, 4).map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                    onHoverStart={() => setHoveredFeature(index)}
                    onHoverEnd={() => setHoveredFeature(null)}
                  >
                    <Card
                      className={`p-8 h-full transition-all duration-300 hover:shadow-xl border-2 ${
                        hoveredFeature === index ? "border-blue-200 shadow-lg scale-105" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}
                        >
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Check className="w-5 h-5 text-green-500" />
                            <h3 className="text-2xl font-bold text-slate-800">{feature.title}</h3>
                          </div>
                          <p className="text-lg font-medium text-slate-700 mb-3">{feature.description}</p>
                          <p className="text-slate-600 mb-6 leading-relaxed">{feature.detail}</p>
                          <Link href={feature.title === "Word Maze" ? "/word-maze" : feature.title === "Topic Sparks" ? "/topic-spark" : feature.title === "Learning Treks" ? "/topic-spark" : "/meet-sagea"}>
                            <Button
                              variant="outline"
                              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 group bg-transparent"
                            >
                              {feature.cta}
                              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Global Learner Proof */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto text-center">
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-white mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                Trusted by Learners in 130+ Countries
              </motion.h2>

              <div className="grid md:grid-cols-4 gap-8 mb-16">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {stat.icon}
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-blue-100 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <motion.p
                className="text-xl text-blue-100 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Real-world learners, real-world results
              </motion.p>

              {/* Testimonial Carousel */}
              <div className="max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                  >
                    <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-blue-100 font-medium ml-4">— {testimonials[currentTestimonial].author}</span>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Testimonial indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentTestimonial === index ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plans & Pricing Section */}
        <PlanTiersSection />

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
                You're not just learning a language.
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  You're building a world.
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed">
                With Sagea at your side and Xpeak AI beneath it all — you're ready to grow.
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
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