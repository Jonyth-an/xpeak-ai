'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Card, Text, Button, Badge } from '@/app/components/ui';
import { 
  Home, 
  Calendar, 
  Users, 
  BookOpen, 
  DollarSign, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  MessageSquare,
  HelpCircle,
  User,
  Shield,
  Palette,
  Globe,
  Clock,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Star,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Menu,
  X,
  MessageIcon
} from 'lucide-react';
import Image from 'next/image';
import { useRoles } from '@/lib/RolesContext';
import { supabase } from '@/lib/supabaseClient';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { MessageIcon as MessageIconComponent } from '@/app/components/ui/MessageIcon'

interface TutorProfile {
  id: string;
  display_name: string;
  timezone: string;
  timezone_confirmed: boolean;
  ip_timezone?: string;
  profile_image_url?: string;
  is_active: boolean;
}

interface TutorLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/tutor',
    icon: Home,
    description: 'Overview and today\'s schedule'
  },
  {
    name: 'Profile',
    href: '/tutor/profile',
    icon: User,
    description: 'View and edit your public profile'
  },
  {
    name: 'Calendar',
    href: '/tutor/calendar',
    icon: Calendar,
    description: 'Manage your availability'
  },
  {
    name: 'Upcoming Lessons',
    href: '/tutor/lessons',
    icon: Clock,
    description: 'View and manage upcoming lessons'
  },
  {
    name: 'Messages',
    href: '/tutor/chat',
    icon: MessageIconComponent,
    description: 'View and send messages'
  },
  {
    name: 'Lesson History',
    href: '/tutor/history',
    icon: BookOpen,
    description: 'Review past lessons'
  },
  {
    name: 'My Students',
    href: '/tutor/students',
    icon: Users,
    description: 'Manage student relationships'
  },
  {
    name: 'Performance',
    href: '/tutor/performance',
    icon: TrendingUp,
    description: 'Track your progress'
  },
  {
    name: 'Earnings',
    href: '/tutor/earnings',
    icon: DollarSign,
    description: 'View income and payouts'
  },
  {
    name: 'Tools & Materials',
    href: '/tutor/tools',
    icon: Settings,
    description: 'Teaching resources'
  },
  {
    name: 'Safety & Trust',
    href: '/tutor/safety',
    icon: Shield,
    description: 'Guidelines and support'
  }
];

console.log('🟢 [TutorLayout] navigationItems:', navigationItems.map(i => i.name))

export default function TutorLayout({ children }: TutorLayoutProps) {
  const { user } = useAuth();
  const { roles } = useRoles();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isTutor = roles.includes('tutor');

  useEffect(() => {
    if (user && isTutor) {
      fetchTutorProfile();
    } else {
      setLoading(false);
    }
  }, [user, isTutor]);

  const fetchTutorProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/tutor/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const { profile } = await response.json();
        setTutorProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching tutor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isActivePage = (href: string) => {
    if (href === '/tutor') {
      return pathname === '/tutor';
    }
    return pathname.startsWith(href);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary"></div>
      </div>
    );
  }

  // Show access denied if not a tutor
  if (!isTutor) {
    return (
      <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
        <div className="text-center">
          <Text variant="h1" as="h1" className="mb-4 text-token-error">
            Access Denied
          </Text>
          <Text variant="body" className="text-token-text-secondary mb-6">
            You need to be an approved tutor to access this dashboard.
          </Text>
          <Link href="/tutor-application">
            <Button variant="primary">
              Apply to Become a Tutor
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-token-surface-subtle">
      {/* Timezone Warning Banner */}
      {tutorProfile && !tutorProfile.timezone_confirmed && tutorProfile.ip_timezone && 
       tutorProfile.ip_timezone !== tutorProfile.timezone && (
        <div className="bg-token-warning-light border-b border-token-warning">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-token-warning mr-2" />
                <Text variant="small" className="text-token-warning">
                  Your timezone appears to be {tutorProfile.ip_timezone}, but your profile shows {tutorProfile.timezone}. 
                  <Link href="/tutor/settings" className="underline ml-1">
                    Update your timezone
                  </Link>
                </Text>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // API call to dismiss timezone warning
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-token-surface border-r border-token">
          {/* Logo */}
          <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-token">
            <Link href="/tutor" className="flex items-center">
              <Text variant="h3" className="text-token-primary font-bold">
                Xpeak Tutor
              </Text>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePage(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-token-primary text-white'
                      : 'text-token-text-secondary hover:bg-token-surface-subtle hover:text-token-text-primary'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive ? 'text-white' : 'text-token-text-muted'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 border-t border-token p-4">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="group block w-full rounded-md p-2 text-left text-sm hover:bg-token-surface-subtle"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {tutorProfile?.profile_image_url ? (
                      <Image
                        src={tutorProfile.profile_image_url}
                        alt={tutorProfile.display_name}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-token-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <Text variant="small" className="font-medium text-token-text-primary">
                      {tutorProfile?.display_name || 'Tutor'}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary">
                      {tutorProfile?.timezone || 'UTC'}
                    </Text>
                  </div>
                  <ChevronDown className="h-4 w-4 text-token-text-muted" />
                </div>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-token-surface border border-token rounded-md shadow-lg">
                  <div className="py-1">
                    <Link
                      href="/tutor/settings"
                      className="block px-4 py-2 text-sm text-token-text-secondary hover:bg-token-surface-subtle"
                    >
                      Settings
                    </Link>
                    <Link
                      href="/tutor/help"
                      className="block px-4 py-2 text-sm text-token-text-secondary hover:bg-token-surface-subtle"
                    >
                      Help & Support
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-token-text-secondary hover:bg-token-surface-subtle"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-token-surface border-b border-token">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-token-text-secondary hover:bg-token-surface-subtle"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <Text variant="h3" className="text-token-primary font-bold">
            Xpeak Tutor
          </Text>
          
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 rounded-md text-token-text-secondary hover:bg-token-surface-subtle"
          >
            {tutorProfile?.profile_image_url ? (
              <Image
                src={tutorProfile.profile_image_url}
                alt={tutorProfile.display_name}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <User className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-token-surface">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-token">
                <Text variant="h3" className="text-token-primary font-bold">
                  Xpeak Tutor
                </Text>
              </div>
              
              <nav className="flex-1 space-y-1 px-2 py-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePage(item.href);
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-token-primary text-white'
                          : 'text-token-text-secondary hover:bg-token-surface-subtle hover:text-token-text-primary'
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-token-text-muted'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 