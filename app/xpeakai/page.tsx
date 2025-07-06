"use client";

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  MessageCircle,
  Brain,
  Users,
  Trophy,
  Code,
  Coffee,
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  BookOpen,
  TrendingUp,
  Calendar,
  ExternalLink,
} from "lucide-react"

const offerings = [
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Co-create lesson topics",
    subtitle: "that you care about",
    description: "Build lessons around your interests, goals, and real-world needs",
    color: "from-token-primary to-token-accent",
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Practice with AI tutors",
    subtitle: "that feel surprisingly human",
    description: "Conversational AI that adapts to your style and keeps you engaged",
    color: "from-token-accent to-token-secondary",
  },
  {
    icon: <Trophy className="w-8 h-8" />,
    title: "Unlock words, track progress",
    subtitle: "and maybe even flex your badge collection",
    description: "Gamified learning that makes vocabulary stick and progress visible",
    color: "from-token-secondary to-token-primary-light",
  },
]

const achievements = [
  { number: "9+", label: "Years at Cambly", icon: <Calendar className="w-6 h-6" /> },
  { number: "40+", label: "Team Members Hired", icon: <Users className="w-6 h-6" /> },
  { number: "$40M+", label: "APAC ARR Scaled", icon: <TrendingUp className="w-6 h-6" /> },
  { number: "0", label: "Compliance Issues", icon: <Target className="w-6 h-6" /> },
]

const responsibilities = ["Product", "Design", "Engineering", "Marketing", "Operations", "Support", "Finance", "Legal"]

const communityActions = [
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Shape the Roadmap",
    description: "Suggest features, upvote others, or just poke around and see what's next. Yes, I actually read it.",
    cta: "Join the Discussion",
    color: "from-token-accent to-token-secondary",
  },
  {
    icon: <Code className="w-8 h-8" />,
    title: "See What I Broke Today",
    description:
      "Read the Daily Changelog for raw, unfiltered build-in-public energy. No fluff. Just commits, crashes, and caffeine.",
    cta: "View Changelog",
    color: "from-token-primary to-token-accent",
  },
]

