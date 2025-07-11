'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, Button, Text } from '@/app/components/ui';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyGrowth: number;
  tutorApplications: {
    total: number;
    pending: number;
    reviewing: number;
    approved: number;
    rejected: number;
    waitlist: number;
  };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { roles } = useRoles();
  console.log('AdminDashboardPage roles:', roles); // Debug log
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, roles]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Use client-side admin check
      const adminStatus = roles.includes('admin');
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
          monthlyGrowth: 0, // Calculate from data
          tutorApplications: {
            total: data.tutorApplications?.total || 0,
            pending: data.tutorApplications?.pending || 0,
            reviewing: data.tutorApplications?.reviewing || 0,
            approved: data.tutorApplications?.approved || 0,
            rejected: data.tutorApplications?.rejected || 0,
            waitlist: data.tutorApplications?.waitlist || 0,
          }
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
              You don&apos;t have permission to access the admin dashboard.
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

          {/* Tutor Applications Section */}
          {stats && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Text variant="h2" as="h2" className="text-token-primary">
                    Tutor Applications
                  </Text>
                  <Text variant="body" className="text-token-text-secondary">
                    Review and manage tutor applications
                  </Text>
                </div>
                <Link href="/admin/tutor-applications">
                  <Button variant="primary">
                    View All Applications
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="p-4 bg-token-surface border border-token">
                  <div className="text-center">
                    <Text variant="h4" as="h4" className="text-2xl font-bold text-token-primary">
                      {stats.tutorApplications.total}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary">Total</Text>
                  </div>
                </Card>
                
                <Card className="p-4 bg-token-surface border border-token">
                  <div className="text-center">
                    <Text variant="h4" as="h4" className="text-2xl font-bold text-token-warning">
                      {stats.tutorApplications.pending}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary">Pending</Text>
                  </div>
                </Card>
                
                <Card className="p-4 bg-token-surface border border-token">
                  <div className="text-center">
                    <Text variant="h4" as="h4" className="text-2xl font-bold text-token-info">
                      {stats.tutorApplications.reviewing}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary">Reviewing</Text>
                  </div>
                </Card>
                
                <Card className="p-4 bg-token-surface border border-token">
                  <div className="text-center">
                    <Text variant="h4" as="h4" className="text-2xl font-bold text-token-success">
                      {stats.tutorApplications.approved}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary">Approved</Text>
                  </div>
                </Card>
                
                <Card className="p-4 bg-token-surface border border-token">
                  <div className="text-center">
                    <Text variant="h4" as="h4" className="text-2xl font-bold text-token-error">
                      {stats.tutorApplications.rejected}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary">Rejected</Text>
                  </div>
                </Card>
                
                <Card className="p-4 bg-token-surface border border-token">
                  <div className="text-center">
                    <Text variant="h4" as="h4" className="text-2xl font-bold text-token-accent">
                      {stats.tutorApplications.waitlist}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary">Waitlist</Text>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Admin Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Analytics */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-token-primary-light rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-token-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <Text variant="h3" as="h3" className="text-token-primary">Analytics</Text>
                  <Text variant="small" className="text-token-text-secondary">View detailed analytics</Text>
                </div>
              </div>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full">
                  View Analytics
                </Button>
              </Link>
            </Card>

            {/* User Management */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-token-success-light rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-token-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <Text variant="h3" as="h3" className="text-token-primary">Users</Text>
                  <Text variant="small" className="text-token-text-secondary">Manage user accounts</Text>
                </div>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full">
                  Manage Users
                </Button>
              </Link>
            </Card>

            {/* Tutor Applications */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-token-accent-light rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-token-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <Text variant="h3" as="h3" className="text-token-primary">Tutor Applications</Text>
                  <Text variant="small" className="text-token-text-secondary">Review applications</Text>
                </div>
              </div>
              <Link href="/admin/tutor-applications">
                <Button variant="outline" className="w-full">
                  Review Applications
                </Button>
              </Link>
            </Card>

            {/* Health Monitoring */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-token-info-light rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-token-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <Text variant="h3" as="h3" className="text-token-primary">Health</Text>
                  <Text variant="small" className="text-token-text-secondary">System health status</Text>
                </div>
              </div>
              <Link href="/admin/health">
                <Button variant="outline" className="w-full">
                  View Health
                </Button>
              </Link>
            </Card>

            {/* Audit Trail */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-token-warning-light rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-token-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <Text variant="h3" as="h3" className="text-token-primary">Audit Trail</Text>
                  <Text variant="small" className="text-token-text-secondary">Activity logs</Text>
                </div>
              </div>
              <Link href="/admin/audit-trail">
                <Button variant="outline" className="w-full">
                  View Logs
                </Button>
              </Link>
            </Card>

            {/* Usage */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-token-error-light rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-token-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <Text variant="h3" as="h3" className="text-token-primary">Usage</Text>
                  <Text variant="small" className="text-token-text-secondary">Resource usage</Text>
                </div>
              </div>
              <Link href="/admin/usage">
                <Button variant="outline" className="w-full">
                  View Usage
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 