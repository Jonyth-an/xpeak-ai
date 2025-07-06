'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
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
      case 'healthy': return 'token-text-success bg-token-success-light';
      case 'warning': return 'token-text-warning bg-token-warning-light';
      case 'critical': return 'token-text-error bg-token-error-light';
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
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const healthStatus = stats ? emailMonitoring.getEmailHealthStatus(stats) : 'healthy';

  return (
    <AdminLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h1" as="h1" className="mb-2 token-text-primary">
                  Email Monitoring Dashboard
                </Text>
                <Text variant="lead" className="token-text-secondary">
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
              <Card className="p-6 bg-token-surface token-border-primary border">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="token-text-secondary">Total Sent</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold token-text-primary">
                      {stats.total_sent.toLocaleString()}
                    </Text>
                  </div>
                  <div className="w-12 h-12 bg-token-info-light rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 token-text-info" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor"/>
                      <path d="M3 7l9 6 9-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-token-surface token-border-primary border">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="token-text-secondary">Delivery Rate</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold token-text-primary">
                      {stats.delivery_rate.toFixed(1)}%
                    </Text>
                  </div>
                  <div className="w-12 h-12 bg-token-success-light rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 token-text-success" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-token-surface token-border-primary border">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="token-text-secondary">Open Rate</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold token-text-primary">
                      {stats.open_rate.toFixed(1)}%
                    </Text>
                  </div>
                  <div className="w-12 h-12 bg-token-accent-light rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 token-text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <ellipse cx="12" cy="12" rx="7" ry="5" stroke="currentColor"/>
                      <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-token-surface token-border-primary border">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="token-text-secondary">Click Rate</Text>
                    <Text variant="h3" as="h3" className="text-2xl font-bold token-text-primary">
                      {stats.click_rate.toFixed(1)}%
                    </Text>
                  </div>
                  <div className="w-12 h-12 bg-token-primary-light rounded-full flex items-center justify-center">
                    <svg className="w-7 h-7 token-text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M10 14a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07l-1.41 1.41" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 10a5 5 0 00-7.07 0l-1.41 1.41a5 5 0 007.07 7.07l1.41-1.41" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Detailed Stats */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 bg-token-surface token-border-primary border">
                <Text variant="h3" as="h3" className="mb-4 token-text-primary">Delivery Breakdown</Text>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Text variant="body" className="token-text-primary">Delivered</Text>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-token-surface-subtle rounded-full h-2">
                        <div 
                          className="bg-token-success h-2 rounded-full" 
                          style={{ width: `${(stats.delivered / stats.total_sent) * 100}%` }}
                        ></div>
                      </div>
                      <Text variant="body" className="font-medium token-text-primary">{stats.delivered}</Text>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text variant="body" className="token-text-primary">Bounced</Text>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-token-surface-subtle rounded-full h-2">
                        <div 
                          className="bg-token-error h-2 rounded-full" 
                          style={{ width: `${(stats.bounced / stats.total_sent) * 100}%` }}
                        ></div>
                      </div>
                      <Text variant="body" className="font-medium token-text-primary">{stats.bounced}</Text>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text variant="body" className="token-text-primary">Failed</Text>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-token-surface-subtle rounded-full h-2">
                        <div 
                          className="bg-token-warning h-2 rounded-full" 
                          style={{ width: `${(stats.failed / stats.total_sent) * 100}%` }}
                        ></div>
                      </div>
                      <Text variant="body" className="font-medium token-text-primary">{stats.failed}</Text>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-token-surface token-border-primary border">
                <Text variant="h3" as="h3" className="mb-4 token-text-primary">Engagement Metrics</Text>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Text variant="body" className="token-text-primary">Opened</Text>
                      <Text variant="body" className="font-medium token-text-primary">{stats.opened}</Text>
                    </div>
                    <div className="w-full bg-token-surface-subtle rounded-full h-2">
                      <div 
                        className="bg-token-accent h-2 rounded-full" 
                        style={{ width: `${stats.open_rate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Text variant="body" className="token-text-primary">Clicked</Text>
                      <Text variant="body" className="font-medium token-text-primary">{stats.clicked}</Text>
                    </div>
                    <div className="w-full bg-token-surface-subtle rounded-full h-2">
                      <div 
                        className="bg-token-primary h-2 rounded-full" 
                        style={{ width: `${stats.click_rate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Recent Events */}
          <Card className="p-6 bg-token-surface token-border-primary border">
            <div className="flex items-center justify-between mb-4">
              <Text variant="h3" as="h3" className="token-text-primary">Recent Email Events</Text>
              <Button variant="secondary" size="sm" onClick={loadData}>
                Refresh
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-token-border-primary">
                <thead className="bg-token-surface-subtle">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium token-text-muted uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-token-surface divide-y divide-token-border-primary">
                  {recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm token-text-primary">
                        {event.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm token-text-secondary">
                        {event.type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.status === 'delivered' ? 'bg-token-success-light token-text-success' :
                          event.status === 'bounced' ? 'bg-token-error-light token-text-error' :
                          event.status === 'opened' ? 'bg-token-info-light token-text-info' :
                          event.status === 'clicked' ? 'bg-token-accent-light token-text-accent' :
                          'bg-token-surface-subtle token-text-muted'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm token-text-secondary">
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
    </AdminLayout>
  );
} 