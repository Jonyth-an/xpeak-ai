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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated background elements - Spark themed */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-red-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Topic Spark
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600">
                  Ignite Your Next Conversation
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Every journey begins with a spark. Topic Spark suggests personalized lesson ideas, cultural themes, and speaking challenges based on your goals — and your Word Maze.
              </p>
              
              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button 
                  onClick={() => router.push('/signup')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  → Generate Your Next Spark
                </Button>
              </div>

              <ConstellationSparks />

              {/* Caption below the new animation */}
              <div className="mt-8 text-center">
                <p className="text-lg text-gray-700 font-medium">
                  🔥 Watch your sparks form constellations — as your fluency path lights up with Treks uniquely tailored to you.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Section */}
        <div className="py-20 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                💡 Feature Highlights
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover how Topic Spark ignites your learning journey with AI-powered conversation starters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-red-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Curated Topics</h3>
                <p className="text-gray-700 leading-relaxed">
                  Get dynamic lesson and practice suggestions — from real-life travel to workplace scenarios — always matched to your level and interests.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-yellow-50 to-orange-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🕸️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fueled by Your Maze</h3>
                <p className="text-gray-700 leading-relaxed">
                  Topic Sparks connect directly to your Word Maze, reinforcing what you've learned and revealing what to explore next.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-red-50 to-pink-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🗺️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Build Your Trek</h3>
                <p className="text-gray-700 leading-relaxed">
                  Each Spark can expand into a Trek — a multi-step journey of lessons, conversations, and real-world use.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-pink-50 to-purple-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Solo or Tutor-Ready</h3>
                <p className="text-gray-700 leading-relaxed">
                  Use Sparks for self-practice or launch a session with your AI or human tutor — all in one click.
                </p>
              </Card>

              {/* Feature 5 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-indigo-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ever-Evolving, Just Like You</h3>
                <p className="text-gray-700 leading-relaxed">
                  As you learn, Spark recommendations grow smarter — reflecting your goals, pace, and personal style.
                </p>
              </Card>

              {/* Feature 6 - Bonus */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-indigo-50 to-blue-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Adventure Awaits</h3>
                <p className="text-gray-700 leading-relaxed">
                  Every Spark is an invitation to explore new conversations, cultures, and connections in your target language.
                </p>
              </Card>
            </div>
          </div>
        </div>

        <SparkToTrekAnimation />

        {/* Testimonial Section */}
        <div className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
              <div className="text-6xl mb-6">💬</div>
              <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
                "Sometimes I don't know what to study next. Topic Spark makes it easy — and every topic feels spot on."
              </blockquote>
              <cite className="text-xl text-orange-100 font-semibold">
                — Carlos, Busy Learner & Occasional Traveler
              </cite>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              See where your next Spark will take you.
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of learners who are already igniting their conversations with Topic Spark.
            </p>
            <Button 
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              → Generate Your Spark Now
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 