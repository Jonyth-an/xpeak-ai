'use client';

import React from 'react';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import RequireEmailVerification from '../../components/RequireEmailVerification';
import { Card, Text } from '@/app/components/ui';
import LanguagePreferences from '../components/LanguagePreferences';
import TimezonePreferences from '../components/TimezonePreferences';
import ProfileSidebar from '../components/ProfileSidebar';

export default function PreferencesPage() {
  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-token-surface-accent-light min-h-screen">
            <div className="max-w-7xl mx-auto">
              {/* Main Content with Sidebar - Use flex for large screens */}
              <div className="relative lg:flex lg:min-h-[600px]">
                {/* Sidebar */}
                <div className="hidden lg:block lg:w-40 lg:shrink-0">
                  <div className="sticky top-24">
                    <ProfileSidebar 
                      activeTab="preferences"
                      onTabChange={() => {}} // No-op since we're using direct routing
                    />
                  </div>
                </div>
                {/* Main Content */}
                <div className="lg:ml-40 flex-1">
                  <div className="space-y-8">
                    {/* Language Preferences */}
                    <Card className="p-6 rounded-xl">
                      <div className="mb-6">
                        <Text variant="h3" as="h3" className="mb-2">
                          Language Preferences
                        </Text>
                        <Text variant="body" className="text-token-text-secondary">
                          Choose your preferred languages for learning
                        </Text>
                      </div>
                      <LanguagePreferences />
                    </Card>

                    {/* Timezone Preferences */}
                    <Card className="p-6 rounded-xl">
                      <div className="mb-6">
                        <Text variant="h3" as="h3" className="mb-2">
                          Timezone Preferences
                        </Text>
                        <Text variant="body" className="text-token-text-secondary">
                          Set your timezone for accurate scheduling
                        </Text>
                      </div>
                      <TimezonePreferences />
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 