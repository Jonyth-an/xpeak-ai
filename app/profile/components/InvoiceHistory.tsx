'use client';

import React, { useState, useEffect } from 'react';
import { Card, Text, Button, Badge } from '@/app/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { ChevronLeft, ChevronRight, Download, ExternalLink, Filter, Calendar, DollarSign } from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  created: number;
  due_date?: number;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  description?: string;
  customer_email?: string;
  line_items_count: number;
  period_start?: number;
  period_end?: number;
}

interface InvoiceResponse {
  invoices: Invoice[];
  hasMore: boolean;
  totalCount: number;
  pagination: {
    limit: number;
    startingAfter: string | null;
    hasMore: boolean;
  };
}

export default function InvoiceHistory() {
  const { session } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchInvoices = async (startingAfter?: string, status?: string) => {
    if (!session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '10',
        ...(startingAfter && { starting_after: startingAfter }),
        ...(status && status !== 'all' && { status }),
      });

      const response = await fetch(`/api/billing/invoices?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data: InvoiceResponse = await response.json();
      
      if (startingAfter) {
        // Append to existing invoices for pagination
        setInvoices(prev => [...prev, ...data.invoices]);
      } else {
        // Replace invoices for new search/filter
        setInvoices(data.invoices);
      }
      
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [session]);

  const handleLoadMore = () => {
    if (invoices.length > 0) {
      const lastInvoice = invoices[invoices.length - 1];
      fetchInvoices(lastInvoice.id, statusFilter);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    fetchInvoices(undefined, newStatus);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      open: { color: 'bg-yellow-100 text-yellow-800', label: 'Open' },
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      void: { color: 'bg-red-100 text-red-800', label: 'Void' },
      uncollectible: { color: 'bg-red-100 text-red-800', label: 'Uncollectible' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPeriodText = (invoice: Invoice) => {
    if (invoice.period_start && invoice.period_end) {
      const start = formatDate(invoice.period_start);
      const end = formatDate(invoice.period_end);
      return `${start} - ${end}`;
    }
    return formatDate(invoice.created);
  };

  if (loading && invoices.length === 0) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Text className="text-red-600 mb-4">{error}</Text>
          <Button onClick={() => fetchInvoices()} variant="primary">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text variant="h5" className="mb-1">Invoice History</Text>
          <Text variant="body" className="text-gray-600">
            {invoices.length > 0 ? `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} found` : 'No invoices found'}
          </Text>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Filter size={16} />
            <span>Filter</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="open">Open</option>
                <option value="draft">Draft</option>
                <option value="void">Void</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Invoice List */}
      {invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Text className="font-medium text-gray-900">
                      Invoice #{invoice.number}
                    </Text>
                    {getStatusBadge(invoice.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <DollarSign size={14} />
                      <span>{formatCurrency(invoice.amount_paid, invoice.currency)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{getPeriodText(invoice)}</span>
                    </div>
                    {invoice.description && (
                      <div className="text-gray-500 truncate">
                        {invoice.description}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {invoice.hosted_invoice_url && (
                    <Button
                      onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <ExternalLink size={14} />
                      <span>View</span>
                    </Button>
                  )}
                  {invoice.invoice_pdf && (
                    <Button
                      onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <Download size={14} />
                      <span>PDF</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                ) : (
                  <>
                    <span>Load More</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <Text className="text-gray-500 mb-2">No invoices found</Text>
          <Text className="text-gray-400 text-sm">
            {statusFilter !== 'all' ? `No ${statusFilter} invoices` : 'Your invoice history will appear here'}
          </Text>
        </div>
      )}
    </Card>
  );
} 