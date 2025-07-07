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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setError('Failed to verify admin access');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setRefreshing(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    // Debounce the API call to avoid excessive requests
    setTimeout(() => loadAnalytics(), 100);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary mx-auto mb-token-4"></div>
            <Text variant="body" className="text-token-secondary">
              Loading analytics dashboard...
            </Text>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-token-error-light rounded-full flex items-center justify-center mx-auto mb-token-6">
              <svg className="w-8 h-8 text-token-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <Text variant="h1" as="h1" className="mb-token-4 text-token-error">
              Access Denied
            </Text>
            <Text variant="body" className="text-token-secondary mb-token-8">
              You don't have permission to access the admin analytics.
            </Text>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-token-4 sm:px-token-6 lg:px-token-8 py-token-8">
          {/* Header */}
          <div className="mb-token-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-token-6">
              <div>
                <Text variant="h1" as="h1" className="mb-token-2 text-token-primary">
                  Analytics Dashboard
                </Text>
                <Text variant="lead" className="text-token-secondary">
                  Comprehensive insights into your application's performance
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-token-4">
                <select 
                  value={period} 
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="border border-token-border bg-token-surface text-token-primary rounded-token-lg px-token-4 py-token-2 focus:outline-none focus:ring-2 focus:ring-token-primary focus:border-transparent transition-all duration-token-base"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <Button 
                  variant="primary" 
                  onClick={loadAnalytics}
                  disabled={refreshing}
                  className="flex items-center gap-token-2"
                >
                  {refreshing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="mb-token-6 p-token-6 bg-token-error-light border-token-error">
              <div className="flex items-center gap-token-3">
                <svg className="w-5 h-5 text-token-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <Text variant="body" className="text-token-error">
                  {error}
                </Text>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  Dismiss
                </Button>
              </div>
            </Card>
          )}

          {analytics ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-token-6 mb-token-8">
                <Card className="p-token-6 bg-token-surface border-token-border hover:shadow-token-lg transition-all duration-token-base">
                  <div className="flex items-center justify-between">
                    <div className="space-y-token-2">
                      <Text variant="small" className="text-token-secondary font-medium">Total Users</Text>
                      <Text variant="h3" as="h3" className="text-token-3xl font-bold text-token-primary">
                        {analytics.users.total.toLocaleString()}
                      </Text>
                      <Text variant="small" className="text-token-success font-medium">
                        +{analytics.users.newThisMonth} this month
                      </Text>
                    </div>
                    <div className="w-14 h-14 bg-token-accent-light rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-token-6 bg-token-surface border-token-border hover:shadow-token-lg transition-all duration-token-base">
                  <div className="flex items-center justify-between">
                    <div className="space-y-token-2">
                      <Text variant="small" className="text-token-secondary font-medium">Active Subscriptions</Text>
                      <Text variant="h3" as="h3" className="text-token-3xl font-bold text-token-primary">
                        {analytics.subscriptions.active.toLocaleString()}
                      </Text>
                      <Text variant="small" className="text-token-secondary font-medium">
                        {((analytics.subscriptions.active / analytics.subscriptions.total) * 100).toFixed(1)}% retention
                      </Text>
                    </div>
                    <div className="w-14 h-14 bg-token-success-light rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-token-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-token-6 bg-token-surface border-token-border hover:shadow-token-lg transition-all duration-token-base">
                  <div className="flex items-center justify-between">
                    <div className="space-y-token-2">
                      <Text variant="small" className="text-token-secondary font-medium">Total Revenue</Text>
                      <Text variant="h3" as="h3" className="text-token-3xl font-bold text-token-primary">
                        ${(analytics.revenue.total / 100).toFixed(2)}
                      </Text>
                      <Text variant="small" className="text-token-success font-medium">
                        +{analytics.revenue.growth}% growth
                      </Text>
                    </div>
                    <div className="w-14 h-14 bg-token-info-light rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-token-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="p-token-6 bg-token-surface border-token-border hover:shadow-token-lg transition-all duration-token-base">
                  <div className="flex items-center justify-between">
                    <div className="space-y-token-2">
                      <Text variant="small" className="text-token-secondary font-medium">Monthly Revenue</Text>
                      <Text variant="h3" as="h3" className="text-token-3xl font-bold text-token-primary">
                        ${(analytics.revenue.monthly / 100).toFixed(2)}
                      </Text>
                      <Text variant="small" className="text-token-secondary font-medium">
                        Current month
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

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-token-6 mb-token-8">
                <Card className="p-token-6 bg-token-surface border-token-border">
                  <div className="flex items-center justify-between mb-token-4">
                    <Text variant="h3" as="h3" className="text-token-primary">Revenue Trend</Text>
                    <Button variant="outline" size="sm">
                      <svg className="w-4 h-4 mr-token-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Export
                    </Button>
                  </div>
                  <div className="h-64 bg-token-surface-subtle rounded-token-lg flex items-center justify-center border border-token-border">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-token-muted mx-auto mb-token-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <Text variant="body" className="text-token-muted">
                        Chart component would go here
                      </Text>
                    </div>
                  </div>
                </Card>

                <Card className="p-token-6 bg-token-surface border-token-border">
                  <div className="flex items-center justify-between mb-token-4">
                    <Text variant="h3" as="h3" className="text-token-primary">User Growth</Text>
                    <Button variant="outline" size="sm">
                      <svg className="w-4 h-4 mr-token-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Export
                    </Button>
                  </div>
                  <div className="h-64 bg-token-surface-subtle rounded-token-lg flex items-center justify-center border border-token-border">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-token-muted mx-auto mb-token-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <Text variant="body" className="text-token-muted">
                        Chart component would go here
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Additional Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-token-6">
                <Card className="p-token-6 bg-token-surface border-token-border">
                  <div className="flex items-center justify-between mb-token-4">
                    <Text variant="h3" as="h3" className="text-token-primary">Subscription Status</Text>
                    <div className="w-8 h-8 bg-token-primary-light rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-token-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-token-4">
                    <div className="flex justify-between items-center py-token-2 border-b border-token-border">
                      <Text variant="body" className="text-token-secondary">Active</Text>
                      <Text variant="body" className="font-semibold text-token-primary">{analytics.subscriptions.active}</Text>
                    </div>
                    <div className="flex justify-between items-center py-token-2 border-b border-token-border">
                      <Text variant="body" className="text-token-secondary">Cancelled</Text>
                      <Text variant="body" className="font-semibold text-token-primary">{analytics.subscriptions.cancelled}</Text>
                    </div>
                    <div className="flex justify-between items-center py-token-2">
                      <Text variant="body" className="text-token-secondary">Total</Text>
                      <Text variant="body" className="font-semibold text-token-primary">{analytics.subscriptions.total}</Text>
                    </div>
                  </div>
                </Card>

                <Card className="p-token-6 bg-token-surface border-token-border">
                  <div className="flex items-center justify-between mb-token-4">
                    <Text variant="h3" as="h3" className="text-token-primary">User Activity</Text>
                    <div className="w-8 h-8 bg-token-accent-light rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-token-4">
                    <div className="flex justify-between items-center py-token-2 border-b border-token-border">
                      <Text variant="body" className="text-token-secondary">Active Users</Text>
                      <Text variant="body" className="font-semibold text-token-primary">{analytics.users.active}</Text>
                    </div>
                    <div className="flex justify-between items-center py-token-2 border-b border-token-border">
                      <Text variant="body" className="text-token-secondary">New This Month</Text>
                      <Text variant="body" className="font-semibold text-token-primary">{analytics.users.newThisMonth}</Text>
                    </div>
                    <div className="flex justify-between items-center py-token-2">
                      <Text variant="body" className="text-token-secondary">Total Users</Text>
                      <Text variant="body" className="font-semibold text-token-primary">{analytics.users.total}</Text>
                    </div>
                  </div>
                </Card>

                <Card className="p-token-6 bg-token-surface border-token-border">
                  <div className="flex items-center justify-between mb-token-4">
                    <Text variant="h3" as="h3" className="text-token-primary">Revenue Metrics</Text>
                    <div className="w-8 h-8 bg-token-info-light rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-token-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-token-4">
                    <div className="flex justify-between items-center py-token-2 border-b border-token-border">
                      <Text variant="body" className="text-token-secondary">Total Revenue</Text>
                      <Text variant="body" className="font-semibold text-token-primary">${(analytics.revenue.total / 100).toFixed(2)}</Text>
                    </div>
                    <div className="flex justify-between items-center py-token-2 border-b border-token-border">
                      <Text variant="body" className="text-token-secondary">Monthly Revenue</Text>
                      <Text variant="body" className="font-semibold text-token-primary">${(analytics.revenue.monthly / 100).toFixed(2)}</Text>
                    </div>
                    <div className="flex justify-between items-center py-token-2">
                      <Text variant="body" className="text-token-secondary">Growth Rate</Text>
                      <Text variant="body" className="font-semibold text-token-success">+{analytics.revenue.growth}%</Text>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <Card className="p-token-8 bg-token-surface border-token-border">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-token-primary mx-auto mb-token-4"></div>
                <Text variant="body" className="text-token-muted">
                  Loading analytics data...
                </Text>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} }