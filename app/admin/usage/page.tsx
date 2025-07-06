'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { useAuth } from '@/lib/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, Button, Text, Input } from '@/app/components/ui';
import Link from 'next/link';
import AdminLayout from '../AdminLayout';

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

interface AIWordGenerationData {
  word_text: string;
  type: string;
  metadata: {
    generated_by?: string;
    generated_at?: string;
  };
  created_at: string;
}

interface AIWordStats {
  totalWords: number;
  aiGenerated: number;
  fallbackGenerated: number;
  aiSuccessRate: number;
  uniqueWords: number;
  uniqueTypes: number;
  averageWordsPerDay: number;
}

interface SourceBreakdown {
  [source: string]: {
    total: number;
    percentage: number;
  };
}

interface TypeBreakdown {
  [type: string]: {
    total: number;
    percentage: number;
  };
}

interface DailyTrends {
  [date: string]: {
    total: number;
    ai: number;
    fallback: number;
  };
}

export default function UsageTrackingPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [storageData, setStorageData] = useState<StorageUsage[]>([]);
  const [aiWordData, setAiWordData] = useState<AIWordGenerationData[]>([]);
  const [aiWordStats, setAiWordStats] = useState<AIWordStats | null>(null);
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown>({});
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown>({});
  const [dailyTrends, setDailyTrends] = useState<DailyTrends>({});
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('all');
  const [activeTab, setActiveTab] = useState<'general' | 'dictionary'>('general');

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
        await loadDictionaryData();
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

  const loadDictionaryData = async () => {
    try {
      const response = await fetch(`/api/admin/dictionary-usage?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAiWordData(data.data.rawData || []);
          setAiWordStats(data.data.stats || null);
          setSourceBreakdown(data.data.sourceBreakdown || {});
          setTypeBreakdown(data.data.typeBreakdown || {});
          setDailyTrends(data.data.dailyTrends || {});
        }
      }
    } catch (error) {
      console.error('Error loading AI word generation data:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsageData();
      loadDictionaryData();
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
        <div className="min-h-screen bg-token-surface flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-accent"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen bg-token-surface flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-token-error">
              Access Denied
            </Text>
            <Text variant="body" className="text-token-secondary mb-6">
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
      <div className="min-h-screen bg-token-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h1" as="h1" className="mb-2 text-token-primary">
                  Usage Tracking
                </Text>
                <Text variant="lead" className="text-token-secondary">
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
          <Card className="p-6 mb-8 bg-token-elevated border border-token">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Text variant="body" className="font-medium text-token-primary">Time Period:</Text>
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

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-token">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'general'
                      ? 'border-token-accent text-token-accent'
                      : 'border-transparent text-token-tertiary hover:text-token-primary hover:border-token'
                  }`}
                >
                  General Usage
                </button>
                <button
                  onClick={() => setActiveTab('dictionary')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dictionary'
                      ? 'border-token-accent text-token-accent'
                      : 'border-transparent text-token-tertiary hover:text-token-primary hover:border-token'
                  }`}
                >
                  AI Word Generation
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'general' && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-token-elevated border border-token">
                  <div className="text-center">
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-accent">
                      {getTotalUsage().toLocaleString()}
                    </Text>
                    <Text variant="small" className="text-token-secondary">Total API Calls</Text>
                  </div>
                </Card>
                <Card className="p-6 bg-token-elevated border border-token">
                  <div className="text-center">
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-success">
                      {filteredUsageData.length > 0 ? 
                        (getTotalUsage() / filteredUsageData.length).toFixed(1) : '0'
                      }
                    </Text>
                    <Text variant="small" className="text-token-secondary">Avg Calls per User</Text>
                  </div>
                </Card>
                <Card className="p-6 bg-token-elevated border border-token">
                  <div className="text-center">
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-info">
                      {(getTotalStorage() / (1024 * 1024)).toFixed(2)}
                    </Text>
                    <Text variant="small" className="text-token-secondary">Total Storage (MB)</Text>
                  </div>
                </Card>
                <Card className="p-6 bg-token-elevated border border-token">
                  <div className="text-center">
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-warning">
                      {new Set(filteredUsageData.map(u => u.user_email)).size}
                    </Text>
                    <Text variant="small" className="text-token-secondary">Active Users</Text>
                  </div>
                </Card>
              </div>

              {/* Filters */}
              <Card className="p-6 mb-8 bg-token-elevated border border-token">
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
                    className="px-4 py-2 border border-token rounded-md focus:ring-2 focus:ring-token-accent focus:border-token-accent bg-token-surface text-token-primary"
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
                <Card className="p-6 bg-token-elevated border border-token">
                  <Text variant="h3" as="h3" className="mb-4 text-token-primary">Top Users by Usage</Text>
                  <div className="space-y-3">
                    {getTopUsers().map(([email, count], index) => (
                      <div key={email} className="flex items-center justify-between p-3 bg-token-surface rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-token-accent/20 rounded-full flex items-center justify-center">
                            <Text variant="small" className="font-bold text-token-accent">
                              {index + 1}
                            </Text>
                          </div>
                          <div>
                            <Text variant="body" className="font-medium text-token-primary">{email}</Text>
                            <Text variant="small" className="text-token-tertiary">{count} calls</Text>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Top Features */}
                <Card className="p-6 bg-token-elevated border border-token">
                  <Text variant="h3" as="h3" className="mb-4 text-token-primary">Most Used Features</Text>
                  <div className="space-y-3">
                    {getTopFeatures().map(([feature, count], index) => (
                      <div key={feature} className="flex items-center justify-between p-3 bg-token-surface rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-token-success/20 rounded-full flex items-center justify-center">
                            <Text variant="small" className="font-bold text-token-success">
                              {index + 1}
                            </Text>
                          </div>
                          <div>
                            <Text variant="body" className="font-medium capitalize text-token-primary">
                              {feature.replace('_', ' ')}
                            </Text>
                            <Text variant="small" className="text-token-tertiary">{count} calls</Text>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Detailed Usage Table */}
              <Card className="overflow-hidden bg-token-elevated border border-token">
                <div className="px-6 py-4 border-b border-token">
                  <Text variant="h3" as="h3" className="text-token-primary">Detailed Usage Data</Text>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-token">
                    <thead className="bg-token-surface">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-token-tertiary uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-token-tertiary uppercase tracking-wider">
                          Feature
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-token-tertiary uppercase tracking-wider">
                          Usage Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-token-tertiary uppercase tracking-wider">
                          Last Used
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-token-surface divide-y divide-token">
                      {filteredUsageData.slice(0, 20).map((usage, index) => (
                        <tr key={index} className="hover:bg-token-elevated">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Text variant="body" className="text-token-primary">{usage.user_email}</Text>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-token-accent/20 text-token-accent">
                              {usage.feature.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-token-primary">
                            {usage.usage_count.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-token-tertiary">
                            {new Date(usage.last_used).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsageData.length === 0 && (
                  <div className="text-center py-8">
                    <Text variant="body" className="text-token-tertiary">No usage data found for the selected criteria.</Text>
                  </div>
                )}
              </Card>
            </>
          )}

          {activeTab === 'dictionary' && (
            <>
              {/* AI Word Generation Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6 bg-token-elevated border border-token">
                  <div className="text-center">
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-accent">
                      {aiWordStats?.totalWords.toLocaleString() || '0'}
                    </Text>
                    <Text variant="small" className="text-token-secondary">Total Words Generated</Text>
                  </div>
                </Card>
                <Card className="p-6 bg-token-elevated border border-token">
                  <div className="text-center">
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-success">
                      {aiWordStats?.aiSuccessRate || '0'}%
                    </Text>
                    <Text variant="small" className="text-token-secondary">AI Success Rate</Text>
                  </div>
                </Card>
                <Card className="p-6 bg-token-elevated border border-token">
                  <div className="text-center">
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-info">
                      {aiWordStats?.uniqueWords || '0'}
                    </Text>
                    <Text variant="small" className="text-token-secondary">Unique Words</Text>
                  </div>
                </Card>
                <Card className="p-6 bg-token-elevated border border-token">
                  <div className="text-center">
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-token-warning">
                      {aiWordStats?.uniqueTypes || '0'}
                    </Text>
                    <Text variant="small" className="text-token-secondary">Word Types</Text>
                  </div>
                </Card>
              </div>

              {/* Generation Source Breakdown */}
              <Card className="p-6 mb-8 bg-token-elevated border border-token">
                <Text variant="h3" as="h3" className="mb-4 text-token-primary">Generation Source Breakdown</Text>
                <div className="space-y-4">
                  {Object.entries(sourceBreakdown).map(([source, stats]) => (
                    <div key={source} className="flex items-center justify-between p-4 bg-token-surface rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-token-accent/20 rounded-full flex items-center justify-center">
                          <Text variant="small" className="font-bold text-token-accent">
                            {source.charAt(0).toUpperCase()}
                          </Text>
                        </div>
                        <div>
                          <Text variant="body" className="font-medium capitalize text-token-primary">
                            {source.replace('_', ' ')}
                          </Text>
                          <Text variant="small" className="text-token-tertiary">
                            {stats.total} words generated
                          </Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text variant="body" className="font-bold text-token-success">
                          {stats.percentage}%
                        </Text>
                        <Text variant="small" className="text-token-tertiary">
                          Percentage
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Word Type Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Word Types */}
                <Card className="p-6 bg-token-elevated border border-token">
                  <Text variant="h3" as="h3" className="mb-4 text-token-primary">Word Types Breakdown</Text>
                  <div className="space-y-3">
                    {Object.entries(typeBreakdown)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .slice(0, 10)
                      .map(([type, stats], index) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-token-surface rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-token-accent/20 rounded-full flex items-center justify-center">
                              <Text variant="small" className="font-bold text-token-accent">
                                {index + 1}
                              </Text>
                            </div>
                            <div>
                              <Text variant="body" className="font-medium capitalize text-token-primary">
                                {type.replace('_', ' ')}
                              </Text>
                              <Text variant="small" className="text-token-tertiary">
                                {stats.total} words ({stats.percentage}%)
                              </Text>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>

                {/* Recent Word Generation */}
                <Card className="p-6 bg-token-elevated border border-token">
                  <Text variant="h3" as="h3" className="mb-4 text-token-primary">Recent Word Generation</Text>
                  <div className="space-y-3">
                    {aiWordData.slice(0, 10).map((word, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-token-surface rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-token-success/20 rounded-full flex items-center justify-center">
                            <Text variant="small" className="font-bold text-token-success">
                              {index + 1}
                            </Text>
                          </div>
                          <div>
                            <Text variant="body" className="font-medium text-token-primary">
                              {word.word_text}
                            </Text>
                            <Text variant="small" className="text-token-tertiary">
                              {word.metadata?.generated_by || 'unknown'} • {new Date(word.created_at).toLocaleDateString()}
                            </Text>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Daily Trends */}
              <Card className="p-6 mb-8 bg-token-elevated border border-token">
                <Text variant="h3" as="h3" className="mb-4 text-token-primary">Daily Word Generation Trends</Text>
                <div className="space-y-3">
                  {Object.entries(dailyTrends)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .slice(0, 14)
                    .map(([date, stats]) => (
                      <div key={date} className="flex items-center justify-between p-3 bg-token-surface rounded-lg">
                        <div className="flex items-center gap-4">
                          <Text variant="body" className="font-medium text-token-primary">
                            {new Date(date).toLocaleDateString()}
                          </Text>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 text-xs bg-token-success/20 text-token-success rounded">
                              {stats.ai} AI generated
                            </span>
                            <span className="px-2 py-1 text-xs bg-token-warning/20 text-token-warning rounded">
                              {stats.fallback} fallback
                            </span>
                          </div>
                        </div>
                        <Text variant="body" className="font-bold text-token-primary">
                          {stats.total} total
                        </Text>
                      </div>
                    ))}
                </div>
              </Card>

              {/* Recent Word Generation Table */}
              <Card className="overflow-hidden bg-token-elevated border border-token">
                <div className="px-6 py-4 border-b border-token">
                  <Text variant="h3" as="h3" className="text-token-primary">Recent Word Generation</Text>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-token">
                    <thead className="bg-token-surface">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-token-tertiary uppercase tracking-wider">
                          Word
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-token-tertiary uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-token-tertiary uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-token-tertiary uppercase tracking-wider">
                          Generated At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-token-surface divide-y divide-token">
                      {aiWordData.slice(0, 20).map((word, index) => (
                        <tr key={index} className="hover:bg-token-elevated">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Text variant="body" className="text-token-primary">{word.word_text}</Text>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-token-accent/20 text-token-accent capitalize">
                              {word.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              word.metadata?.generated_by === 'openai' || word.metadata?.generated_by === 'ai'
                                ? 'bg-token-success/20 text-token-success' 
                                : 'bg-token-warning/20 text-token-warning'
                            }`}>
                              {word.metadata?.generated_by || 'unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-token-tertiary">
                            {new Date(word.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {aiWordData.length === 0 && (
                  <div className="text-center py-8">
                    <Text variant="body" className="text-token-tertiary">No word generation data found for the selected period.</Text>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 