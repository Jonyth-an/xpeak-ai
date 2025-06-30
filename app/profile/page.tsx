'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import RequireEmailVerification from '../components/RequireEmailVerification';
import { Card, Text } from '@/app/components/ui';
import ProfileForm from './components/ProfileForm';
import PasswordChangeForm from './components/PasswordChangeForm';
import LanguagePreferences from './components/LanguagePreferences';
import TimezonePreferences from './components/TimezonePreferences';
import AvatarUpload from './components/AvatarUpload';
import ProfileSidebar from './components/ProfileSidebar';
import { useAuth } from '@/lib/AuthContext';
import BillingSection from './components/BillingSection';

export default function ProfilePage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarUpdated, setAvatarUpdated] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'billing', label: 'Billing', icon: '💳' },
  ];

  // Handle URL query parameter for tab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabs.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Update URL without page reload
    const newUrl = tabId === 'profile' ? '/profile' : `/profile?tab=${tabId}`;
    router.replace(newUrl, { scroll: false });
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    setAvatarUpdated(true);
    // Reset the flag after a short delay
    setTimeout(() => setAvatarUpdated(false), 2000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            {/* Avatar Section */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <Text variant="h3" as="h3" className="mb-2">
                  Profile Photo
                </Text>
                <Text variant="body" className="text-gray-600">
                  Upload a photo to personalize your profile
                </Text>
              </div>
              
              <AvatarUpload 
                onAvatarUpdate={handleAvatarUpdate}
                className="max-w-md mx-auto"
              />
              
              {avatarUpdated && (
                <div className="mt-4 text-center">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    ✅ Avatar updated successfully!
                  </div>
                </div>
              )}
            </Card>

            {/* Profile Form */}
            <Card className="p-6">
              <div className="mb-6">
                <Text variant="h3" as="h3" className="mb-2">
                  Personal Information
                </Text>
                <Text variant="body" className="text-gray-600">
                  Update your personal details and contact information
                </Text>
              </div>
              <ProfileForm />
            </Card>
          </div>
        );

      case 'security':
        return (
          <Card className="p-6">
            <div className="mb-6">
              <Text variant="h3" as="h3" className="mb-2">
                Security Settings
              </Text>
              <Text variant="body" className="text-gray-600">
                Manage your password and account security
              </Text>
            </div>
            <PasswordChangeForm />
          </Card>
        );

      case 'preferences':
        return (
          <div className="space-y-8">
            {/* Language Preferences */}
            <Card className="p-6">
              <div className="mb-6">
                <Text variant="h3" as="h3" className="mb-2">
                  Language Preferences
                </Text>
                <Text variant="body" className="text-gray-600">
                  Choose your preferred languages for learning
                </Text>
              </div>
              <LanguagePreferences />
            </Card>

            {/* Timezone Preferences */}
            <Card className="p-6">
              <div className="mb-6">
                <Text variant="h3" as="h3" className="mb-2">
                  Current Region & Time
                </Text>
                <Text variant="body" className="text-gray-600">
                  Set your timezone to help us schedule lessons at the right time
                </Text>
              </div>
              <TimezonePreferences />
            </Card>
          </div>
        );

      case 'billing':
        return <BillingSection />;

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
              {/* Main Content with Sidebar - Use flex for large screens */}
              <div className="relative lg:flex lg:min-h-[600px]">
                {/* Sidebar */}
                <div className="hidden lg:block lg:w-64 lg:shrink-0">
                  <div className="sticky top-24">
                    <ProfileSidebar 
                      activeTab={activeTab}
                      onTabChange={handleTabChange}
                    />
                  </div>
                </div>
                {/* Main Content */}
                <div className="lg:ml-64 flex-1">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 