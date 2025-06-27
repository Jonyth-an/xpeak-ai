"use client"
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import EmailVerificationBanner from '@/app/components/EmailVerificationBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <EmailVerificationBanner />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
} 