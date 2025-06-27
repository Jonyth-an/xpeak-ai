'use client';

import React from 'react';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import RequireEmailVerification from '../components/RequireEmailVerification';
import ProfileForm from './components/ProfileForm';
import PasswordChangeForm from './components/PasswordChangeForm';
import LanguagePreferences from './components/LanguagePreferences';
import LearningStats from './components/LearningStats';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header Section */}
              <div className="mb-12 text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-token-primary/10 rounded-2xl mb-6">
                  <svg className="w-8 h-8 text-token-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Profile & Settings
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                  Manage your account, preferences, and track your learning progress
                </p>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Left Column - Main Settings */}
                <div className="xl:col-span-3 space-y-8">
                  {/* Profile Information */}
                  <section>
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Account Information</h2>
                      <p className="text-gray-600">Update your personal details and account settings</p>
                    </div>
                    <ProfileForm />
                  </section>

                  {/* Security Settings */}
                  <section>
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Security</h2>
                      <p className="text-gray-600">Keep your account secure with strong passwords</p>
                    </div>
                    <PasswordChangeForm />
                  </section>

                  {/* Language Preferences */}
                  <section>
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Learning Preferences</h2>
                      <p className="text-gray-600">Choose the languages you want to learn and practice</p>
                    </div>
                    <LanguagePreferences />
                  </section>
                </div>

                {/* Right Column - Stats & Progress */}
                <div className="xl:col-span-1">
                  <div className="sticky top-8">
                    <section>
                      <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Progress</h2>
                        <p className="text-gray-600">Track your learning journey</p>
                      </div>
                      <LearningStats />
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 