'use client';

import React from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, Button, Text } from '@/app/components/ui';
import SparkToTrekAnimation from './SparkToTrekAnimation';
import ConstellationSparks from './ConstellationSparks';

export default function TopicSparkPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to the authenticated Topic Spark page
  useEffect(() => {
    if (user) {
      router.push('/topic-spark/generate');
    }
  }, [user, router]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated background elements - Spark themed */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-token-accent/20 to-token-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-token-secondary/20 to-token-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-token-primary/10 to-token-accent/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left: Text content */}
              <div className="flex-1 text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold text-text leading-tight mb-8">
                  Topic Spark
                  <br />
                  <span className="text-token-primary">Ignite Your Next Conversation</span>
                </h1>
                <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-2xl leading-relaxed">
                  Every journey begins with a spark. Topic Spark suggests personalized lesson ideas, cultural themes, and speaking challenges based on your goals — and your Word Maze.
                </p>
                <Button 
                  onClick={() => router.push('/signup')}
                  className="bg-gradient-to-r from-token-accent to-token-primary hover:from-token-accent-dark hover:to-token-primary-dark text-token-text-inverse px-10 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-8"
                >
                  → Generate Your Next Spark
                </Button>
              </div>
              {/* Right: Animation/Visual Metaphor */}
              <div className="flex-1 flex justify-center items-center">
                <ConstellationSparks />
              </div>
            </div>
            {/* Caption below the flex row */}
            <div className="mt-8 text-center">
              <p className="text-lg text-text-secondary font-medium">
                🔥 Watch your sparks form constellations — as your fluency path lights up with Treks uniquely tailored to you.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Section */}
        <div className="py-20 bg-token-surface/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-text mb-6">
                💡 Feature Highlights
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Discover how Topic Spark ignites your learning journey with AI-powered conversation starters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-token-accent-light to-token-primary-light border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-token-accent to-token-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">AI-Curated Topics</h3>
                <p className="text-text-secondary leading-relaxed">
                  Get dynamic lesson and practice suggestions — from real-life travel to workplace scenarios — always matched to your level and interests.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-token-secondary-light to-token-accent-light border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-token-secondary to-token-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🕸️</span>
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">Fueled by Your Maze</h3>
                <p className="text-text-secondary leading-relaxed">
                  Topic Sparks connect directly to your Word Maze, reinforcing what you've learned and revealing what to explore next.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-token-primary-light to-token-accent-light border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-token-primary to-token-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🗺️</span>
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">Build Your Trek</h3>
                <p className="text-text-secondary leading-relaxed">
                  Each Spark can expand into a Trek — a multi-step journey of lessons, conversations, and real-world use.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-token-accent-light to-token-secondary-light border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-token-accent to-token-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">Solo or Tutor-Ready</h3>
                <p className="text-text-secondary leading-relaxed">
                  Use Sparks for self-practice or launch a session with your AI or human tutor — all in one click.
                </p>
              </Card>

              {/* Feature 5 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-token-secondary-light to-token-primary-light border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-token-secondary to-token-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">Ever-Evolving, Just Like You</h3>
                <p className="text-text-secondary leading-relaxed">
                  As you learn, Spark recommendations grow smarter — reflecting your goals, pace, and personal style.
                </p>
              </Card>

              {/* Feature 6 - Bonus */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-token-primary-light to-token-secondary-light border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-token-primary to-token-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-text mb-4">Adventure Awaits</h3>
                <p className="text-text-secondary leading-relaxed">
                  Every Spark is an invitation to explore new conversations, cultures, and connections in your target language.
                </p>
              </Card>
            </div>
          </div>
        </div>

        <SparkToTrekAnimation />

        {/* Testimonial Section */}
        <div className="py-20 bg-gradient-to-r from-token-accent to-token-primary">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-token-surface/10 backdrop-blur-sm rounded-3xl p-12 border border-token-surface/20">
              <div className="text-6xl mb-6">💬</div>
              <blockquote className="text-2xl md:text-3xl font-medium text-token-text-inverse mb-6 leading-relaxed">
                "Sometimes I don't know what to study next. Topic Spark makes it easy — and every topic feels spot on."
              </blockquote>
              <cite className="text-xl text-token-surface/80 font-semibold">
                — Carlos, Busy Learner & Occasional Traveler
              </cite>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-20 bg-gradient-to-br from-token-surface-dark to-token-surface-darker">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="block text-token-primary">
                See where your next Spark will take you.
              </span>
            </h2>
            <p className="text-xl text-token-text-inverse/70 mb-10 max-w-2xl mx-auto">
              Join thousands of learners who are already igniting their conversations with Topic Spark.
            </p>
            <Button 
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-token-accent to-token-primary hover:from-token-accent-dark hover:to-token-primary-dark text-token-text-inverse px-12 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              → Generate Your Spark Now
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 