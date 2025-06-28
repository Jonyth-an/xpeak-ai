'use client';

import React, { useState } from 'react';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import RequireEmailVerification from '../components/RequireEmailVerification';
import { Card, Text } from '@/app/components/ui';
import ProfileForm from './components/ProfileForm';
import PasswordChangeForm from './components/PasswordChangeForm';
import LanguagePreferences from './components/LanguagePreferences';
import TimezonePreferences from './components/TimezonePreferences';
import AvatarUpload from './components/AvatarUpload';
import { useAuth } from '@/lib/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarUpdated, setAvatarUpdated] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

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

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <Text variant="h1" as="h1" className="mb-4">
                  Profile & Settings
                </Text>
                <Text variant="lead" className="text-gray-600">
                  Manage your account and preferences
                </Text>
              </div>

              {/* Tab Navigation */}
              <div className="mb-8">
                <div className="flex flex-wrap justify-center gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
                        ${activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }
                      `}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[600px]">
                {renderTabContent()}
              </div>
            </div>
          </section>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 