"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Layout from '../../components/Layout';
import {
  Rocket,
  Code,
  Palette,
  Users,
  Heart,
  Brain,
  Zap,
  Target,
  Globe,
  ArrowRight,
  Mail,
  ExternalLink,
  Clock,
  MapPin,
  Wrench,
  MessageCircle,
  Star,
  TrendingUp,
  Eye,
  Lightbulb,
  Award,
  DollarSign,
  AlertTriangle,
} from "lucide-react"

const roles = [
  {
    icon: <Code className="w-8 h-8" />,
    title: "Fullstack Engineer",
    emoji: "🛠",
    requirements: [
      "You've built and shipped real products — ideally solo or at a fast-moving startup",
      "You can work across the stack, learn new frameworks quickly, and don't mind touching ops when needed",
      "Bonus if you're curious about AI tools and already playing with things like LangChain, GPT-4, Whisper, etc.",
    ],
    color: "from-token-primary to-token-accent",
  },
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Product Designer",
    emoji: "🎨",
    requirements: [
      "You love turning rough ideas into clean UX — and maybe even prototype it yourself",
      "Familiar with Figma? Great. Willing to test AI coding/design tools? Even better",
      "Bonus if you've built products with gamification or learning flows",
    ],
    color: "from-token-accent to-token-secondary",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Technical Co-Founder",
    emoji: "🤝",
    requirements: [
      "You're excited to build a category-defining product from zero",
      "You love languages and have a learner's mindset",
      "You want to shape culture, not just code",
      "You see this as your own startup, not just a gig",
    ],
    color: "from-token-secondary to-token-primary-light",
    isDream: true,
  },
]

const careAbouts = [
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Language learners preferred",
    description:
      "Ideally, you've studied a foreign language — especially English, Chinese, or Spanish. Why? Empathy. We're building for learners, and it helps if you've been one.",
    color: "from-token-primary to-token-accent",
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: "AI-native mindset",
    description:
      "You should feel super comfortable using (and misusing!) AI tools — whether for coding, design, or research",
    color: "from-token-accent to-token-secondary",
  },
  {
    icon: <Lightbulb className="w-8 h-8" />,
    title: "Curious and scrappy",
    description:
      "Experience matters, but learning matters more. We care more about how fast you adapt than what your résumé says",
    color: "from-token-accent to-token-primary",
  },
  {
    icon: <Wrench className="w-8 h-8" />,
    title: "Builders > Spectators",
    description: "You want to build. Not just talk, not just suggest. Build.",
    color: "from-token-secondary to-token-primary-light",
  },
]

const benefits = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Creative Freedom",
    description: "You won't just execute specs. You'll shape the vision, design systems, and experiment wildly",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "A Voice in the Product",
    description: "Every pixel, line of code, or interaction matters. You'll help shape what this becomes",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Visibility & Recognition",
    description: "You'll be listed publicly as part of the early founding crew. Think: About page, changelogs, credits",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Extreme Learning Curve",
    description: "Startups are pressure cookers for growth. You'll stretch your skills like never before",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "1-on-1 Collaboration with Me",
    description:
      "I built Cambly APAC from scratch to $40M+ revenue — across product, design, marketing, ops, legal, and more. Now I'm doing it all again, from zero",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Build in Public Exposure",
    description:
      "If you want, your contributions will be shared publicly as part of our transparent roadmap and changelog",
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Equity Potential / Early Contributor Perks",
    description:
      "For core contributors, there will be equity discussions when the time's right. When we raise? We talk comp.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Founding Team Status",
    description: "Whether co-founder, full-time, or intern — if you help build this from Day 1, it'll show forever",
  },
]

const logistics = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Time Commitment",
    detail: "Ideally full-time. Part-time possible only if deeply committed.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Interns Welcome",
    detail: "Especially for summer/winter full-time availability",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Location",
    detail: "Bay Area preferred. Remote is possible if you're async-pro and move fast.",
  },
  {
    icon: <Wrench className="w-6 h-6" />,
    title: "Tools & Stack",
    detail: "React, Supabase, Cursor, GPT-4, LangChain, Figma, Notion, and a wild bag of AI magic.",
  },
]

