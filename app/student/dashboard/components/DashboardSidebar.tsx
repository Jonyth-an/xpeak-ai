'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, Text, Button } from '@/app/components/ui';
import { 
  LayoutDashboard, 
  Users, 
  Sparkles, 
  Puzzle, 
  ChevronRight,
  Menu,
  X,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';
import { supabase } from '@/lib/supabaseClient';

interface DashboardSidebarProps {
  userEmail?: string;
}

interface TutorApplication {
  id: string;
  status: 'drafting' | 'pending' | 'reviewing' | 'waitlist' | 'rejected' | 'approved';
  submitted_at?: string;
  application_data?: any;
}

const navigationItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    description: 'Your learning overview',
    href: '/student/dashboard'
  },
  { 
    id: 'lessons', 
    label: 'Lessons', 
    icon: GraduationCap,
    description: 'View lesson history',
    href: '/student/lessons'
  },
  { 
    id: 'tutors', 
    label: 'Tutors', 
    icon: BookOpen,
    description: 'Find and book tutors',
    href: '/tutors'
  },
  { 
    id: 'meet-sagea', 
    label: 'Meet Sagea', 
    icon: Users,
    description: 'Connect with AI coaches',
    href: '/meet-sagea'
  },
  { 
    id: 'topic-spark', 
    label: 'Topic Spark', 
    icon: Sparkles,
    description: 'Generate conversation topics',
    href: '/topic-spark'
  },
  { 
    id: 'word-maze', 
    label: 'Word Maze', 
    icon: Puzzle,
    description: 'Vocabulary learning game',
    href: '/word-maze'
  },
  { 
    id: 'pricing', 
    label: 'Pricing', 
    icon: DollarSign,
    description: 'View plans and pricing',
    href: '/pricing'
  },
];

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'drafting':
      return {
        icon: Clock,
        color: 'text-token-warning',
        bgColor: 'bg-token-warning-surface',
        message: 'Finish your tutor application to get started.',
        buttonText: 'Continue Application',
        buttonVariant: 'primary' as const
      };
    case 'pending':
      return {
        icon: Clock,
        color: 'text-token-info',
        bgColor: 'bg-token-info-surface',
        message: 'Your application is under review.',
        buttonText: 'View Status',
        buttonVariant: 'secondary' as const
      };
    case 'reviewing':
      return {
        icon: AlertCircle,
        color: 'text-token-warning',
        bgColor: 'bg-token-warning-surface',
        message: 'Your application is being reviewed.',
        buttonText: 'View Status',
        buttonVariant: 'secondary' as const
      };
    case 'waitlist':
      return {
        icon: Clock,
        color: 'text-token-info',
        bgColor: 'bg-token-info-surface',
        message: 'You\'re on the waitlist. We\'ll notify you soon.',
        buttonText: 'View Status',
        buttonVariant: 'secondary' as const
      };
    case 'rejected':
      return {
        icon: XCircle,
        color: 'text-token-error',
        bgColor: 'bg-token-error-surface',
        message: 'Application rejected. You may reapply later.',
        buttonText: 'Reapply',
        buttonVariant: 'primary' as const
      };
    default:
      return {
        icon: Clock,
        color: 'text-token-text-secondary',
        bgColor: 'bg-token-surface-accent-light',
        message: 'Start your tutor application.',
        buttonText: 'Apply Now',
        buttonVariant: 'primary' as const
      };
  }
};

