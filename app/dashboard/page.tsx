'use client';

import React from 'react';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import RequireEmailVerification from '../components/RequireEmailVerification';
import { Text } from '@/app/components/ui';
import { Button } from '@/app/components/ui/Button';
import { Sparkles, BookOpen, Users, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent">
            <div className="max-w-4xl mx-auto text-center">
              {/* Welcome Header */}
              <div className="mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-token-primary to-token-accent rounded-full mb-8 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <Text variant="h1" as="h1" className="mb-6">
                  Welcome to Xpeak AI! 🎉
                </Text>
                <Text variant="lead" className="text-text-secondary max-w-2xl mx-auto">
                  Your personalized learning dashboard is being crafted with care. 
                  We're building something amazing for your language journey.
                </Text>
              </div>

              {/* Coming Soon Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/20 mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-token-accent to-token-secondary rounded-full mb-6">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <Text variant="h2" as="h2" className="mb-4">
                  Dashboard Coming Soon
                </Text>
                <Text variant="body" className="text-text-secondary mb-8 max-w-lg mx-auto text-lg">
                  We're working hard to bring you a comprehensive dashboard with progress tracking, 
                  achievements, and personalized learning insights.
                </Text>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6 max-w-md mx-auto">
                  <div className="bg-gradient-to-r from-token-primary to-token-accent h-3 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                </div>
                <Text variant="small" className="text-text-tertiary">
                  Development Progress: 65% Complete
                </Text>
              </div>

              {/* What's Coming */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-token-primary to-token-accent rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <Text variant="h3" as="h3" className="mb-2">
                    Progress Tracking
                  </Text>
                  <Text variant="body" className="text-text-secondary text-sm">
                    Visualize your learning journey with detailed progress charts and milestones
                  </Text>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-token-secondary to-token-accent rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <Text variant="h3" as="h3" className="mb-2">
                    AI Insights
                  </Text>
                  <Text variant="body" className="text-text-secondary text-sm">
                    Get personalized recommendations and learning insights powered by AI
                  </Text>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-token-accent to-token-primary rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <Text variant="h3" as="h3" className="mb-2">
                    Smart Features
                  </Text>
                  <Text variant="body" className="text-text-secondary text-sm">
                    Advanced features to accelerate your language learning progress
                  </Text>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/word-maze">
                  <Button variant="primary" size="lg" className="px-8 py-4">
                    Start Learning
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/meet-sagea">
                  <Button variant="secondary" size="lg" className="px-8 py-4">
                    Meet Your AI Coach
                  </Button>
                </Link>
              </div>

              {/* Footer Note */}
              <div className="mt-12 pt-8 border-t border-white/20">
                <Text variant="small" className="text-text-tertiary">
                  Have feedback or suggestions? We'd love to hear from you! 
                  <Link href="/community" className="text-token-primary hover:underline ml-1">
                    Join our community
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