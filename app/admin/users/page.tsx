'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, Button, Text, Input } from '@/app/components/ui';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
}

interface UserSubscription {
  user_email: string;
  status: string;
  stripe_subscription_id: string;
  created_at: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 20;

  useEffect(() => {
    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        await loadUsers();
        await loadSubscriptions();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalUsers(data.total || 0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSubscriptions(data);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const getSubscriptionStatus = (userEmail: string) => {
    const userSub = subscriptions.find(sub => sub.user_email === userEmail);
    return userSub ? userSub.status : 'none';
  };

  const getSubscriptionId = (userEmail: string) => {
    const userSub = subscriptions.find(sub => sub.user_email === userEmail);
    return userSub ? userSub.stripe_subscription_id : null;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'verified' && user.email_confirmed_at) ||
      (filterStatus === 'unverified' && !user.email_confirmed_at) ||
      (filterStatus === 'active' && user.last_sign_in_at) ||
      (filterStatus === 'inactive' && !user.last_sign_in_at);
    
    return matchesSearch && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
            <Text variant="body" className="text-token-secondary mb-6">
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
                  User Management
                </Text>
                <Text variant="lead" className="text-token-secondary">
                  Manage user accounts, view profiles, and handle support requests
                </Text>
              </div>
              <Link href="/admin/dashboard">
                <Button variant="secondary">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-token-surface token-border-primary border">
              <div className="text-center">
                <Text variant="h3" as="h3" className="text-2xl font-bold token-text-primary">
                  {totalUsers.toLocaleString()}
                </Text>
                <Text variant="small" className="token-text-secondary">Total Users</Text>
              </div>
            </Card>
            <Card className="p-6 bg-token-surface token-border-primary border">
              <div className="text-center">
                <Text variant="h3" as="h3" className="text-2xl font-bold token-text-success">
                  {users.filter(u => u.email_confirmed_at).length.toLocaleString()}
                </Text>
                <Text variant="small" className="token-text-secondary">Verified Users</Text>
              </div>
            </Card>
            <Card className="p-6 bg-token-surface token-border-primary border">
              <div className="text-center">
                <Text variant="h3" as="h3" className="text-2xl font-bold token-text-info">
                  {users.filter(u => u.last_sign_in_at).length.toLocaleString()}
                </Text>
                <Text variant="small" className="token-text-secondary">Active Users</Text>
              </div>
            </Card>
            <Card className="p-6 bg-token-surface token-border-primary border">
              <div className="text-center">
                <Text variant="h3" as="h3" className="text-2xl font-bold token-text-accent">
                  {subscriptions.filter(s => s.status === 'active').length.toLocaleString()}
                </Text>
                <Text variant="small" className="token-text-secondary">Active Subscriptions</Text>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8 bg-token-surface token-border-primary border">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border token-border-primary rounded-md focus:ring-2 focus:ring-token-primary focus:border-token-primary bg-token-surface token-text-primary"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="overflow-hidden bg-token-surface token-border-primary border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-token-border-primary">
                <thead className="bg-token-surface-subtle">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      Last Sign In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-token-surface divide-y divide-token-border-primary">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-token-surface-subtle">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium token-text-primary">
                            {user.email}
                          </div>
                          <div className="text-sm token-text-muted">
                            ID: {user.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.email_confirmed_at 
                              ? 'bg-token-success-light token-text-success' 
                              : 'bg-token-warning-light token-text-warning'
                          }`}>
                            {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.last_sign_in_at 
                              ? 'bg-token-info-light token-text-info' 
                              : 'bg-token-surface-subtle token-text-muted'
                          }`}>
                            {user.last_sign_in_at ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm token-text-primary">
                          {getSubscriptionStatus(user.email)}
                        </div>
                        {getSubscriptionId(user.email) && (
                          <div className="text-xs token-text-muted">
                            {getSubscriptionId(user.email)?.slice(-8)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm token-text-muted">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm token-text-muted">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="secondary" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-token-surface px-4 py-3 flex items-center justify-between border-t token-border-primary sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <Text variant="small" className="token-text-secondary">
                      Showing{' '}
                      <span className="font-medium token-text-primary">{(currentPage - 1) * usersPerPage + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium token-text-primary">
                        {Math.min(currentPage * usersPerPage, filteredUsers.length)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium token-text-primary">{filteredUsers.length}</span>
                      {' '}results
                    </Text>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 