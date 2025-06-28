'use client';

import React from 'react';
import Layout from '../../components/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import RequireEmailVerification from '../components/RequireEmailVerification';
import LearningStats from '../profile/components/LearningStats';
import { Text } from '@/app/components/ui';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <Text variant="h1" as="h1" className="mb-4">
                  Your Learning Dashboard
                </Text>
                <Text variant="lead" className="text-gray-600">
                  Track your progress, view your achievements, and continue your language learning journey
                </Text>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-8">
                <LearningStats />
              </div>
            </div>
          </section>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 