export default function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tutorApplication, setTutorApplication] = useState<TutorApplication | null>(null);
  const [loadingApplication, setLoadingApplication] = useState(true);
  const pathname = usePathname();
  const { user } = useAuth();
  const { roles } = useRoles();

  const isApprovedTutor = roles.includes('tutor');

  useEffect(() => {
    if (user && !isApprovedTutor) {
      fetchTutorApplication();
    } else {
      setLoadingApplication(false);
    }
  }, [user, isApprovedTutor]);

  const fetchTutorApplication = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/tutor-applications', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const { application } = await response.json();
        setTutorApplication(application);
      }
    } catch (error) {
      console.error('Error fetching tutor application:', error);
    } finally {
      setLoadingApplication(false);
    }
  };

  const handleTutorApplicationClick = () => {
    // Navigate to tutor application page
    window.location.href = '/tutor-application';
  };

  const sidebarContent = (
    <Card className="p-6 h-fit rounded-xl">
      {/* User Info */}
      <div className="mb-8 pb-6 border-b border-token-border">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-token-primary-surface rounded-full flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-token-primary" />
          </div>
          <div>
            <Text variant="h4" as="h4" className="font-semibold">
              Learning Dashboard
            </Text>
            {userEmail && (
              <Text variant="body" className="text-text-muted text-sm">
                {userEmail}
              </Text>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`
                  w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 ease-in-out group
                  ${isActive 
                    ? 'bg-token-primary-surface border border-token-primary text-token-primary shadow-sm scale-[1.02]' 
                    : 'hover:bg-token-surface-accent-light text-text-secondary hover:text-text hover:shadow-sm hover:scale-[1.01]'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-2 rounded-lg transition-all duration-300 ease-in-out
                    ${isActive 
                      ? 'bg-token-primary text-white shadow-sm' 
                      : 'bg-token-surface-accent text-text-muted group-hover:bg-token-surface-accent-light group-hover:text-text-secondary group-hover:shadow-sm'
                    }
                  `}>
                    <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="text-left">
                    <Text 
                      variant="body" 
                      className={`font-medium transition-colors duration-300 ${isActive ? 'text-token-primary' : 'text-text-secondary'}`}
                    >
                      {item.label}
                    </Text>
                    <Text 
                      variant="small" 
                      className="text-text-muted text-xs"
                    >
                      {item.description}
                    </Text>
                  </div>
                </div>
                
                <ChevronRight 
                  className={`
                    w-4 h-4 transition-all duration-300 ease-in-out
                    ${isActive ? 'text-token-primary rotate-90 scale-110' : 'text-text-muted group-hover:text-text-secondary group-hover:scale-110'}
                  `} 
                />
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Tutor Application Card - Only show if user is not an approved tutor */}
      {!isApprovedTutor && (
        <div className="mb-8 pt-6 border-t border-token-border">
          <div className="bg-token-surface-accent-light rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-token-primary-surface rounded-full flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-token-primary" />
              </div>
              <Text variant="body" className="font-semibold text-text">
                Become a Tutor
              </Text>
            </div>
            
            {loadingApplication ? (
              <div className="text-sm text-text-secondary mb-3">
                Loading application status...
              </div>
            ) : tutorApplication ? (
              <>
                <div className="flex items-center space-x-2 mb-3">
                  {(() => {
                    const statusInfo = getStatusInfo(tutorApplication.status);
                    const StatusIcon = statusInfo.icon;
                    return (
                      <>
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <Text variant="small" className={`font-medium ${statusInfo.color}`}>
                          {tutorApplication.status.charAt(0).toUpperCase() + tutorApplication.status.slice(1)}
                        </Text>
                      </>
                    );
                  })()}
                </div>
                <Text variant="small" className="text-text-secondary mb-3">
                  {getStatusInfo(tutorApplication.status).message}
                </Text>
              </>
            ) : (
              <Text variant="small" className="text-text-secondary mb-3">
                Start your tutor application to help others learn.
              </Text>
            )}
            
            <Button 
              variant={tutorApplication ? getStatusInfo(tutorApplication.status).buttonVariant : 'primary'}
              size="sm"
              onClick={handleTutorApplicationClick}
              className="w-full"
            >
              {tutorApplication ? getStatusInfo(tutorApplication.status).buttonText : 'Apply Now'}
            </Button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="pt-6 border-t border-token-border">
        <div className="bg-token-surface-accent-light rounded-lg p-4">
          <Text variant="body" className="text-sm text-text-secondary mb-2">
            Need help?
          </Text>
          <a 
            href="/community" 
            className="text-token-primary hover:text-token-primary-hover text-sm font-medium transition-colors duration-200"
          >
            Visit our help center →
          </a>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden mb-6">
        <Button
          variant="outline"
          size="md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between p-4"
        >
          <span className="flex items-center space-x-3">
            <span className="w-8 h-8 bg-token-primary-surface rounded-full flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-token-primary" />
            </span>
            <span className="text-left">
              <Text variant="body" className="font-medium text-text-secondary">
                Learning Dashboard
              </Text>
            </span>
          </span>
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-text-muted" />
          ) : (
            <Menu className="w-5 h-5 text-text-muted" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mb-6">
          {sidebarContent}
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-72 lg:shrink-0">
        {sidebarContent}
      </div>
    </>
  );
} 