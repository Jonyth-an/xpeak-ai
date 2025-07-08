'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';
import { Card, Button } from '@/app/components/ui';
import SparkToTrekAnimation from './SparkToTrekAnimation';
import ConstellationSparks from './ConstellationSparks';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TopicSparkPage() {
  const { user } = useAuth();

  // Redirect logged-in users to the authenticated Topic Spark page
  useEffect(() => {
    if (user) {
      // Redirect to the authenticated page
      window.location.href = '/topic-spark/generate';
    }
  }, [user]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-token-surface-accent-light via-token-surface-accent to-token-surface-accent-dark pt-16">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
        {/* Animated background elements - Spark themed */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-token-40 -right-token-40 w-token-80 h-token-80 bg-gradient-to-br from-token-accent/20 to-token-primary/20 rounded-token-full blur-token-3xl animate-pulse"></div>
          <div className="absolute -bottom-token-40 -left-token-40 w-token-80 h-token-80 bg-gradient-to-tr from-token-secondary/20 to-token-accent/20 rounded-token-full blur-token-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-token-96 h-token-96 bg-gradient-to-r from-token-primary/10 to-token-accent/10 rounded-token-full blur-token-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-token-24">
          <div className="flex flex-col lg:flex-row items-center gap-token-12">
            {/* Left: Text content */}
            <div className="flex-1 text-left">
              <h1 className="text-token-4xl md:text-token-5xl font-extrabold token-text-primary leading-tight mb-token-8">
                Topic Spark
                <br />
                <span className="text-token-primary bg-gradient-to-r from-token-primary to-token-accent bg-clip-text text-transparent">
                  Ignite Your Next Conversation
                </span>
              </h1>
              <p className="text-token-xl md:text-token-2xl token-text-secondary mb-token-12 max-w-token-2xl leading-relaxed">
                Every journey begins with a spark. Topic Spark suggests personalized lesson ideas, cultural themes, and speaking challenges based on your goals — and your Word Maze.
              </p>
              <Button 
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/signup'}
                className="px-token-10 py-token-4 text-token-xl font-semibold transform hover:scale-token-105 transition-token-normal mb-token-8"
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
          <div className="mt-token-8 text-center">
            <p className="text-token-lg token-text-secondary font-medium leading-relaxed">
              🔥 Watch your sparks form constellations — as your fluency path lights up with Treks uniquely tailored to you.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <div className="py-token-20 bg-token-surface/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-token-16">
            <h2 className="text-token-display-lg md:text-token-display-xl font-token-bold text-token-primary mb-token-6">
              💡 Feature Highlights
            </h2>
            <p className="text-token-body-xl text-token-secondary max-w-3xl mx-auto leading-relaxed">
              Discover how Topic Spark ignites your learning journey with AI-powered conversation starters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-8">
            {/* Feature 1 */}
            <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-accent-light to-token-primary-light border-0">
              <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-accent to-token-primary rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                <span className="text-token-3xl">🤖</span>
              </div>
              <h3 className="text-token-2xl font-bold token-text-primary mb-token-4">AI-Curated Topics</h3>
              <p className="token-text-secondary leading-relaxed">
                Get dynamic lesson and practice suggestions — from real-life travel to workplace scenarios — always matched to your level and interests.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-secondary-light to-token-accent-light border-0">
              <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-secondary to-token-accent rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                <span className="text-token-3xl">🕸️</span>
              </div>
              <h3 className="text-token-2xl font-bold token-text-primary mb-token-4">Fueled by Your Maze</h3>
              <p className="token-text-secondary leading-relaxed">
                Topic Sparks connect directly to your Word Maze, reinforcing what you&apos;ve learned and revealing what to explore next.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-primary-light to-token-accent-light border-0">
              <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-primary to-token-accent rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                <span className="text-token-3xl">🗺️</span>
              </div>
              <h3 className="text-token-2xl font-bold token-text-primary mb-token-4">Build Your Trek</h3>
              <p className="token-text-secondary leading-relaxed">
                Each Spark can expand into a Trek — a multi-step journey of lessons, conversations, and real-world use.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-accent-light to-token-secondary-light border-0">
              <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-accent to-token-secondary rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                <span className="text-token-3xl">👥</span>
              </div>
              <h3 className="text-token-2xl font-bold token-text-primary mb-token-4">Solo or Tutor-Ready</h3>
              <p className="token-text-secondary leading-relaxed">
                Use Sparks for self-practice or launch a session with your AI or human tutor — all in one click.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-secondary-light to-token-primary-light border-0">
              <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-secondary to-token-primary rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                <span className="text-token-3xl">🧠</span>
              </div>
              <h3 className="text-token-2xl font-bold token-text-primary mb-token-4">Ever-Evolving, Just Like You</h3>
              <p className="token-text-secondary leading-relaxed">
                As you learn, Spark recommendations grow smarter — reflecting your goals, pace, and personal style.
              </p>
            </Card>

            {/* Feature 6 - Bonus */}
            <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-primary-light to-token-secondary-light border-0">
              <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-primary to-token-secondary rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                <span className="text-token-3xl">🚀</span>
              </div>
              <h3 className="text-token-2xl font-bold token-text-primary mb-token-4">Adventure Awaits</h3>
              <p className="token-text-secondary leading-relaxed">
                Every Spark is an invitation to explore new conversations, cultures, and connections in your target language.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <SparkToTrekAnimation />

      {/* Testimonial Section */}
      <div className="py-token-20 bg-gradient-to-r from-token-accent to-token-primary">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-token-surface/10 backdrop-blur-sm rounded-token-3xl p-token-12 border border-token-surface/20 shadow-token-xl">
            <div className="text-token-6xl mb-token-6">💬</div>
            <blockquote className="text-token-2xl md:text-token-3xl font-medium token-text-inverse mb-token-6 leading-relaxed">
              &ldquo;Sometimes I don&apos;t know what to study next. Topic Spark makes it easy — and every topic feels spot on.&rdquo;
            </blockquote>
            <cite className="text-token-xl token-text-surface/80 font-semibold">
              — Carlos, Busy Learner & Occasional Traveler
            </cite>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-token-20 bg-gradient-to-br from-token-surface-dark to-token-surface-darker">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-token-display-lg md:text-token-display-xl font-token-bold mb-token-6">
            <span className="block text-token-primary">
              See where your next Spark will take you.
            </span>
          </h2>
          <p className="text-token-body-xl text-token-inverse/70 mb-token-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners who are already igniting their conversations with Topic Spark.
          </p>
          <Button 
            variant="primary"
            size="lg"
            onClick={() => window.location.href = '/signup'}
            className="px-token-12 py-token-4 text-token-xl font-semibold transform hover:scale-token-105 transition-token-normal"
          >
            → Generate Your Spark Now
          </Button>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
} 