'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Select, Text, Card } from '@/app/components/ui';
import LanguageSelectorMenu from '@/app/components/molecules/LanguageSelectorMenu';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({ label: 'English', code: 'EN', flag: '🇺🇸' });

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
              <Text variant="h2" as="span" className="text-primary-600">
                Xpeak AI
              </Text>
            </Link>
          </div>

          {/* Navigation Tabs - Hidden on mobile */}
          <nav className="hidden md:flex gap-x-4">
            <Link href="/" className="text-base font-medium h-10 flex items-center px-4 rounded-lg text-text-secondary hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link href="/tutors" className="text-base font-medium h-10 flex items-center px-4 rounded-lg text-text-secondary hover:text-primary-600 transition-colors">
              Tutors
            </Link>
            <Link href="/ai-topics" className="text-base font-medium h-10 flex items-center px-4 rounded-lg text-text-secondary hover:text-primary-600 transition-colors">
              AI Topics
            </Link>
            <Link href="/word-maze" className="text-base font-medium h-10 flex items-center px-4 rounded-lg text-text-secondary hover:text-primary-600 transition-colors">
              Word Maze
            </Link>
            <Link href="/pricing" className="text-base font-medium h-10 flex items-center px-4 rounded-lg text-text-secondary hover:text-primary-600 transition-colors">
              Pricing
            </Link>
            <Link href="/become-a-tutor" className="text-base font-medium h-10 flex items-center px-4 rounded-lg text-text-secondary hover:text-primary-600 transition-colors">
              Become a Tutor
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="hidden md:block">
              <LanguageSelectorMenu
                className="h-10 px-4 text-base font-medium rounded-lg border border-token-border bg-white"
                options={[
                  { label: 'English', code: 'EN', flag: '🇺🇸' },
                  { label: 'Español', code: 'ES', flag: '🇪🇸' },
                  { label: '中文', code: 'ZH', flag: '🇨🇳' },
                  { label: '日本語', code: 'JA', flag: '🇯🇵' }
                ]}
                value={selectedLanguage.code}
                onSelect={setSelectedLanguage}
              />
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-x-2">
              <Link href="/login">
                <Button variant="outline" className="h-10 px-4 text-base font-medium rounded-lg">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" className="h-10 px-4 text-base font-medium rounded-lg">Sign Up</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 