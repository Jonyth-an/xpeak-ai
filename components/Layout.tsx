"use client"
import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import EmailVerificationBanner from '@/app/components/EmailVerificationBanner';
import HeroSection from '@/app/components/HeroSection';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <EmailVerificationBanner />
      <main className="flex-grow">
        {shouldShowHero && <HeroSection />}
        {children}
      </main>
      <Footer />
    </div>
  );
} 