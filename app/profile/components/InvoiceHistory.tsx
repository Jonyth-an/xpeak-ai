'use client';

import React, { useState, useEffect } from 'react';
import { Text, Button, Badge, Card } from '@/app/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  Filter, 
  Calendar, 
  DollarSign, 
  Search,
  X,
  Eye,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

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
  paid_at?: number;
  product?: string;
  interval?: string;
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

interface InvoiceStats {
  totalInvoices: number;
  totalPaid: number;
  totalOutstanding: number;
  averageAmount: number;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [stats, setStats] = useState<InvoiceStats | null>(null);

  const fetchInvoices = async (startingAfter?: string, status?: string, search?: string, dateStart?: string, dateEnd?: string) => {
    if (!session?.access_token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '10',
        ...(startingAfter && { starting_after: startingAfter }),
        ...(status && status !== 'all' && { status }),
        ...(search && { search }),
        ...(dateStart && { created_after: new Date(dateStart).getTime().toString() }),
        ...(dateEnd && { created_before: new Date(dateEnd).getTime().toString() }),
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
      
      // Calculate stats
      calculateStats(data.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoiceList: Invoice[]) => {
    const totalInvoices = invoiceList.length;
    const totalPaid = invoiceList
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount_paid, 0);
    const totalOutstanding = invoiceList
      .filter(inv => inv.status === 'open')
      .reduce((sum, inv) => sum + inv.amount_due, 0);
    const averageAmount = totalInvoices > 0 
      ? invoiceList.reduce((sum, inv) => sum + inv.amount_paid, 0) / totalInvoices 
      : 0;

    setStats({
      totalInvoices,
      totalPaid,
      totalOutstanding,
      averageAmount
    });
  };

  useEffect(() => {
    fetchInvoices();
  }, [session]);

  const handleLoadMore = () => {
    if (invoices.length > 0) {
      const lastInvoice = invoices[invoices.length - 1];
      fetchInvoices(lastInvoice.id, statusFilter, searchQuery, dateRange.start, dateRange.end);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    fetchInvoices(undefined, newStatus, searchQuery, dateRange.start, dateRange.end);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchInvoices(undefined, statusFilter, searchQuery, dateRange.start, dateRange.end);
  };

  const handleDateRangeChange = () => {
    setCurrentPage(1);
    fetchInvoices(undefined, statusFilter, searchQuery, dateRange.start, dateRange.end);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
    fetchInvoices();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      paid: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Paid',
        icon: CheckCircle
      },
      open: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        label: 'Open',
        icon: Clock
      },
      draft: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        label: 'Draft',
        icon: FileText
      },
      void: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Void',
        icon: AlertCircle
      },
      uncollectible: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Uncollectible',
        icon: AlertCircle
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <IconComponent size={12} />
        {config.label}
      </Badge>
    );
  };

  const getInvoiceDateText = (invoice: Invoice) => {
    if (invoice.paid_at) return formatDate(invoice.paid_at);
    return formatDate(invoice.created);
  };

  const openInvoiceModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedInvoice(null);
  };

  const exportInvoices = () => {
    const csvContent = [
      ['Payment Date', 'Amount', 'Product', 'Interval', 'Description'],
      ...invoices.map(invoice => [
        invoice.paid_at ? formatDate(invoice.paid_at) : formatDate(invoice.created),
        formatCurrency(invoice.amount_paid, invoice.currency),
        invoice.product || 'Unknown Product',
        invoice.interval || 'N/A',
        invoice.description || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Text className="text-red-600 mb-4">{error}</Text>
        <Button onClick={() => fetchInvoices()} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Text variant="h5" className="mb-1">Invoice History</Text>
          <Text variant="body" className="text-gray-600">
            {invoices.length > 0 ? `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} found` : 'No invoices found'}
          </Text>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={exportInvoices}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
            disabled={invoices.length === 0}
          >
            <Download size={16} />
            <span>Export</span>
          </Button>
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

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm text-gray-600">Total Invoices</Text>
                <Text className="text-2xl font-bold">{stats.totalInvoices}</Text>
              </div>
              <FileText className="text-blue-500" size={24} />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm text-gray-600">Total Paid</Text>
                <Text className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalPaid, 'usd')}
                </Text>
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm text-gray-600">Outstanding</Text>
                <Text className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.totalOutstanding, 'usd')}
                </Text>
              </div>
              <TrendingDown className="text-yellow-500" size={24} />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Text className="text-sm text-gray-600">Average Amount</Text>
                <Text className="text-2xl font-bold">
                  {formatCurrency(stats.averageAmount, 'usd')}
                </Text>
              </div>
              <DollarSign className="text-gray-500" size={24} />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text variant="h6">Filters</Text>
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <X size={16} />
                <span>Clear All</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search invoices..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="open">Open</option>
                  <option value="draft">Draft</option>
                  <option value="void">Void</option>
                  <option value="uncollectible">Uncollectible</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleDateRangeChange} variant="primary" size="sm">
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Invoice Table */}
      {invoices.length > 0 ? (
        <Card className="overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-1">Payment Date</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">Product</div>
              <div className="col-span-1">Interval</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openInvoiceModal(invoice)}
              >
                <div className="grid grid-cols-5 gap-4 items-center">
                  {/* Payment Date */}
                  <div className="col-span-1">
                    <Text className="text-sm text-gray-600">
                      {invoice.paid_at ? formatDate(invoice.paid_at) : formatDate(invoice.created)}
                    </Text>
                  </div>
                  {/* Amount */}
                  <div className="col-span-1">
                    <Text className="font-medium text-gray-900">
                      {formatCurrency(invoice.amount_paid, invoice.currency)}
                    </Text>
                    {invoice.amount_due > 0 && invoice.amount_due !== invoice.amount_paid && (
                      <Text className="text-sm text-gray-500">
                        Due: {formatCurrency(invoice.amount_due, invoice.currency)}
                      </Text>
                    )}
                  </div>
                  {/* Product */}
                  <div className="col-span-1">
                    <Text className="text-sm text-gray-700">
                      {invoice.product || 'Unknown Product'}
                    </Text>
                  </div>
                  {/* Interval */}
                  <div className="col-span-1">
                    <Text className="text-sm text-gray-700">
                      {invoice.interval || 'N/A'}
                    </Text>
                  </div>
                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openInvoiceModal(invoice);
                        }}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </Button>
                      {invoice.hosted_invoice_url && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(invoice.hosted_invoice_url, '_blank');
                          }}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          title="View Invoice"
                        >
                          <ExternalLink size={14} />
                        </Button>
                      )}
                      {invoice.invoice_pdf && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(invoice.invoice_pdf, '_blank');
                          }}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          title="Download PDF"
                        >
                          <Download size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <Text className="text-gray-500 mb-2">No invoices found</Text>
          <Text className="text-gray-400 text-sm">
            {statusFilter !== 'all' || searchQuery || dateRange.start || dateRange.end
              ? 'Try adjusting your filters'
              : 'Your invoice history will appear here'}
          </Text>
        </Card>
      )}

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

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Text variant="h5">Invoice Details</Text>
                <Button
                  onClick={closeInvoiceModal}
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Payment Date */}
              <div>
                <Text className="text-sm text-gray-600">Payment Date</Text>
                <Text className="font-medium">{selectedInvoice.paid_at ? formatDateTime(selectedInvoice.paid_at) : formatDateTime(selectedInvoice.created)}</Text>
              </div>
              {/* Amount */}
              <div>
                <Text className="text-sm text-gray-600">Amount</Text>
                <Text className="font-medium text-lg">
                  {formatCurrency(selectedInvoice.amount_paid, selectedInvoice.currency)}
                </Text>
              </div>
              {/* Product */}
              <div>
                <Text className="text-sm text-gray-600">Product</Text>
                <Text className="font-medium">{selectedInvoice.product || 'Unknown Product'}</Text>
              </div>
              {/* Interval */}
              <div>
                <Text className="text-sm text-gray-600">Interval</Text>
                <Text className="font-medium">{selectedInvoice.interval || 'N/A'}</Text>
              </div>
              {/* Description */}
              {selectedInvoice.description && (
                <div>
                  <Text className="text-sm text-gray-600 mb-1">Description</Text>
                  <Text>{selectedInvoice.description}</Text>
                </div>
              )}
              {/* Period Information */}
              {(selectedInvoice.period_start || selectedInvoice.period_end) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedInvoice.period_start && (
                    <div>
                      <Text className="text-sm text-gray-600">Period Start</Text>
                      <Text className="font-medium">{formatDate(selectedInvoice.period_start)}</Text>
                    </div>
                  )}
                  {selectedInvoice.period_end && (
                    <div>
                      <Text className="text-sm text-gray-600">Period End</Text>
                      <Text className="font-medium">{formatDate(selectedInvoice.period_end)}</Text>
                    </div>
                  )}
                </div>
              )}
              {/* Actions */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                {selectedInvoice.hosted_invoice_url && (
                  <Button
                    onClick={() => window.open(selectedInvoice.hosted_invoice_url, '_blank')}
                    variant="primary"
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink size={16} />
                    <span>View Invoice</span>
                  </Button>
                )}
                {selectedInvoice.invoice_pdf && (
                  <Button
                    onClick={() => window.open(selectedInvoice.invoice_pdf, '_blank')}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Download size={16} />
                    <span>Download PDF</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 