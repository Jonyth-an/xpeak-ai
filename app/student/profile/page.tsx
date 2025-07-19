'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RequireEmailVerification from '@/app/components/RequireEmailVerification';
import { Card, Text } from '@/app/components/ui';
import ProfileForm from './components/ProfileForm';
import AvatarUpload from './components/AvatarUpload';
import ProfileSidebar from './components/ProfileSidebar';
import { useAuth } from '@/lib/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [avatarUpdated, setAvatarUpdated] = useState(false);

  const hasProfilePhoto = !!user?.user_metadata?.avatar_url;

  const handleAvatarUpdate = () => {
    setAvatarUpdated(true);
    // Reset the flag after a short delay
    setTimeout(() => setAvatarUpdated(false), 2000);
  };

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
                      activeTab="profile"
                    />
                  </div>
                </div>
                {/* Main Content */}
                <div className="lg:ml-40 flex-1">
                  <div className="space-y-8">
                    {/* Avatar Section */}
                    <Card className="p-6">
                      {!hasProfilePhoto && (
                        <div className="text-center mb-6">
                          <Text variant="h3" as="h3" className="mb-2">
                            Profile Photo
                          </Text>
                          <Text variant="body" className="text-text-secondary">
                            Upload a photo to personalize your profile
                          </Text>
                        </div>
                      )}
                      <AvatarUpload 
                        onAvatarUpdate={handleAvatarUpdate}
                        className="max-w-md mx-auto"
                      />
                      
                      {avatarUpdated && (
                        <div className="mt-4 text-center">
                          <div className="bg-token-success-surface border border-token-success text-token-success px-4 py-3 rounded-lg text-sm">
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
                        <Text variant="body" className="text-text-secondary">
                          Update your personal details and contact information
                        </Text>
                      </div>
                      <ProfileForm />
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