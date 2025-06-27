'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { emailMonitoring, EmailStats, EmailEvent } from '@/lib/emailMonitoring';
import { Card, Button, Text } from '@/app/components/ui';

export default function EmailMonitoringPage() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<EmailEvent[]>([]);
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, eventsData] = await Promise.all([
        emailMonitoring.getEmailStats(period),
        emailMonitoring.getRecentEmailEvents(20),
      ]);
      setStats(statsData);
      setRecentEvents(eventsData);
    } catch (error) {
      console.error('Failed to load email monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  const getHealthStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
    }
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

  const healthStatus = stats ? emailMonitoring.getEmailHealthStatus(stats) : 'healthy';

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h1" as="h1" className="mb-2">
                  Email Monitoring Dashboard
                </Text>
                <Text variant="lead" className="text-gray-600">
                  Track email delivery rates and performance metrics
                </Text>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${getHealthStatusColor(healthStatus)}`}>
                {getHealthStatusIcon(healthStatus)} {healthStatus.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {(['24h', '7d', '30d', 'all'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                >
                  {p === '24h' ? '24 Hours' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : 'All Time'}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-gray-600">Total Sent</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-gray-900">
                      {stats.total_sent.toLocaleString()}
                    </Text>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-gray-600">Delivery Rate</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-gray-900">
                      {stats.delivery_rate.toFixed(1)}%
                    </Text>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-gray-600">Open Rate</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-gray-900">
                      {stats.open_rate.toFixed(1)}%
                    </Text>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-gray-600">Click Rate</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold text-gray-900">
                      {stats.click_rate.toFixed(1)}%
                    </Text>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Detailed Stats */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <Text variant="h3" as="h3" className="mb-4">Delivery Breakdown</Text>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Text variant="body">Delivered</Text>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(stats.delivered / stats.total_sent) * 100}%` }}
                        ></div>
                      </div>
                      <Text variant="body" className="font-medium">{stats.delivered}</Text>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text variant="body">Bounced</Text>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(stats.bounced / stats.total_sent) * 100}%` }}
                        ></div>
                      </div>
                      <Text variant="body" className="font-medium">{stats.bounced}</Text>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text variant="body">Failed</Text>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${(stats.failed / stats.total_sent) * 100}%` }}
                        ></div>
                      </div>
                      <Text variant="body" className="font-medium">{stats.failed}</Text>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Text variant="h3" as="h3" className="mb-4">Engagement Metrics</Text>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Text variant="body">Opened</Text>
                      <Text variant="body" className="font-medium">{stats.opened}</Text>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${stats.open_rate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Text variant="body">Clicked</Text>
                      <Text variant="body" className="font-medium">{stats.clicked}</Text>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${stats.click_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Recent Events */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Text variant="h3" as="h3">Recent Email Events</Text>
              <Button variant="secondary" size="sm" onClick={loadData}>
                Refresh
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          event.status === 'bounced' ? 'bg-red-100 text-red-800' :
                          event.status === 'opened' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'clicked' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 