export default function CareerPage() {
  const [hoveredRole, setHoveredRole] = useState<number | null>(null)
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null)

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
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
                <Rocket className="w-12 h-12 text-token-primary" />
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-token-primary via-token-accent to-token-secondary bg-clip-text text-transparent">
                  Join the Xpeak AI Adventure
                </h1>
              </motion.div>

              <motion.p
                className="text-xl md:text-2xl text-text-secondary mb-8 leading-relaxed max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome to the scrappy early days of something we believe will be huge. If you've ever wanted to help
                build a product from the ground up — now's the time.
              </motion.p>

              <motion.p
                className="text-lg md:text-xl text-text-tertiary mb-8 leading-relaxed max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                We're on a mission to help the world speak as one. With AI-powered tutors, personalized learning journeys,
                and gamified experiences that actually make studying fun, Xpeak is here to shake up language learning.
              </motion.p>

              <motion.p
                className="text-2xl md:text-3xl font-bold text-text mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                But to make this happen, I can't do it alone.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Who We're Looking For */}
        <section className="py-20 bg-token-surface/50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Brain className="w-12 h-12 text-token-accent" />
                  <h2 className="text-4xl md:text-5xl font-bold text-text">Who We're Looking For</h2>
                </div>
                <p className="text-xl text-text-tertiary">
                  Whether you're a curious intern, a multi-hat wearing engineer, or a design wizard who vibes with our
                  mission — read on.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                {roles.map((role, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    onHoverStart={() => setHoveredRole(index)}
                    onHoverEnd={() => setHoveredRole(null)}
                  >
                    <Card
                      className={`p-8 h-full transition-all duration-300 hover:shadow-xl border-2 relative ${
                        hoveredRole === index ? "border-token-accent/30 shadow-lg scale-105" : "border-token-border"
                      } ${role.isDream ? "ring-2 ring-token-secondary" : ""}`}
                    >
                      {role.isDream && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-token-secondary text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            Dream Role
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-6">
                        <div className="text-4xl mb-4">{role.emoji}</div>
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}
                        >
                          {role.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-text">{role.title}</h3>
                      </div>

                      <ul className="space-y-4">
                        {role.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start gap-3 text-text-tertiary">
                            <div className="w-2 h-2 bg-token-accent rounded-full mt-2 flex-shrink-0"></div>
                            <span className="leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What We Care About */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Heart className="w-12 h-12 text-token-primary" />
                  <h2 className="text-4xl md:text-5xl font-bold text-text">What We Care About</h2>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {careAbouts.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="p-8 h-full hover:shadow-lg transition-all duration-300 border-2 border-token-border hover:border-token-accent/30">
                      <div className="flex items-start gap-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-text mb-3">{item.title}</h3>
                          <p className="text-text-tertiary leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* What You'll Get */}
        <section className="py-20 bg-gradient-to-br from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Zap className="w-12 h-12 text-token-primary" />
                  <h2 className="text-4xl md:text-5xl font-bold text-text">What You'll Get</h2>
                </div>
                <p className="text-xl text-text-tertiary mb-8">
                  We're early. Really early. But if you're looking to actually build something meaningful, here's what
                  you'll get:
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onHoverStart={() => setHoveredBenefit(index)}
                    onHoverEnd={() => setHoveredBenefit(null)}
                  >
                    <Card
                      className={`p-6 bg-token-surface/80 backdrop-blur-sm border-2 border-token-border hover:border-token-accent/30 transition-all duration-300 shadow-sm hover:shadow-lg ${
                        hoveredBenefit === index ? "scale-105 border-token-accent/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-token-primary to-token-accent rounded-lg flex items-center justify-center text-white flex-shrink-0">
                          {benefit.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold mb-2 text-text">{benefit.title}</h3>
                          <p className="text-text-tertiary text-sm leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Pay - Honest Section */}
        <section className="py-20 bg-token-surface/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <DollarSign className="w-12 h-12 text-token-success" />
                  <h2 className="text-4xl md:text-5xl font-bold text-text">About Pay</h2>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="p-8 bg-gradient-to-br from-token-accent/10 to-token-primary/10 border-2 border-token-accent/20">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-text mb-4">
                      Right now, this is not a salaried role — YET.
                    </h3>
                    <p className="text-lg text-text-tertiary">Here's the honest breakdown:</p>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div className="bg-token-surface/60 rounded-xl p-6">
                      <h4 className="font-bold text-text mb-2">Current Reality:</h4>
                      <ul className="space-y-2 text-text-tertiary">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-token-error rounded-full"></div>
                          I'm bootstrapping this. No VC money yet. No salary pool.
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-token-warning rounded-full"></div>
                          If you're a student or intern, a modest stipend may be possible depending on your commitment.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-token-surface/60 rounded-xl p-6">
                      <h4 className="font-bold text-text mb-2">What I can promise is:</h4>
                      <ul className="space-y-2 text-text-tertiary">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-token-accent rounded-full"></div>
                          Full transparency
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-token-primary rounded-full"></div>
                          Equity potential
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-token-success rounded-full"></div>
                          Direct impact on the product, the team, and the brand
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-token-secondary rounded-full"></div>
                          Learning by doing — at a crazy pace
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-lg text-text-secondary mb-4">
                      If this works, it works big. And we'll make sure it's worth your while.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-token-accent text-white px-6 py-3 rounded-full">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-bold">
                        TL;DR: No salary today. But we're building something bigger than paychecks.
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Logistics & Expectations */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Target className="w-12 h-12 text-token-primary" />
                  <h2 className="text-4xl md:text-5xl font-bold text-text">Logistics & Expectations</h2>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {logistics.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-all duration-300 border-2 border-token-border hover:border-token-accent/30">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-token-primary to-token-accent rounded-lg flex items-center justify-center text-white flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-text mb-2">{item.title}</h3>
                          <p className="text-text-tertiary">{item.detail}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-gradient-to-r from-token-primary-dark to-token-accent-dark">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <MessageCircle className="w-12 h-12 text-token-accent" />
                <h2 className="text-4xl md:text-5xl font-bold text-white">Sound Like You?</h2>
              </div>

              <p className="text-xl text-white mb-8 leading-relaxed">
                Shoot me a message. Tell me what you've built, what you want to build, and why this excites you.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-token-primary to-token-accent hover:from-token-primary-dark hover:to-token-accent-dark text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Mail className="mr-3 w-6 h-6" />
                  monster@xpeak.ai
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>

                <a
                  href="https://www.linkedin.com/in/monstershou/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 bg-transparent border-2 border-white text-white hover:bg-white/10 hover:text-token-primary group"
                >
                  LinkedIn
                  <ExternalLink className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="https://x.com/Monstershou"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 bg-transparent border-2 border-white text-white hover:bg-white/10 hover:text-token-primary group"
                >
                  X
                  <ExternalLink className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <p className="text-2xl md:text-3xl font-bold text-white">
                Let's build something people actually love to use.
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 