"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/app/components/ui/Button"
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
  Linkedin,
} from "lucide-react"

// Custom X (Twitter) logo component
const XLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const roles = [
  {
    icon: <Code className="w-8 h-8" />,
    title: "Fullstack Engineer",
    emoji: "🛠",
    requirements: [
      "You&apos;ve built and shipped real products — ideally solo or at a fast-moving startup",
      "You can work across the stack, learn new frameworks quickly, and don&apos;t mind touching ops when needed",
      "Bonus if you&apos;re curious about AI tools and already playing with things like LangChain, GPT-4, Whisper, etc.",
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
      "Bonus if you&apos;ve built products with gamification or learning flows",
    ],
    color: "from-token-accent to-token-secondary",
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Technical Co-Founder",
    emoji: "🤝",
    requirements: [
      "You&apos;re excited to build a category-defining product from zero",
      "You love languages and have a learner&apos;s mindset",
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
      "Ideally, you&apos;ve studied a foreign language — especially English, Chinese, or Spanish. Why? Empathy. We&apos;re building for learners, and it helps if you&apos;ve been one.",
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
    description: "You won&apos;t just execute specs. You&apos;ll shape the vision, design systems, and experiment wildly",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "A Voice in the Product",
    description: "Every pixel, line of code, or interaction matters. You&apos;ll help shape what this becomes",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Visibility & Recognition",
    description: "You&apos;ll be listed publicly as part of the early founding crew. Think: About page, changelogs, credits",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Extreme Learning Curve",
    description: "Startups are pressure cookers for growth. You&apos;ll stretch your skills like never before",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "1-on-1 Collaboration with Me",
    description:
      "I built Cambly APAC from scratch to $40M+ revenue — across product, design, marketing, ops, legal, and more. Now I&apos;m doing it all again, from zero",
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
    description: "Whether co-founder, full-time, or intern — if you help build this from Day 1, you are a founding team member",
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
    detail: "Bay Area preferred. Remote is possible if you&apos;re async-pro and move fast.",
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
    <Layout seamlessHeader>
      <div className="min-h-screen bg-gradient-to-br from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark">
        {/* Hero Section */}
        <section className="relative py-token-20 lg:py-token-32 overflow-hidden">
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

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              <motion.div
                className="flex items-center justify-center gap-token-4 mb-token-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Rocket className="w-12 h-12 text-token-primary" />
                <h1 className="text-token-4xl md:text-token-5xl font-bold bg-gradient-to-r from-token-primary via-token-accent to-token-secondary bg-clip-text text-transparent">
                  Join the Xpeak AI Adventure
                </h1>
              </motion.div>

              <motion.p
                className="text-token-xl md:text-token-2xl token-text-secondary mb-token-8 leading-relaxed max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome to the scrappy early days of something we believe will be huge. If you&apos;ve ever wanted to help
                build a product from the ground up — now&apos;s the time.
              </motion.p>

              <motion.p
                className="text-token-lg md:text-token-xl token-text-tertiary mb-token-8 leading-relaxed max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                We&apos;re on a mission to help the world speak as one. With AI-powered tutors, personalized learning journeys,
                and gamified experiences that actually make studying fun, Xpeak is here to shake up language learning.
              </motion.p>

              <motion.p
                className="text-token-2xl md:text-token-3xl font-bold token-text-primary mb-token-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                But to make this happen, I can&apos;t do it alone.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Who We're Looking For */}
        <section className="py-token-20 bg-token-surface/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-token-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-token-4 mb-token-6">
                  <Brain className="w-12 h-12 text-token-accent" />
                  <h2 className="text-token-3xl md:text-token-4xl font-bold token-text-primary">Who We&a  pos;re Looking For</h2>
                </div>
                <p className="text-token-xl token-text-tertiary">
                Whether you&apos;re a curious intern, a multi-hat wearing engineer, or a design wizard who vibes with our
                  mission — read on.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-token-8">
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
                      className={`p-token-8 h-full transition-all duration-300 hover:shadow-xl border-2 relative ${
                        hoveredRole === index ? "border-token-accent/30 shadow-lg scale-105" : "border-token-border"
                      } ${role.isDream ? "ring-2 ring-token-secondary" : ""}`}
                    >
                      {role.isDream && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-token-secondary text-token-text-inverse px-token-3 py-token-1 rounded-full text-token-sm font-semibold flex items-center gap-token-1">
                            <Star className="w-4 h-4" />
                            Dream Role
                          </span>
                        </div>
                      )}

                      <div className="text-center mb-token-6">
                        <div className="text-token-4xl mb-token-4">{role.emoji}</div>
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-2xl flex items-center justify-center mx-auto mb-token-4 text-white`}
                        >
                          {role.icon}
                        </div>
                        <h3 className="text-token-2xl font-bold token-text-primary">{role.title}</h3>
                      </div>

                      <ul className="space-y-token-4">
                        {role.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start gap-token-3 token-text-tertiary">
                            <div className="w-2 h-2 bg-token-accent rounded-full mt-token-2 flex-shrink-0"></div>
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
        <section className="py-token-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-token-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-token-4 mb-token-6">
                  <Heart className="w-12 h-12 text-token-primary" />
                  <h2 className="text-token-3xl md:text-token-4xl font-bold token-text-primary">What We Care About</h2>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-token-8">
                {careAbouts.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="p-token-8 h-full hover:shadow-lg transition-all duration-300 border-2 border-token-border hover:border-token-accent/30">
                      <div className="flex items-start gap-token-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-token-text-inverse flex-shrink-0`}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-token-xl font-bold token-text-primary mb-token-3">{item.title}</h3>
                          <p className="token-text-tertiary leading-relaxed">{item.description}</p>
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
        <section className="py-token-20 bg-gradient-to-br from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-token-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-token-4 mb-token-6">
                  <Zap className="w-12 h-12 text-token-primary" />
                  <h2 className="text-token-3xl md:text-token-4xl font-bold token-text-primary">What You&apos;ll Get</h2>
                </div>
                <p className="text-token-xl token-text-tertiary mb-token-8">
                We&apos;re early. Really early. But if you&apos;re looking to actually build something meaningful, here&apos;s what
                you&apos;ll get:
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-token-6">
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
                      className={`p-token-6 bg-token-surface/80 backdrop-blur-sm border-2 border-token-border hover:border-token-accent/30 transition-all duration-300 shadow-sm hover:shadow-lg ${
                        hoveredBenefit === index ? "scale-105 border-token-accent/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-token-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-token-primary to-token-accent rounded-lg flex items-center justify-center text-white flex-shrink-0">
                          {benefit.icon}
                        </div>
                        <div>
                          <h3 className="text-token-lg font-bold mb-token-2 token-text-primary">{benefit.title}</h3>
                          <p className="token-text-tertiary text-token-sm leading-relaxed">{benefit.description}</p>
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
        <section className="py-token-20 bg-token-surface/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-token-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-token-4 mb-token-6">
                  <DollarSign className="w-12 h-12 text-token-success" />
                  <h2 className="text-token-3xl md:text-token-4xl font-bold token-text-primary">About Pay</h2>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="p-token-8 bg-gradient-to-br from-token-accent/10 to-token-primary/10 border-2 border-token-accent/20">
                  <div className="text-center mb-token-8">
                    <h3 className="text-token-2xl font-bold token-text-primary mb-token-4">
                      Right now, this is not a salaried role — YET.
                    </h3>
                    <p className="text-token-lg token-text-tertiary">Here&apos;s the honest breakdown:</p>
                  </div>

                  <div className="space-y-token-6 mb-token-8">
                    <div className="bg-token-surface/60 rounded-xl p-token-6">
                      <h4 className="font-bold token-text-primary mb-token-2">Current Reality:</h4>
                      <ul className="space-y-token-2 token-text-tertiary">
                        <li className="flex items-center gap-token-2">
                          <div className="w-2 h-2 bg-token-error rounded-full"></div>
                          I&apos;m bootstrapping this. No VC money yet. No salary pool.
                        </li>
                        <li className="flex items-center gap-token-2">
                          <div className="w-2 h-2 bg-token-warning rounded-full"></div>
                          If you&apos;re a student or intern, a modest stipend may be possible depending on your commitment.
                        </li>
                      </ul>
                    </div>

                    <div className="bg-token-surface/60 rounded-xl p-token-6">
                      <h4 className="font-bold token-text-primary mb-token-2">What I can promise is:</h4>
                      <ul className="space-y-token-2 token-text-tertiary">
                        <li className="flex items-center gap-token-2">
                          <div className="w-2 h-2 bg-token-accent rounded-full"></div>
                          Full transparency
                        </li>
                        <li className="flex items-center gap-token-2">
                          <div className="w-2 h-2 bg-token-primary rounded-full"></div>
                          Equity potential
                        </li>
                        <li className="flex items-center gap-token-2">
                          <div className="w-2 h-2 bg-token-success rounded-full"></div>
                          Direct impact on the product, the team, and the brand
                        </li>
                        <li className="flex items-center gap-token-2">
                          <div className="w-2 h-2 bg-token-secondary rounded-full"></div>
                          Learning by doing — at a crazy pace
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-token-lg token-text-secondary mb-token-4">
                      If this works, it works big. And we&apos;ll make sure it&apos;s worth your while.
                    </p>
                    <div className="inline-flex items-center gap-token-2 bg-token-accent text-token-text-inverse px-token-6 py-token-3 rounded-full">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-bold">
                        TL;DR: No salary today. But we&apos;re building something bigger than paychecks.
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Logistics & Expectations */}
        <section className="py-token-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-token-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center justify-center gap-token-4 mb-token-6">
                  <Target className="w-12 h-12 text-token-primary" />
                  <h2 className="text-token-3xl md:text-token-4xl font-bold token-text-primary">Logistics & Expectations</h2>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-token-8">
                {logistics.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="p-token-6 hover:shadow-lg transition-all duration-300 border-2 border-token-border hover:border-token-accent/30">
                      <div className="flex items-start gap-token-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-token-primary to-token-accent rounded-lg flex items-center justify-center text-token-text-inverse flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="text-token-lg font-bold token-text-primary mb-token-2">{item.title}</h3>
                          <p className="token-text-tertiary">{item.detail}</p>
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
        <section className="py-token-20 bg-gradient-to-r from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-token-4 mb-token-8">
                <MessageCircle className="w-12 h-12 text-token-accent" />
                <h2 className="text-token-3xl font-bold token-text-primary">Sound Like You?</h2>
              </div>
              <p className="text-token-lg token-text-secondary mb-token-8 max-w-2xl mx-auto">
                Shoot me a message. Tell me what you&apos;ve built, what you want to build, and why this excites you.
              </p>

              <div className="flex flex-col sm:flex-row gap-token-6 justify-center items-center mb-token-8">
                <Button
                  variant="secondary"
                  size="lg"
                  className="px-token-8 py-token-4 rounded-full text-token-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group bg-token-surface text-token-primary border border-token-primary hover:bg-token-primary hover:text-token-text-inverse"
                >
                  <Mail className="mr-token-3 w-6 h-6 text-token-primary group-hover:text-token-text-inverse transition-colors" />
                  <span className="text-token-primary group-hover:text-token-text-inverse transition-colors">monster@xpeak.ai</span>
                  <ArrowRight className="ml-token-3 w-6 h-6 group-hover:text-token-text-inverse text-token-primary transition-colors" />
                </Button>
              </div>
              <div className="flex flex-row gap-token-4 justify-center items-center mt-token-2">
                <a
                  href="https://www.linkedin.com/in/monstershou/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="opacity-60 hover:opacity-100 transition token-text-primary"
                >
                  <Linkedin className="w-6 h-6" />
                  <span className="sr-only">LinkedIn</span>
                </a>
                <a
                  href="https://x.com/monstershou"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className="opacity-60 hover:opacity-100 transition token-text-primary"
                >
                  <XLogo />
                  <span className="sr-only">X</span>
                </a>
              </div>

              <h2 className="text-token-3xl md:text-token-4xl font-bold token-text-primary mt-token-20 mb-token-4">
                Let&apos;s build something people actually love to use.
              </h2>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  )
} 