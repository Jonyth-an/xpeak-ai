'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { useAuth } from '@/lib/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';
import { createClient } from '@supabase/supabase-js';
import { Card, Button, Text, Input } from '@/app/components/ui';
import Link from 'next/link';
import AdminLayout from '../AdminLayout';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UsageData {
  user_email: string;
  feature: string;
  usage_count: number;
  last_used: string;
  created_at: string;
}

interface StorageUsage {
  user_email: string;
  storage_used: number;
  file_count: number;
  last_updated: string;
}

export default function UsageTrackingPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [storageData, setStorageData] = useState<StorageUsage[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('all');

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
        await loadUsageData();
        await loadStorageData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUsageData = async () => {
    try {
      const response = await fetch(`/api/admin/usage?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsageData(data.usage || []);
      }
    } catch (error) {
      console.error('Error loading usage data:', error);
    }
  };

  const loadStorageData = async () => {
    try {
      const response = await fetch('/api/admin/storage-usage', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStorageData(data.storage || []);
      }
    } catch (error) {
      console.error('Error loading storage data:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsageData();
    }
  }, [selectedPeriod, isAdmin]);

  const filteredUsageData = usageData.filter(usage => {
    const matchesSearch = usage.user_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFeature = selectedFeature === 'all' || usage.feature === selectedFeature;
    return matchesSearch && matchesFeature;
  });

  const getTotalUsage = () => {
    return filteredUsageData.reduce((total, usage) => total + usage.usage_count, 0);
  };

  const getTopUsers = () => {
    const userTotals = filteredUsageData.reduce((acc, usage) => {
      acc[usage.user_email] = (acc[usage.user_email] || 0) + usage.usage_count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(userTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  };

  const getTopFeatures = () => {
    const featureTotals = filteredUsageData.reduce((acc, usage) => {
      acc[usage.feature] = (acc[usage.feature] || 0) + usage.usage_count;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(featureTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getTotalStorage = () => {
    return storageData.reduce((total, storage) => total + storage.storage_used, 0);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-red-600">
              Access Denied
            </Text>
            <Text variant="body" className="text-gray-600 mb-6">
              You don't have permission to access the admin dashboard.
            </Text>
            <Link href="/dashboard">
              <Button variant="primary">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h1" as="h1" className="mb-2">
                  Usage Tracking
                </Text>
                <Text variant="lead" className="text-gray-600">
                  Monitor API calls, storage usage, and feature utilization per user
                </Text>
              </div>
              <Link href="/admin/dashboard">
                <Button variant="secondary">
                  ← Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Period Selector */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Text variant="body" className="font-medium">Time Period:</Text>
              <div className="flex gap-2">
                {['7d', '30d', '90d', '1y'].map((period) => (
                  <Button
                    key={period}
                    variant={selectedPeriod === period ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="text-center">
                <Text variant="h3" as="h3" className="text-2xl font-bold text-blue-600">
                  {getTotalUsage().toLocaleString()}
                </Text>
                <Text variant="small" className="text-gray-600">Total API Calls</Text>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <Text variant="h3" as="h3" className="text-2xl font-bold text-green-600">
                  {filteredUsageData.length > 0 ? 
                    (getTotalUsage() / filteredUsageData.length).toFixed(1) : '0'
                  }
                </Text>
                <Text variant="small" className="text-gray-600">Avg Calls per User</Text>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <Text variant="h3" as="h3" className="text-2xl font-bold text-purple-600">
                  {(getTotalStorage() / (1024 * 1024)).toFixed(2)}
                </Text>
                <Text variant="small" className="text-gray-600">Total Storage (MB)</Text>
              </div>
            </Card>
            <Card className="p-6">
              <div className="text-center">
                <Text variant="h3" as="h3" className="text-2xl font-bold text-orange-600">
                  {new Set(filteredUsageData.map(u => u.user_email)).size}
                </Text>
                <Text variant="small" className="text-gray-600">Active Users</Text>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search by user email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Features</option>
                <option value="ai_topics">AI Topics</option>
                <option value="word_maze">Word Maze</option>
                <option value="tutor_matching">Tutor Matching</option>
                <option value="billing">Billing</option>
                <option value="profile">Profile</option>
              </select>
            </div>
          </Card>

          {/* Top Users and Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Users */}
            <Card className="p-6">
              <Text variant="h3" as="h3" className="mb-4">Top Users by Usage</Text>
              <div className="space-y-3">
                {getTopUsers().map(([email, count], index) => (
                  <div key={email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Text variant="small" className="font-bold text-blue-600">
                          {index + 1}
                        </Text>
                      </div>
                      <div>
                        <Text variant="body" className="font-medium">{email}</Text>
                        <Text variant="small" className="text-gray-500">{count} calls</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Features */}
            <Card className="p-6">
              <Text variant="h3" as="h3" className="mb-4">Most Used Features</Text>
              <div className="space-y-3">
                {getTopFeatures().map(([feature, count], index) => (
                  <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Text variant="small" className="font-bold text-green-600">
                          {index + 1}
                        </Text>
                      </div>
                      <div>
                        <Text variant="body" className="font-medium capitalize">
                          {feature.replace('_', ' ')}
                        </Text>
                        <Text variant="small" className="text-gray-500">{count} calls</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Detailed Usage Table */}
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <Text variant="h3" as="h3">Detailed Usage Data</Text>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Used
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsageData.slice(0, 20).map((usage, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Text variant="body" className="text-gray-900">{usage.user_email}</Text>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {usage.feature.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {usage.usage_count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(usage.last_used).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsageData.length === 0 && (
              <div className="text-center py-8">
                <Text variant="body" className="text-gray-500">No usage data found for the selected criteria.</Text>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 