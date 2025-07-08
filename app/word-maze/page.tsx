'use client';

import React, { useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/app/components/ui';

export default function WordMazePublicPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Generate maze pattern data deterministically to avoid hydration errors
  const mazePattern = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      isActive: (i % 7 === 0) || (i % 11 === 0), // deterministic pattern
      animationDelay: i * 100, // 0ms, 100ms, 200ms, ...
      animationDuration: 2000 + (i % 10) * 300 // 2000ms, 2300ms, ...
    }));
  }, []);

  // Redirect logged-in users to the authenticated Word Maze page
  useEffect(() => {
    if (user) {
      router.push('/word-maze/learn');
    }
  }, [user, router]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-token-surface-subtle via-token-surface-accent to-token-surface-accent-light">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-token-40 -right-token-40 w-token-80 h-token-80 bg-gradient-to-br from-token-primary/20 to-token-secondary/20 rounded-full blur-token-3xl animate-pulse"></div>
            <div className="absolute -bottom-token-40 -left-token-40 w-token-80 h-token-80 bg-gradient-to-tr from-token-accent-light/20 to-token-primary/20 rounded-full blur-token-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-token-96 h-token-96 bg-gradient-to-r from-token-secondary/10 to-token-primary/10 rounded-full blur-token-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-token-24">
            <div className="flex flex-col lg:flex-row items-center gap-token-12">
              {/* Left: Text content */}
              <div className="flex-1 text-left">
                <h1 className="text-token-4xl md:text-token-5xl font-extrabold token-text-primary leading-tight mb-token-8">
                  Word Maze
                  <br />
                  <span className="text-token-primary bg-gradient-to-r from-token-primary to-token-accent bg-clip-text text-transparent">
                    Where Words Become Worlds
                  </span>
                </h1>
                <p className="text-token-body-xl md:text-token-body-2xl text-token-text-secondary mb-token-12 max-w-token-2xl leading-relaxed">
                  Turn every word into a stepping stone. Word Maze helps you connect, practice, and remember vocabulary — like never before.
                </p>
                <Button 
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/signup')}
                  className="mb-token-8"
                >
                  → Start Your Maze
                </Button>
              </div>
              {/* Right: Animation/Visual Metaphor */}
              <div className="flex-1 flex justify-center items-center">
                <div className="relative mx-auto w-token-96 h-token-64 bg-gradient-to-br from-token-primary/10 to-token-secondary/10 rounded-token-2xl border-token-2 border-token-primary/20 backdrop-blur-sm shadow-token-lg">
                  {/* Animated maze pattern */}
                  <div className="absolute inset-token-4">
                    <div className="grid grid-cols-8 grid-rows-5 gap-token-1">
                      {mazePattern.map((cell, i) => (
                        <div
                          key={i}
                          className={`w-full h-full rounded-token-sm transition-token-normal duration-1000 ${
                            cell.isActive
                              ? 'bg-gradient-to-br from-token-primary/60 to-token-secondary/60 animate-pulse' 
                              : 'bg-gradient-to-br from-token-primary/30 to-token-secondary/30'
                          }`}
                          style={{
                            animationDelay: `${cell.animationDelay}ms`,
                            animationDuration: `${cell.animationDuration}ms`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  {/* Glowing center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-token-16 h-token-16 bg-gradient-to-r from-token-accent to-token-accent-light rounded-token-full shadow-token-lg animate-pulse"></div>
                </div>
              </div>
            </div>
            {/* Caption below the flex row */}
            <div className="mt-token-8 text-center">
              <p className="text-token-body-lg text-token-text font-token-medium">
                🌀 Explore a living, intelligent maze of words — personalized to how you think, learn, and speak.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Section */}
        <div className="py-token-20 bg-token-surface/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-token-16">
              <h2 className="text-token-heading-xl font-token-bold text-token-text mb-token-6">
                💡 See How Words Become Worlds
              </h2>
              <p className="text-token-body-xl text-token-text-secondary max-w-token-3xl mx-auto leading-relaxed">
                Discover how Word Maze transforms vocabulary learning into an engaging adventure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-token-8">
              {/* Feature 1 */}
              <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-primary/5 to-token-primary-light/5 border-0">
                <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-primary to-token-primary-light rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                  <span className="text-token-3xl">🕸️</span>
                </div>
                <h3 className="text-token-heading-lg font-token-bold text-token-text mb-token-4">Dynamic Word Webs</h3>
                <p className="text-token-text-secondary leading-relaxed">
                  Words connect based on meaning and usage — building a personal map of your fluency.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-success/5 to-token-success-light/5 border-0">
                <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-success to-token-success-light rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                  <span className="text-token-3xl">📚</span>
                </div>
                <h3 className="text-token-heading-lg font-token-bold text-token-text mb-token-4">Real-Source Vocabulary</h3>
                <p className="text-token-text-secondary leading-relaxed">
                  Your Maze grows from real conversations, lessons, and the words you choose to learn.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-secondary/5 to-token-secondary-light/5 border-0">
                <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-secondary to-token-secondary-light rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                  <span className="text-token-3xl">🧠</span>
                </div>
                <h3 className="text-token-heading-lg font-token-bold text-token-text mb-token-4">Smart Practice & Hints</h3>
                <p className="text-token-text-secondary leading-relaxed">
                  Get timely quizzes and gentle nudges to reinforce tricky words.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-accent/5 to-token-accent-light/5 border-0">
                <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-accent to-token-accent-light rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                  <span className="text-token-3xl">🎯</span>
                </div>
                <h3 className="text-token-heading-lg font-token-bold text-token-text mb-token-4">Purposeful Progression</h3>
                <p className="text-token-text-secondary leading-relaxed">
                  Each word you unlock fuels your next lesson, topic, or conversation.
                </p>
              </Card>

              {/* Feature 5 */}
              <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-primary-light/5 to-token-secondary-light/5 border-0">
                <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-primary-light to-token-secondary-light rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                  <span className="text-token-3xl">👥</span>
                </div>
                <h3 className="text-token-heading-lg font-token-bold text-token-text mb-token-4">Powered by Community</h3>
                <p className="text-token-text-secondary leading-relaxed">
                  See trending words, explore shared Mazes, and become a Maze Builder yourself.
                </p>
              </Card>

              {/* Feature 6 - Bonus */}
              <Card className="card-token-elevated p-token-8 text-center hover:shadow-token-xl transition-token-normal transform hover:-translate-y-token-2 bg-gradient-to-br from-token-accent-light/5 to-token-primary/5 border-0">
                <div className="w-token-20 h-token-20 bg-gradient-to-br from-token-accent-light to-token-primary rounded-token-2xl flex items-center justify-center mx-auto mb-token-6 shadow-token-lg">
                  <span className="text-token-3xl">🚀</span>
                </div>
                <h3 className="text-token-heading-lg font-token-bold text-token-text mb-token-4">AI-Powered Insights</h3>
                <p className="text-token-text-secondary leading-relaxed">
                  Advanced AI analyzes your learning patterns to optimize your vocabulary journey.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="py-token-20 bg-gradient-to-r from-token-primary to-token-secondary">
          <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-token-text-inverse/10 backdrop-blur-sm rounded-token-3xl p-token-12 border border-token-text-inverse/20 shadow-token-xl">
              <div className="text-token-6xl mb-token-6">💬</div>
              <blockquote className="text-token-heading-xl md:text-token-heading-2xl font-token-medium text-token-text-inverse mb-token-6 leading-relaxed">
                "Word Maze makes learning new vocabulary actually fun. I finally remember the words I used to forget!"
              </blockquote>
              <cite className="text-token-body-xl text-token-text-inverse/80 font-token-semibold">
                — Lina, Intermediate English Learner
              </cite>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-token-20 bg-gradient-to-br from-token-surface-dark to-token-surface-darker">
          <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-token-display-lg md:text-token-display-xl font-token-bold mb-token-6">
              <span className="block text-token-primary">
                Ready to make words stick —
              </span>
              <span className="block bg-gradient-to-r from-token-primary to-token-secondary bg-clip-text text-transparent">
                and shape your next learning journey?
              </span>
            </h2>
            <p className="text-token-body-xl text-token-text-inverse/70 mb-token-10 max-w-token-2xl mx-auto leading-relaxed">
              Join thousands of learners who are already exploring their personalized word mazes.
            </p>
            <Button 
              variant="primary"
              size="lg"
              onClick={() => router.push('/signup')}
            >
              → Start Exploring Your Maze Today
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 