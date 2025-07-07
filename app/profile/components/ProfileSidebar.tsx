'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, Text, Button } from '@/app/components/ui';
import { 
  User, 
  Shield, 
  Settings, 
  CreditCard, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange?: (tabId: string) => void; // Make optional for new routing
  userEmail?: string;MakeoptionalfornewroutinguserEmail?
}

const tabs = [
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: User,
    description: 'Personal information and avatar',
    href: '/profile'
  },
  { 
    id: 'security', 
    label: 'Security', 
    icon: Shield,
    description: 'Password and account security',
    href: '/profile/security'
  },
  { 
    id: 'preferences', 
    label: 'Preferences', 
    icon: Settings,
    description: 'Language and timezone settings',
    href: '/profile/preferences'
  },
  { 
    id: 'billing', 
    label: 'Billing', 
    icon: CreditCard,
    description: 'Subscription and payment history',
    href: '/profile/billing'
  },
];

export default function ProfileSidebar({ 
  activeTab, 
  onTabChange, 
  userEmail 
}: ProfileSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  const sidebarContent = (
    <Card className="p-6 h-fit">
      {/* User Info */}
      <div className="mb-8 pb-6 border-b border-token-border">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-token-primary-surface rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-token-primary" />
          </div>
          <div>
            <Text variant="h4" as="h4" className="font-semibold">
              Account Settings
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
      <nav className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (pathname === '/profile' && tab.id === 'profile');
          
          const TabContent = (
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
                    {tab.label}
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
          );

          return (
            <Link key={tab.id} href={tab.href} onClick={() => handleTabClick(tab.id)}>
              {TabContent}
            </Link>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="mt-8 pt-6 border-t border-token-border">
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
              <User className="w-4 h-4 text-token-primary" />
            </span>
            <span className="text-left">
              <Text variant="body" className="font-medium text-text-secondary">
                {tabs.find(tab => pathname === tab.href || (pathname === '/profile' && tab.id === 'profile'))?.label || 'Account Settings'}
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