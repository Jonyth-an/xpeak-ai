'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background shadow-md' : 'bg-background/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Xpeak AI</span>
            </Link>
          </div>

          {/* Navigation Tabs - Hidden on mobile */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-text-secondary hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              Home
            </Link>
            <Link href="/tutors" className="text-text-secondary hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              Tutors
            </Link>
            <Link href="/ai-topics" className="text-text-secondary hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              AI Topics
            </Link>
            <Link href="/word-maze" className="text-text-secondary hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              Word Maze
            </Link>
            <Link href="/pricing" className="text-text-secondary hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
              Pricing
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Become a Tutor Link - Hidden on mobile */}
            <Link href="/become-a-tutor" className="hidden lg:block text-text-secondary hover:text-primary-600 text-sm font-medium transition-colors">
              Become a Tutor
            </Link>

            {/* Language Selector - Hidden on mobile */}
            <div className="hidden md:block">
              <select className="bg-transparent border border-border rounded-md px-3 py-1 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              <Link href="/login" className="text-text-secondary hover:text-primary-600 px-4 py-2 text-sm font-medium border border-border rounded-md hover:border-primary-300 transition-colors">
                Log In
              </Link>
              <Link href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-sm font-medium rounded-md transition-colors">
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-md text-text-secondary hover:text-primary-600 hover:bg-gray-100">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 