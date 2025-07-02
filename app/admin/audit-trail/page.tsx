'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { isAdminEmail } from '@/lib/adminAuth';
import { supabase } from '@/lib/supabaseClient';
import { Card, Button, Text } from '@/app/components/ui';

interface AuditEvent {
  id: string;
  user_email: string;
  event_type: string;
  event_data: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export default function AuditTrailPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filters, setFilters] = useState({
    eventType: '',
    userEmail: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0,
    hasMore: false
  });

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
        await loadAuditTrail();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      });

      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/audit-trail?${params}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error('Error loading audit trail:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, offset: 0 }));
    loadAuditTrail();
  };

  const clearFilters = () => {
    setFilters({
      eventType: '',
      userEmail: '',
      startDate: '',
      endDate: ''
    });
    setPagination(prev => ({ ...prev, offset: 0 }));
    loadAuditTrail();
  };

  const loadMore = () => {
    setPagination(prev => ({ 
      ...prev, 
      offset: prev.offset + prev.limit 
    }));
    loadAuditTrail();
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'subscription_created':
        return '🎯';
      case 'subscription_updated':
        return '✏️';
      case 'subscription_cancelled':
        return '❌';
      case 'payment_succeeded':
        return '✅';
      case 'payment_failed':
        return '💳';
      case 'invoice_created':
        return '📄';
      case 'customer_updated':
        return '👤';
      default:
        return '📝';
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'subscription_created':
      case 'payment_succeeded':
        return 'text-green-600 bg-green-50';
      case 'subscription_cancelled':
      case 'payment_failed':
        return 'text-red-600 bg-red-50';
      case 'subscription_updated':
      case 'customer_updated':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
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
              You don't have permission to access the audit trail.
            </Text>
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
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h1" as="h1" className="mb-2">
                  Audit Trail
                </Text>
                <Text variant="lead" className="text-gray-600">
                  Complete history of all billing events and user actions
                </Text>
              </div>
              <Button variant="primary" onClick={loadAuditTrail}>
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <Text variant="h3" as="h3" className="mb-4">Filters</Text>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={filters.eventType}
                  onChange={(e) => handleFilterChange('eventType', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Events</option>
                  <option value="subscription_created">Subscription Created</option>
                  <option value="subscription_updated">Subscription Updated</option>
                  <option value="subscription_cancelled">Subscription Cancelled</option>
                  <option value="payment_succeeded">Payment Succeeded</option>
                  <option value="payment_failed">Payment Failed</option>
                  <option value="invoice_created">Invoice Created</option>
                  <option value="customer_updated">Customer Updated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Email
                </label>
                <input
                  type="email"
                  value={filters.userEmail}
                  onChange={(e) => handleFilterChange('userEmail', e.target.value)}
                  placeholder="Filter by email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-4">
              <Button variant="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </Card>

          {/* Events List */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Text variant="h3" as="h3">Events ({pagination.total})</Text>
              <Text variant="small" className="text-gray-500">
                Showing {events.length} of {pagination.total} events
              </Text>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${getEventColor(event.event_type)}`}>
                        {getEventIcon(event.event_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Text variant="body" className="font-semibold">
                            {event.event_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Text>
                          <span className="text-sm text-gray-500">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>
                        <Text variant="small" className="text-gray-600 mt-1">
                          User: {event.user_email}
                        </Text>
                        {event.event_data && (
                          <div className="mt-2">
                            <details className="text-sm">
                              <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                                View Event Data
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                {JSON.stringify(event.event_data, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {events.length === 0 && (
                <div className="text-center py-8">
                  <Text variant="body" className="text-gray-500">
                    No events found matching your filters.
                  </Text>
                </div>
              )}
            </div>

            {pagination.hasMore && (
              <div className="mt-6 text-center">
                <Button variant="secondary" onClick={loadMore}>
                  Load More Events
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 