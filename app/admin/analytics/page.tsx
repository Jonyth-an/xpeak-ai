'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, Button, Text } from '@/app/components/ui';

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  subscriptions: {
    total: number;
    active: number;
    cancelled: number;
    revenue: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('30d');

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
      const adminStatus = isAdminEmail(user.email);
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        await loadAnalytics();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
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
            <Text variant="h1" as="h1" className="mb-4 token-text-error">
              Access Denied
            </Text>
            <Text variant="body" className="token-text-secondary mb-6">
              You don't have permission to access the admin analytics.
            </Text>
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
                <Text variant="h1" as="h1" className="mb-2 token-text-primary">
                  Analytics Dashboard
                </Text>
                <Text variant="lead" className="token-text-secondary">
                  Comprehensive insights into your application's performance
                </Text>
              </div>
              <div className="flex items-center space-x-4">
                <select 
                  value={period} 
                  onChange={(e) => {
                    setPeriod(e.target.value);
                    loadAnalytics();
                  }}
                  className="border token-border-primary rounded-md px-3 py-2 bg-token-surface token-text-primary"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <Button variant="primary" onClick={loadAnalytics}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {analytics ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-token-surface token-border-primary border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text variant="small" className="token-text-secondary">Total Users</Text>
                      <Text variant="h3" as="h3" className="text-2xl font-bold token-text-primary">
                        {analytics.users.total.toLocaleString()}
                      </Text>
                      <Text variant="small" className="token-text-success">
                        +{analytics.users.newThisMonth} this month
                      </Text>
                    </div>
                    <div className="w-14 h-14 bg-token-accent-light rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 token-text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-token-surface token-border-primary border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text variant="small" className="token-text-secondary">Active Subscriptions</Text>
                      <Text variant="h3" as="h3" className="text-2xl font-bold token-text-primary">
                        {analytics.subscriptions.active.toLocaleString()}
                      </Text>
                      <Text variant="small" className="token-text-secondary">
                        {((analytics.subscriptions.active / analytics.subscriptions.total) * 100).toFixed(1)}% retention
                      </Text>
                    </div>
                    <div className="w-14 h-14 bg-token-success-light rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 token-text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-token-surface token-border-primary border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text variant="small" className="token-text-secondary">Total Revenue</Text>
                      <Text variant="h3" as="h3" className="text-2xl font-bold token-text-primary">
                        ${(analytics.revenue.total / 100).toFixed(2)}
                      </Text>
                      <Text variant="small" className="token-text-success">
                        +{analytics.revenue.growth}% growth
                      </Text>
                    </div>
                    <div className="w-14 h-14 bg-token-info-light rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 token-text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-token-surface token-border-primary border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text variant="small" className="token-text-secondary">Monthly Revenue</Text>
                      <Text variant="h3" as="h3" className="text-2xl font-bold token-text-primary">
                        ${(analytics.revenue.monthly / 100).toFixed(2)}
                      </Text>
                      <Text variant="small" className="token-text-secondary">
                        Current month
                      </Text>
                    </div>
                    <div className="w-14 h-14 bg-token-primary-light rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 token-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 bg-token-surface token-border-primary border">
                  <Text variant="h3" as="h3" className="mb-4 token-text-primary">Revenue Trend</Text>
                  <div className="h-64 bg-token-surface-subtle rounded flex items-center justify-center">
                    <Text variant="body" className="token-text-muted">
                      Chart component would go here
                    </Text>
                  </div>
                </Card>

                <Card className="p-6 bg-token-surface token-border-primary border">
                  <Text variant="h3" as="h3" className="mb-4 token-text-primary">User Growth</Text>
                  <div className="h-64 bg-token-surface-subtle rounded flex items-center justify-center">
                    <Text variant="body" className="token-text-muted">
                      Chart component would go here
                    </Text>
                  </div>
                </Card>
              </div>

              {/* Additional Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-token-surface token-border-primary border">
                  <Text variant="h3" as="h3" className="mb-4 token-text-primary">Subscription Status</Text>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Text variant="body" className="token-text-secondary">Active</Text>
                      <Text variant="body" className="font-semibold token-text-primary">{analytics.subscriptions.active}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text variant="body" className="token-text-secondary">Cancelled</Text>
                      <Text variant="body" className="font-semibold token-text-primary">{analytics.subscriptions.cancelled}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text variant="body" className="token-text-secondary">Total</Text>
                      <Text variant="body" className="font-semibold token-text-primary">{analytics.subscriptions.total}</Text>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-token-surface token-border-primary border">
                  <Text variant="h3" as="h3" className="mb-4 token-text-primary">User Activity</Text>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Text variant="body" className="token-text-secondary">Active Users</Text>
                      <Text variant="body" className="font-semibold token-text-primary">{analytics.users.active}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text variant="body" className="token-text-secondary">New This Month</Text>
                      <Text variant="body" className="font-semibold token-text-primary">{analytics.users.newThisMonth}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text variant="body" className="token-text-secondary">Total Users</Text>
                      <Text variant="body" className="font-semibold token-text-primary">{analytics.users.total}</Text>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-token-surface token-border-primary border">
                  <Text variant="h3" as="h3" className="mb-4 token-text-primary">Revenue Metrics</Text>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Text variant="body" className="token-text-secondary">Total Revenue</Text>
                      <Text variant="body" className="font-semibold token-text-primary">${(analytics.revenue.total / 100).toFixed(2)}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text variant="body" className="token-text-secondary">Monthly Revenue</Text>
                      <Text variant="body" className="font-semibold token-text-primary">${(analytics.revenue.monthly / 100).toFixed(2)}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text variant="body" className="token-text-secondary">Growth Rate</Text>
                      <Text variant="body" className="font-semibold token-text-success">+{analytics.revenue.growth}%</Text>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-6 bg-token-surface token-border-primary border">
              <Text variant="body" className="text-center token-text-muted">
                Loading analytics data...
              </Text>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 