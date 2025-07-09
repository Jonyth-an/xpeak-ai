"use client"
import React, { createContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header, { HeroBackgroundContext } from './Header';
import Footer from './Footer';
import EmailVerificationBanner from '@/app/components/EmailVerificationBanner';
import HeroSection from '@/app/components/HeroSection';
import MobileHeader from '@/app/components/MobileHeader';
import { MobileBottomNav } from '@/app/components/MobileBottomNav';

interface LayoutProps {
  children: React.ReactNode;
  heroBackgroundColor?: string;
}

export default function Layout({ children, heroBackgroundColor }: LayoutProps) {
  const pathname = usePathname();
  
  // Pages where we don't want to show the hero section
  const noHeroPages = [
    '/pricing',
    '/login',
    '/signup',
    '/password-reset',
    '/verify-email',
    '/checkout',
    '/dashboard',
    '/profile',
    '/admin',
    '/meet-sagea', // Has its own hero section
    '/topic-spark', // Has its own hero section
    '/word-maze', // Has its own hero section
    '/become-a-tutor', // Has its own hero section
    '/community', // Has its own hero section
    '/career', // Has its own hero section
    '/', // Home page - has its own hero section
  ];
  
  // Check if current page should show hero
  const shouldShowHero = !noHeroPages.some(page => pathname.startsWith(page));

  return (
    <HeroBackgroundContext.Provider value={heroBackgroundColor || null}>
      <div className="min-h-screen flex flex-col">
        {/* Desktop Header (hidden on mobile) */}
        <div className="hidden md:block">
          <Header heroBackgroundColor={heroBackgroundColor} />
        </div>
        {/* Mobile Header (hidden on desktop) */}
        <MobileHeader />
        {/* Email Verification Banner */}
        <EmailVerificationBanner />
        {/* Main Content with proper spacing */}
        <main className="flex-grow">
          {/* Remove top padding if heroBackgroundColor is set */}
          <div className={heroBackgroundColor ? '' : 'pt-14 md:pt-16'}>
            {children}
          </div>
        </main>
        {/* Footer */}
        <Footer />
        {/* Mobile Bottom Navigation (hidden on desktop) */}
        <MobileBottomNav />
        {/* Add bottom padding for mobile bottom nav (64 = h-16) */}
        <div className="h-16 md:hidden"></div>
      </div>
    </HeroBackgroundContext.Provider>
  );
} 