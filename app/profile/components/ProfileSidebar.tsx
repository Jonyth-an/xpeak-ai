'use client';

import React, { useState } from 'react';
import { Card, Text } from '@/app/components/ui';
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
  onTabChange: (tabId: string) => void;
  userEmail?: string;
}

const tabs = [
  { 
    id: 'profile', 
    label: 'Profile', 
    icon: User,
    description: 'Personal information and avatar'
  },
  { 
    id: 'security', 
    label: 'Security', 
    icon: Shield,
    description: 'Password and account security'
  },
  { 
    id: 'preferences', 
    label: 'Preferences', 
    icon: Settings,
    description: 'Language and timezone settings'
  },
  { 
    id: 'billing', 
    label: 'Billing', 
    icon: CreditCard,
    description: 'Subscription and payment history'
  },
];

export default function ProfileSidebar({ 
  activeTab, 
  onTabChange, 
  userEmail 
}: ProfileSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu when tab is selected
  };

  const sidebarContent = (
    <Card className="p-6 h-fit">
      {/* User Info */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <Text variant="h4" as="h4" className="font-semibold">
              Account Settings
            </Text>
            {userEmail && (
              <Text variant="body" className="text-gray-500 text-sm">
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
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                w-full flex items-center justify-between p-4 rounded-lg transition-all duration-300 ease-in-out group
                ${isActive 
                  ? 'bg-blue-50 border border-blue-200 text-blue-700 shadow-sm scale-[1.02]' 
                  : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-sm hover:scale-[1.01]'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`
                  p-2 rounded-lg transition-all duration-300 ease-in-out
                  ${isActive 
                    ? 'bg-blue-100 text-blue-600 shadow-sm' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-600 group-hover:shadow-sm'
                  }
                `}>
                  <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="text-left">
                  <Text 
                    variant="body" 
                    className={`font-medium transition-colors duration-300 ${isActive ? 'text-blue-700' : 'text-gray-700'}`}
                  >
                    {tab.label}
                  </Text>
                </div>
              </div>
              
              <ChevronRight 
                className={`
                  w-4 h-4 transition-all duration-300 ease-in-out
                  ${isActive ? 'text-blue-600 rotate-90 scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}
                `} 
              />
            </button>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <Text variant="body" className="text-sm text-gray-600 mb-2">
            Need help?
          </Text>
          <a 
            href="/community" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
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
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <Text variant="body" className="font-medium text-gray-700">
                {tabs.find(tab => tab.id === activeTab)?.label || 'Account Settings'}
              </Text>
            </div>
          </div>
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 text-gray-500" />
          ) : (
            <Menu className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mb-6">
          {sidebarContent}
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-56 lg:shrink-0">
        {sidebarContent}
      </div>
    </>
  );
} 