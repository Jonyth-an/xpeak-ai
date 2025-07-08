import React from 'react';
import Layout from '../../../components/Layout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import RequireEmailVerification from '../../components/RequireEmailVerification';
import ProfileSidebar from '../components/ProfileSidebar';
import ThemePickerClient from './ThemePickerClient';

export default function ThemePickerPage() {
  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-token-surface-accent-light min-h-screen">
            <div className="max-w-7xl mx-auto">
              <div className="relative lg:flex lg:min-h-[600px]">
                {/* Sidebar */}
                <div className="hidden lg:block lg:w-40 lg:shrink-0">
                  <div className="sticky top-24">
                    <ProfileSidebar activeTab="theme" />
                  </div>
                </div>
                {/* Main Content */}
                <div className="lg:ml-40 flex-1">
                  <ThemePickerClient />
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 