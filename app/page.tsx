'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';
import { useRouter } from 'next/navigation';
import HomePage from './home/page';

export default function MainPage() {
  const { user, loading } = useAuth();
  const { roles } = useRoles();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Route based on user role
      if (roles.includes('admin')) {
        router.push('/admin/dashboard');
      } else if (roles.includes('tutor')) {
        router.push('/tutor');
      } else {
        router.push('/student/dashboard');
      }
    }
  }, [user, loading, router, roles]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show home page only for logged-out users
  if (!user) {
    return <HomePage />;
  }

  // This will be replaced by the redirect, but just in case
  return null;
} 