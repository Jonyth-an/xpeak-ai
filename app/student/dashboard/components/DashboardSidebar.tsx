'use client';

import React, { useState } from 'react';
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
  BookOpen,
  DollarSign,
} from 'lucide-react';
import { MessageIcon } from '@/app/components/ui/MessageIcon'
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';

interface DashboardSidebarProps {
  userEmail?: string;
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
    id: 'messages',
    label: 'Messages',
    icon: MessageIcon,
    description: 'View and send messages',
    href: '/student/chat'
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



export default function DashboardSidebar({ userEmail }: DashboardSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { roles } = useRoles();

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