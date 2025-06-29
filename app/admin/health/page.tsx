'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';
import { createClient } from '@supabase/supabase-js';
import { Card, Button, Text, Badge } from '@/app/components/ui';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface HealthData {
  timestamp: string;
  overall_status: string;
  services: {
    [key: string]: {
      status: string;
      response_time: number;
      uptime?: string;
      connections?: number;
      last_check: string;
      details: string;
    };
  };
  system_metrics: {
    memory_usage: number;
    cpu_usage: number;
    disk_usage: number;
    active_users: number;
  };
  recent_incidents: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    resolved: boolean;
  }>;
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

export default function SystemHealthPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        await fetchHealthData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/health', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }

      const data = await response.json();
      setHealthData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-red-600">
              Access Denied
            </Text>
            <Text variant="body" className="text-gray-600 mb-6">
              You don't have permission to access the admin dashboard.
            </Text>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error: {error}</p>
            <Button onClick={fetchHealthData} className="mt-2">
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!healthData) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-gray-600">
              No health data available
            </Text>
            <Text variant="body" className="text-gray-600 mb-6">
              Please try refreshing the page.
            </Text>
            <Button onClick={fetchHealthData} className="mt-2">
              Refresh
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Text variant="h1" as="h1" className="mb-2">System Health</Text>
              <Text variant="lead" className="text-gray-600">
                Last updated: {formatTimestamp(healthData.timestamp)}
              </Text>
            </div>
            <Button 
              onClick={fetchHealthData} 
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Overall Status */}
          <Card className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {getStatusIcon(healthData.overall_status)}
              <Text variant="h3" as="h3">Overall System Status</Text>
            </div>
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(healthData.overall_status)}>
                {healthData.overall_status.toUpperCase()}
              </Badge>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Critical: {healthData.alerts.critical}</span>
                <span>Warning: {healthData.alerts.warning}</span>
                <span>Info: {healthData.alerts.info}</span>
              </div>
            </div>
          </Card>

          {/* Services Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(healthData.services).map(([serviceName, service]) => (
              <Card key={serviceName}>
                <div className="flex items-center justify-between mb-4">
                  <Text variant="h3" as="h3" className="capitalize">
                    {serviceName.replace('_', ' ')}
                  </Text>
                  {getStatusIcon(service.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time:</span>
                    <span className="text-sm font-medium">{service.response_time}ms</span>
                  </div>
                  {service.uptime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uptime:</span>
                      <span className="text-sm font-medium">{service.uptime}</span>
                    </div>
                  )}
                  {service.connections && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Connections:</span>
                      <span className="text-sm font-medium">{service.connections}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Check:</span>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(service.last_check)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{service.details}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* System Metrics */}
          <Card className="mb-8">
            <Text variant="h3" as="h3" className="mb-4">System Metrics</Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMetricColor(healthData.system_metrics.memory_usage, { warning: 80, critical: 90 })}`}>
                  {healthData.system_metrics.memory_usage}%
                </div>
                <div className="text-sm text-gray-600">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMetricColor(healthData.system_metrics.cpu_usage, { warning: 70, critical: 85 })}`}>
                  {healthData.system_metrics.cpu_usage}%
                </div>
                <div className="text-sm text-gray-600">CPU Usage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMetricColor(healthData.system_metrics.disk_usage, { warning: 80, critical: 90 })}`}>
                  {healthData.system_metrics.disk_usage}%
                </div>
                <div className="text-sm text-gray-600">Disk Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {healthData.system_metrics.active_users}
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
            </div>
          </Card>

          {/* Recent Incidents */}
          <Card>
            <Text variant="h3" as="h3" className="mb-4">Recent Incidents</Text>
            {healthData.recent_incidents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent incidents</p>
            ) : (
              <div className="space-y-4">
                {healthData.recent_incidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(incident.type)}
                          <h4 className="font-medium">{incident.title}</h4>
                          {incident.resolved && (
                            <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(incident.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 