export default function AboutPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const router = useRouter()

  // For now, we'll assume user is not logged in
  // In a real app, you'd check authentication status here
  const isLoggedIn = false // This should be replaced with actual auth check

  const handleJoinJourney = () => {
    if (isLoggedIn) {
      router.push('/pricing')
    } else {
      router.push('/signup')
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-token-accent/20 rounded-full"
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
              <motion.div
                className="flex items-center justify-center gap-4 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Heart className="w-12 h-12 text-token-primary" />
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-token-primary via-token-accent to-token-secondary bg-clip-text text-transparent">
                  About Xpeak AI
                </h1>
              </motion.div>

              <motion.h2
                className="text-3xl md:text-4xl font-bold text-text mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Mission: Help the World Speak as One.
              </motion.h2>

              <motion.p
                className="text-xl md:text-2xl text-text-secondary mb-8 leading-relaxed max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                We believe language is power — and everyone deserves access to it.
              </motion.p>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-20 bg-token-surface/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-4xl mx-auto">
                  Xpeak AI is your personal language wingman — powered by AI, fueled by curiosity, and designed to help
                  you actually speak with confidence.
                  <br />
                  <br />
                  Whether you're prepping for study abroad, eyeing that global dream job, or just want to say more than
                  "hello" on your next trip, we've got your back.
                </p>
              </motion.div>
              <div className="grid lg:grid-cols-3 gap-8">
                {offerings.map((offering, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    onHoverStart={() => setHoveredCard(index)}
                    onHoverEnd={() => setHoveredCard(null)}
                  >
                    <Card
                      className={`p-8 h-full text-center transition-all duration-300 hover:shadow-xl border-2 ${
                        hoveredCard === index ? "border-token-accent/30 shadow-lg scale-105" : "border-token-border"
                      }`}
                    >
                      <div
                        className={`w-20 h-20 bg-gradient-to-r ${offering.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white`}
                      >
                        {offering.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-text mb-2">{offering.title}</h3>
                      <p className="text-lg font-medium text-token-primary mb-4">{offering.subtitle}</p>
                      <p className="text-text-secondary leading-relaxed">{offering.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="text-center mt-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <p className="text-2xl md:text-3xl font-bold text-text mb-4">We're not just another language app.</p>
                <p className="text-xl text-text-secondary mb-8">
                  We're building something more personal, more flexible, and honestly… way more fun.
                </p>
                <p className="text-lg text-token-primary font-semibold">And we're just getting started.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founder Story */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Coffee className="w-12 h-12 text-token-accent" />
                  <h2 className="text-4xl md:text-5xl font-bold text-text">The Solo Journey</h2>
                </div>
                <p className="text-xl text-text-secondary leading-relaxed">
                  Hey, I'm the founder — and yep, it's just me (for now).
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="p-8 bg-gradient-to-br from-token-accent/10 to-token-primary/10 border-2 border-token-accent/20">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-token-accent to-token-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <Code className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-text mb-4">Current Status: Solo Dev Mode</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 text-center mb-8">
                    <div className="p-4 bg-token-surface/60 rounded-xl">
                      <Users className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                      <p className="font-semibold text-text">No team</p>
                    </div>
                    <div className="p-4 bg-token-surface/60 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                      <p className="font-semibold text-text">No VC backing</p>
                    </div>
                    <div className="p-4 bg-token-surface/60 rounded-xl">
                      <Brain className="w-8 h-8 text-text-secondary mx-auto mb-2" />
                      <p className="font-semibold text-text">No mental support</p>
                      <p className="text-sm text-text-secondary">(well… depends on the coffee)</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg text-text-secondary mb-4">
                      Just one guy, one laptop, and a not-so-chill obsession with building the best AI-powered language
                      experience possible.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-token-accent text-white px-4 py-2 rounded-full">
                      <Code className="w-4 h-4" />
                      <span className="font-mono text-sm">#SoloDevLife 🛠️</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Background Experience */}
        <section className="py-20 bg-gradient-to-r from-token-surface-subtle to-token-surface-accent-light">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto text-text">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-8">My Background</h2>
                <p className="text-xl text-text-secondary leading-relaxed max-w-4xl mx-auto">
                  Before Xpeak AI, I spent 9+ years at Cambly, a YC-backed startup where I was the first and only hire for
                  the Greater China team. I interviewed, hired, and managed every single person on my team — growing it to
                  40+ full-time legends (and over 70 including part-time support).
                </p>
              </motion.div>

              <div className="grid md:grid-cols-4 gap-8 mb-16">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="w-16 h-16 bg-token-surface/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      {achievement.icon}
                    </div>
                    <div className="text-4xl md:text-5xl font-bold mb-2">{achievement.number}</div>
                    <div className="text-text-secondary font-medium">{achievement.label}</div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Card className="p-8 bg-token-surface border border-token-accent shadow-lg">
                  <h3 className="text-2xl font-bold mb-6 text-center">I didn't just lead the org — I built it.</h3>
                  <p className="text-lg text-text-secondary mb-6 text-center">That included:</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {responsibilities.map((responsibility, index) => (
                      <motion.div
                        key={responsibility}
                        className="bg-token-surface-subtle rounded-lg p-3 text-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                      >
                        <span className="font-semibold text-text">{responsibility}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-token-accent/10 rounded-xl p-6 border border-token-accent/20">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2 text-text">
                      <Zap className="w-6 h-6 text-token-accent" />
                      Legal (aka my unlicensed superpower)
                    </h4>
                    <p className="text-text-secondary mb-4">
                      Especially in China, one of the most highly regulated markets in the world, I learned how to
                      navigate foreign business operations for 9+ years — without a single compliance mishap.
                    </p>
                    <p className="text-sm text-text-secondary/70 italic">
                      That's not luck. That's late nights with legal docs, endless policy changes, and a 6th sense for
                      regulation landmines.
                    </p>
                  </div>

                  <div className="text-center mt-8">
                    <p className="text-xl font-bold mb-2 text-text">We scaled APAC from 0 to $40M+ ARR</p>
                    <p className="text-text-secondary">— and I loved every minute of it.</p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Current Journey */}
        <section className="py-20 bg-token-surface/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-text mb-8">Now? I'm back to zero.</h2>
                <p className="text-xl text-text-secondary leading-relaxed">
                  Solo founder. No product at the start.
                  <br />
                  Just me, learning to code in 2025, and shipping every day with my very chill (and non-unionized)
                  co-founder: Cursor.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="p-8 bg-gradient-to-br from-token-primary/10 to-token-accent/10 border-2 border-token-primary/20 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-token-primary to-token-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-4">Fair Warning</h3>
                  <p className="text-lg text-text-secondary mb-4">
                    If something breaks, don't panic. It just means I'm debugging at 2am with snacks and tears.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-token-accent text-white px-4 py-2 rounded-full">
                    <Code className="w-4 h-4" />
                    <span className="font-mono text-sm">#SoloDevLife 🛠️</span>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Community Engagement */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-text mb-8">Want to be part of this wild ride?</h2>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-8 mb-16">
                {communityActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 border-2 border-token-border hover:border-token-accent/30">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center mb-6 text-white`}
                      >
                        {action.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-text mb-4">{action.title}</h3>
                      <p className="text-text-secondary mb-6 leading-relaxed">{action.description}</p>
                      <a 
                        href={action.cta === "Join the Discussion" ? "https://xpeakai.featurebase.app/" : "https://xpeakai.featurebase.app/changelog"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button className="w-full bg-gradient-to-r from-token-accent to-token-primary hover:from-token-accent-dark hover:to-token-primary-dark text-white group">
                          {action.cta}
                          <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </a>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="p-8 bg-token-primary text-white border border-token-primary shadow-lg">
                  <h3 className="text-3xl md:text-4xl font-bold mb-6">If you're reading this — you're early.</h3>
                  <p className="text-xl text-white/80 mb-4">You're part of the story.</p>
                  <p className="text-lg text-white/70 mb-8">
                    And one day, you'll get to say: "Yeah… I was there before it got cool."
                  </p>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-token-primary hover:bg-token-surface-subtle px-8 py-3 rounded-full text-lg font-semibold group"
                    onClick={handleJoinJourney}
                  >
                    Join the Journey
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 