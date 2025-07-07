'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, Button, Text, Badge } from '@/app/components/ui';
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

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
        return <CheckCircle className="h-5 w-5 text-token-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-token-warning" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-token-error" />;
      default:
        return <Info className="h-5 w-5 text-token-accent" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-token-success/20 text-token-success';
      case 'warning':
        return 'bg-token-warning/20 text-token-warning';
      case 'critical':
        return 'bg-token-error/20 text-token-error';
      default:
        return 'bg-token-accent/20 text-token-accent';
    }
  };

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-token-error';
    if (value >= thresholds.warning) return 'text-token-warning';
    return 'text-token-success';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-accent mx-auto mb-token-4"></div>
            <Text variant="body" className="text-token-secondary">Loading system health...</Text>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-token-error-light rounded-full flex items-center justify-center mx-auto mb-token-6">
              <XCircle className="w-8 h-8 text-token-error" />
            </div>
            <Text variant="h1" as="h1" className="mb-token-4 text-token-error">
              Access Denied
            </Text>
            <Text variant="body" className="text-token-secondary mb-token-8">
              You don't have permission to access the admin dashboard.
            </Text>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface flex items-center justify-center">
          <Card className="bg-token-error-light border-token-error p-token-6 max-w-md mx-auto">
            <div className="flex items-center gap-token-3 mb-token-4">
              <XCircle className="w-6 h-6 text-token-error" />
              <Text variant="body" className="text-token-error">Error: {error}</Text>
            </div>
            <Button onClick={fetchHealthData} variant="primary" className="w-full flex items-center gap-token-2" disabled={refreshing}>
              {refreshing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <RefreshCw className="h-4 w-4" />}
              Retry
            </Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!healthData) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface flex items-center justify-center">
          <Card className="p-token-6 max-w-md mx-auto">
            <Text variant="h1" as="h1" className="mb-token-4 text-token-secondary">
              No health data available
            </Text>
            <Text variant="body" className="text-token-secondary mb-token-8">
              Please try refreshing the page.
            </Text>
            <Button onClick={fetchHealthData} variant="primary" className="w-full flex items-center gap-token-2" disabled={refreshing}>
              {refreshing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-token-surface">
        <div className="max-w-7xl mx-auto px-token-4 sm:px-token-6 lg:px-token-8 py-token-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-token-8 gap-token-6">
            <div>
              <Text variant="h1" as="h1" className="mb-token-2 text-token-primary">System Health</Text>
              <Text variant="lead" className="text-token-secondary">
                Last updated: {formatTimestamp(healthData.timestamp)}
              </Text>
            </div>
            <Button 
              onClick={fetchHealthData} 
              disabled={refreshing}
              variant="primary"
              className="flex items-center gap-token-2"
            >
              {refreshing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>

          {/* Overall Status */}
          <Card className="mb-token-8 bg-token-elevated border-token border p-token-6">
            <div className="flex items-center gap-token-3 mb-token-4">
              {getStatusIcon(healthData.overall_status)}
              <Text variant="h3" as="h3" className="text-token-primary">Overall System Status</Text>
            </div>
            <div className="flex items-center gap-token-4">
              <Badge className={getStatusColor(healthData.overall_status)}>
                {healthData.overall_status.toUpperCase()}
              </Badge>
              <div className="flex gap-token-4 text-token-sm text-token-tertiary">
                <span>Critical: {healthData.alerts.critical}</span>
                <span>Warning: {healthData.alerts.warning}</span>
                <span>Info: {healthData.alerts.info}</span>
              </div>
            </div>
          </Card>

          {/* Services Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-token-6 mb-token-8">
            {Object.entries(healthData.services).map(([serviceName, service]) => (
              <Card key={serviceName} className="bg-token-elevated border-token border p-token-6">
                <div className="flex items-center justify-between mb-token-4">
                  <Text variant="h3" as="h3" className="capitalize text-token-primary">
                    {serviceName.replace('_', ' ')}
                  </Text>
                  {getStatusIcon(service.status)}
                </div>
                <div className="space-y-token-2">
                  <div className="flex justify-between">
                    <span className="text-token-sm text-token-tertiary">Status:</span>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-token-sm text-token-tertiary">Response Time:</span>
                    <span className="text-token-sm font-medium text-token-primary">{service.response_time}ms</span>
                  </div>
                  {service.uptime && (
                    <div className="flex justify-between">
                      <span className="text-token-sm text-token-tertiary">Uptime:</span>
                      <span className="text-token-sm font-medium text-token-primary">{service.uptime}</span>
                    </div>
                  )}
                  {service.connections && (
                    <div className="flex justify-between">
                      <span className="text-token-sm text-token-tertiary">Connections:</span>
                      <span className="text-token-sm font-medium text-token-primary">{service.connections}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-token-sm text-token-tertiary">Last Check:</span>
                    <span className="text-token-sm text-token-tertiary">
                      {formatTimestamp(service.last_check)}
                    </span>
                  </div>
                  <p className="text-token-sm text-token-secondary mt-token-2">{service.details}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* System Metrics */}
          <Card className="mb-token-8 bg-token-elevated border-token border p-token-6">
            <Text variant="h3" as="h3" className="mb-token-4 text-token-primary">System Metrics</Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-token-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMetricColor(healthData.system_metrics.memory_usage, { warning: 80, critical: 90 })}`}>
                  {healthData.system_metrics.memory_usage}%
                </div>
                <div className="text-token-sm text-token-secondary">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMetricColor(healthData.system_metrics.cpu_usage, { warning: 70, critical: 85 })}`}>
                  {healthData.system_metrics.cpu_usage}%
                </div>
                <div className="text-token-sm text-token-secondary">CPU Usage</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getMetricColor(healthData.system_metrics.disk_usage, { warning: 80, critical: 90 })}`}>
                  {healthData.system_metrics.disk_usage}%
                </div>
                <div className="text-token-sm text-token-secondary">Disk Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-token-accent">
                  {healthData.system_metrics.active_users}
                </div>
                <div className="text-token-sm text-token-secondary">Active Users</div>
              </div>
            </div>
          </Card>

          {/* Recent Incidents */}
          <Card className="bg-token-elevated border-token border p-token-6">
            <Text variant="h3" as="h3" className="mb-token-4 text-token-primary">Recent Incidents</Text>
            {healthData.recent_incidents.length === 0 ? (
              <p className="text-token-tertiary text-center py-token-4">No recent incidents</p>
            ) : (
              <div className="space-y-token-4">
                {healthData.recent_incidents.map((incident) => (
                  <div key={incident.id} className="border-token border rounded-token-lg p-token-4 bg-token-surface">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-token-2 mb-token-2">
                          {getStatusIcon(incident.type)}
                          <h4 className="font-medium text-token-primary">{incident.title}</h4>
                          {incident.resolved && (
                            <Badge className="bg-token-success/20 text-token-success">Resolved</Badge>
                          )}
                        </div>
                        <p className="text-token-sm text-token-secondary mb-token-2">{incident.description}</p>
                        <p className="text-token-xs text-token-tertiary">
                          {formatTimestamp(incident.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )0<pclassName=>Norecentincidents</p>}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 