'use client';

import React from 'react';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import RequireEmailVerification from '../../components/RequireEmailVerification';
import { Text } from '@/app/components/ui';
import { Button } from '@/app/components/ui/Button';
import { Sparkles, Lightbulb, Brain, Target, ArrowRight, Zap, Globe, Users } from 'lucide-react';
import Link from 'next/link';

export default function TopicSparkGeneratePage() {
  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent">
            <div className="max-w-4xl mx-auto text-center">
              {/* Welcome Header */}
              <div className="mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-token-accent to-token-primary rounded-full mb-8 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <Text variant="h1" as="h1" className="mb-6">
                  Topic Spark Generator 🔥
                </Text>
                <Text variant="lead" className="text-text-secondary max-w-2xl mx-auto">
                  Your AI-powered conversation starter is being crafted. 
                  We're building the smartest way to ignite your language learning journey.
                </Text>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/20 mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-token-primary to-token-accent rounded-full mb-6">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <Text variant="h2" as="h2" className="mb-4">
                  Smart Topic Generation Coming Soon
                </Text>
                <Text variant="body" className="text-text-secondary mb-8 max-w-lg mx-auto text-lg">
                  Our AI is learning your preferences and building personalized conversation starters 
                  that will make your language learning more engaging and effective.
                </Text>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6 max-w-md mx-auto">
                  <div className="bg-gradient-to-r from-token-accent to-token-primary h-3 rounded-full animate-pulse" style={{ width: '78%' }}></div>
                </div>
                <Text variant="small" className="text-text-tertiary">
                  AI Training Progress: 78% Complete
                </Text>
              </div>

              {/* What's Coming */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-token-primary to-token-accent rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <Text variant="h3" as="h3" className="mb-2 text-sm">
                    AI-Powered Topics
                  </Text>
                  <Text variant="body" className="text-text-secondary text-xs">
                    Intelligent conversation starters based on your learning level and interests
                  </Text>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-token-secondary to-token-accent rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <Text variant="h3" as="h3" className="mb-2 text-sm">
                    Personalized Learning
                  </Text>
                  <Text variant="body" className="text-text-secondary text-xs">
                    Topics tailored to your goals, current level, and learning style
                  </Text>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-token-accent to-token-primary rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <Text variant="h3" as="h3" className="mb-2 text-sm">
                    Cultural Context
                  </Text>
                  <Text variant="body" className="text-text-secondary text-xs">
                    Real-world scenarios and cultural insights for authentic conversations
                  </Text>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-token-primary to-token-secondary rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <Text variant="h3" as="h3" className="mb-2 text-sm">
                    Tutor Integration
                  </Text>
                  <Text variant="body" className="text-text-secondary text-xs">
                    Seamlessly connect topics to your AI or human tutor sessions
                  </Text>
                </div>
              </div>

              {/* How It Works Preview */}
              <div className="bg-gradient-to-r from-token-accent to-token-primary rounded-3xl p-8 mb-12 text-white">
                <Text variant="h2" as="h2" className="mb-6">
                  How Topic Spark Will Work
                </Text>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Text variant="h3" as="span" className="text-white">1</Text>
                    </div>
                    <Text variant="h3" as="h3" className="mb-2">
                      Generate
                    </Text>
                    <Text variant="body" className="text-white/80 text-sm">
                      AI analyzes your Word Maze and learning preferences
                    </Text>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Text variant="h3" as="span" className="text-white">2</Text>
                    </div>
                    <Text variant="h3" as="h3" className="mb-2">
                      Explore
                    </Text>
                    <Text variant="body" className="text-white/80 text-sm">
                      Choose from personalized conversation topics and themes
                    </Text>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Text variant="h3" as="span" className="text-white">3</Text>
                    </div>
                    <Text variant="h3" as="h3" className="mb-2">
                      Practice
                    </Text>
                    <Text variant="body" className="text-white/80 text-sm">
                      Start conversations with your tutor or practice solo
                    </Text>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/word-maze">
                  <Button variant="primary" size="lg" className="px-8 py-4">
                    Build Your Word Maze
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/meet-sagea">
                  <Button variant="secondary" size="lg" className="px-8 py-4">
                    Practice with Sagea
                  </Button>
                </Link>
              </div>

              {/* Early Access */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-token-accent mr-2" />
                  <Text variant="h3" as="h3">
                    Get Early Access
                  </Text>
                </div>
                <Text variant="body" className="text-text-secondary mb-4">
                  Be among the first to experience Topic Spark when it launches. 
                  We'll notify you as soon as it's ready!
                </Text>
                <Button variant="outline" size="md" className="px-6 py-2">
                  Join Waitlist
                </Button>
              </div>

              {/* Footer Note */}
              <div className="mt-12 pt-8 border-t border-white/20">
                <Text variant="small" className="text-text-tertiary">
                  Topic Spark will revolutionize how you discover conversation topics. 
                  <Link href="/community" className="text-token-primary hover:underline ml-1">
                    Share your ideas with our community
                  </Link>
                </Text>
              </div>
            </div>
          </section>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 