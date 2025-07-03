'use client';

import React from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, Button, Text } from '@/app/components/ui';
import WordToMazeAnimation from './WordToMazeAnimation';

export default function WordMazePublicPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to the authenticated Word Maze page
  useEffect(() => {
    if (user) {
      router.push('/word-maze/learn');
    }
  }, [user, router]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Word Maze
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                  Where Words Become Worlds
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                Turn every word into a stepping stone. Word Maze helps you connect, practice, and remember vocabulary — like never before.
              </p>
              
              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button 
                  onClick={() => router.push('/signup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  → Start Your Maze
                </Button>
              </div>

              {/* Visual Metaphor Section */}
              <div className="relative">
                {/* Maze Illustration Placeholder */}
                <div className="relative mx-auto w-96 h-64 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-2xl border-2 border-blue-200/50 backdrop-blur-sm">
                  {/* Animated maze pattern */}
                  <div className="absolute inset-4">
                    <div className="grid grid-cols-8 grid-rows-5 gap-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-full h-full rounded-sm transition-all duration-1000 ${
                            Math.random() > 0.7 
                              ? 'bg-gradient-to-br from-blue-400/60 to-purple-400/60 animate-pulse' 
                              : 'bg-gradient-to-br from-blue-200/30 to-purple-200/30'
                          }`}
                          style={{
                            animationDelay: `${i * 100}ms`,
                            animationDuration: `${2000 + Math.random() * 2000}ms`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Glowing center */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg animate-pulse"></div>
                </div>

                {/* Caption */}
                <div className="mt-8 text-center">
                  <p className="text-lg text-gray-700 font-medium">
                    🌀 Explore a living, intelligent maze of words — personalized to how you think, learn, and speak.
                  </p>
                </div>
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
                Discover how Word Maze transforms vocabulary learning into an engaging adventure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🕸️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Dynamic Word Webs</h3>
                <p className="text-gray-700 leading-relaxed">
                  Words connect based on meaning and usage — building a personal map of your fluency.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Source Vocabulary</h3>
                <p className="text-gray-700 leading-relaxed">
                  Your Maze grows from real conversations, lessons, and the words you choose to learn.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-violet-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🧠</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Practice & Hints</h3>
                <p className="text-gray-700 leading-relaxed">
                  Get timely quizzes and gentle nudges to reinforce tricky words.
                </p>
              </Card>

              {/* Feature 4 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-red-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Purposeful Progression</h3>
                <p className="text-gray-700 leading-relaxed">
                  Each word you unlock fuels your next lesson, topic, or conversation.
                </p>
              </Card>

              {/* Feature 5 */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-pink-50 to-rose-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Powered by Community</h3>
                <p className="text-gray-700 leading-relaxed">
                  See trending words, explore shared Mazes, and become a Maze Builder yourself.
                </p>
              </Card>

              {/* Feature 6 - Bonus */}
              <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-cyan-50 to-blue-50 border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl">🚀</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Insights</h3>
                <p className="text-gray-700 leading-relaxed">
                  Advanced AI analyzes your learning patterns to optimize your vocabulary journey.
                </p>
              </Card>
            </div>
          </div>
        </div>

        <WordToMazeAnimation />

        {/* Testimonial Section */}
        <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
              <div className="text-6xl mb-6">💬</div>
              <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed">
                "Word Maze makes learning new vocabulary actually fun. I finally remember the words I used to forget!"
              </blockquote>
              <cite className="text-xl text-blue-100 font-semibold">
                — Lina, Intermediate English Learner
              </cite>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to make words stick — and shape your next learning journey?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of learners who are already exploring their personalized word mazes.
            </p>
            <Button 
              onClick={() => router.push('/signup')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              → Start Exploring Your Maze Today
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 