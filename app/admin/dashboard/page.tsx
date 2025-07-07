'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, Button, Text } from '@/app/components/ui';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Use client-side admin check
      const adminStatus = isAdminEmail(user.email);
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        // Load admin stats
        await loadAdminStats();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/analytics?period=30d', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.users?.total || 0,
          activeSubscriptions: data.subscriptions?.active || 0,
          totalRevenue: data.revenue?.total || 0,
          monthlyGrowth: 0 // Calculate from data
        });
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-token-error">
              Access Denied
            </Text>
            <Text variant="body" className="text-token-text-secondary mb-6">
              You don't have permission to access the admin dashboard.
            </Text>
            <Link href="/dashboard">
              <Button variant="primary">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h1" as="h1" className="mb-2 text-token-primary">
                  Admin Dashboard
                </Text>
                <Text variant="lead" className="text-token-text-secondary">
                  Manage your application, monitor performance, and view analytics
                </Text>
              </div>
              <div className="text-sm text-token-text-muted">
                Logged in as: {user?.email}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Total Users</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-primary">
                      {stats.totalUsers.toLocaleString()}
                    </Text>
                  </div>
                  <div className="w-14 h-14 bg-token-accent-light rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Active Subscriptions</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-primary">
                      {stats.activeSubscriptions.toLocaleString()}
                    </Text>
                  </div>
                  <div className="w-14 h-14 bg-token-success-light rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-token-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Total Revenue</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-primary">
                      ${(stats.totalRevenue / 100).toFixed(2)}
                    </Text>
                  </div>
                  <div className="w-14 h-14 bg-token-info-light rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-token-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Monthly Growth</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-primary">
                      {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
                    </Text>
                  </div>
                  <div className="w-14 h-14 bg-token-primary-light rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 text-token-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Admin Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Analytics */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="text-center">
                <div className="w-14 h-14 bg-token-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <Text variant="h3" as="h3" className="mb-2 text-token-primary">Analytics</Text>
                <Text variant="body" className="text-token-text-secondary mb-4">
                  Comprehensive revenue tracking, subscription statistics, and user behavior insights
                </Text>
                <Link href="/admin/analytics">
                  <div>
                    <Button variant="primary" className="w-full">
                      View Analytics
                    </Button>
                  </div>
                </Link>
              </div>
            </Card>

            {/* Email Monitoring */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="text-center">
                <div className="w-14 h-14 bg-token-info-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-token-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <Text variant="h3" as="h3" className="mb-2 text-token-primary">Email Monitoring</Text>
                <Text variant="body" className="text-token-text-secondary mb-4">
                  Track email delivery rates, open rates, and performance metrics
                </Text>
                <Link href="/admin/email-monitoring">
                  <div>
                    <Button variant="primary" className="w-full">
                      View Email Stats
                    </Button>
                  </div>
                </Link>
              </div>
            </Card>

            {/* User Management */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="text-center">
                <div className="w-14 h-14 bg-token-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-token-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <Text variant="h3" as="h3" className="mb-2 text-token-primary">User Management</Text>
                <Text variant="body" className="text-token-text-secondary mb-4">
                  Manage user accounts, view profiles, and handle support requests
                </Text>
                <Link href="/admin/users">
                  <div>
                    <Button variant="primary" className="w-full">
                      Manage Users
                    </Button>
                  </div>
                </Link>
              </div>
            </Card>

            {/* Usage Tracking */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="text-center">
                <div className="w-14 h-14 bg-token-warning-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-token-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <Text variant="h3" as="h3" className="mb-2 text-token-primary">Usage Tracking</Text>
                <Text variant="body" className="text-token-text-secondary mb-4">
                  Monitor API calls, storage usage, and feature utilization per user
                </Text>
                <Link href="/admin/usage">
                  <div>
                    <Button variant="primary" className="w-full">
                      View Usage
                    </Button>
                  </div>
                </Link>
              </div>
            </Card>

            {/* System Health */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="text-center">
                <div className="w-14 h-14 bg-token-error-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-token-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <Text variant="h3" as="h3" className="mb-2 text-token-primary">System Health</Text>
                <Text variant="body" className="text-token-text-secondary mb-4">
                  Monitor system performance, database health, and service status
                </Text>
                <Link href="/admin/health">
                  <div>
                    <Button variant="primary" className="w-full">
                      Check Health
                    </Button>
                  </div>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 