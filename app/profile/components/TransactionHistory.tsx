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
import Link from 'next/link';

// Use the same enhanced Invoice interface as InvoiceHistory
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
  payment_method?: {
    type: string;
    brand?: string;
    last4?: string;
    exp_month?: number;
    exp_year?: number;
  };
  refunds?: Array<{
    id: string;
    amount: number;
    reason?: string;
    created: number;
    status: string;
  }>;
  line_items: Array<{
    description: string;
    amount: number;
    quantity: number;
    product_name?: string;
    interval?: string;
    unit_amount?: number;
  }>;
  tax_amount?: number;
  discount_amount?: number;
  subtotal?: number;
  payment_intent?: {
    id: string;
    status: string;
    created: number;
    amount: number;
    currency: string;
  };
  charge?: {
    id: string;
    status: string;
    created: number;
    receipt_url?: string;
    failure_reason?: string;
    outcome?: {
      type: string;
      seller_message: string;
    };
  };
  subscription?: {
    id: string;
    status: string;
    current_period_start: number;
    current_period_end: number;
  };
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

interface TransactionStats {
  totalTransactions: number;
  totalPaid: number;
  totalFailed: number;
  averageAmount: number;
}

export default function TransactionHistory() {
  const { session } = useAuth();
  const [transactions, setTransactions] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTransaction, setSelectedTransaction] = useState<Invoice | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [stats, setStats] = useState<TransactionStats | null>(null);

  const fetchTransactions = async (startingAfter?: string, status?: string, search?: string, dateStart?: string, dateEnd?: string) => {
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

      // Use the enhanced invoices endpoint instead of charges
      const response = await fetch(`/api/billing/enhanced-invoices?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data: InvoiceResponse = await response.json();data
      
      if (startingAfter) {
        // Append to existing transactions for pagination
        setTransactions(prev => [...prev, ...data.invoices]);
      } else {
        // Replace transactions for new search/filter
        setTransactions(data.invoices);
      }
      
      setHasMore(data.hasMore);
      
      // Calculate stats
      calculateStats(data.invoices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactionList: Invoice[]) => {
    const totalTransactions = transactionList.length;
    const totalPaid = transactionList
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount_paid, 0);
    const totalFailed = transactionList
      .filter(t => t.status === 'failed' || t.status === 'void' || t.status === 'uncollectible')
      .reduce((sum, t) => sum + t.amount_due, 0);
    const averageAmount = totalTransactions > 0 
      ? transactionList.reduce((sum, t) => sum + t.amount_paid, 0) / totalTransactions 
      : 0;averageAmounttotalTransactions0transactionList.reducesumt.amount_paid,0totalTransactions

    setStats({
      totalTransactions,
      totalPaid,
      totalFailed,
      averageAmount
    });
  };

  useEffect(() => {
    fetchTransactions();
  }, [session]);

  const handleLoadMore = () => {
    if (transactions.length > 0) {
      const lastTransaction = transactions[transactions.length - 1];
      fetchTransactions(lastTransaction.id, statusFilter, searchQuery, dateRange.start, dateRange.end);
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1);
    fetchTransactions(undefined, newStatus, searchQuery, dateRange.start, dateRange.end);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTransactions(undefined, statusFilter, searchQuery, dateRange.start, dateRange.end);
  };

  const handleDateRangeChange = () => {
    setCurrentPage(1);
    fetchTransactions(undefined, statusFilter, searchQuery, dateRange.start, dateRange.end);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
    setDateRange({ start: '', end: '' });
    setCurrentPage(1);
    fetchTransactions();
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
        color: 'bg-green-100 text-green-800 border-green-200',; 
        label: 'Paid',;
        icon: CheckCircle
      },
      open: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',; 
        label: 'Open',;
        icon: Clock
      },
      draft: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200',; 
        label: 'Draft',;
        icon: FileText
      },
      void: { 
        color: 'bg-red-100 text-red-800 border-red-200',; 
        label: 'Void',;
        icon: AlertCircle
      },
      uncollectible: { 
        color: 'bg-red-100 text-red-800 border-red-200',; 
        label: 'Uncollectible',;
        icon: AlertCircle
      },
      failed: { 
        color: 'bg-red-100 text-red-800 border-red-200',; 
        label: 'Failed',;
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

  const openTransactionModal = (transaction: Invoice) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Payment Date', 'Amount', 'Product', 'Interval', 'Description', 'Status', 'Payment Method'],
      ...transactions.map(transaction => [
        formatDate(transaction.created),
        formatCurrency(transaction.amount_paid, transaction.currency),
        transaction.product || 'Unknown Product',
        transaction.interval || 'N/A',
        transaction.description || '',
        transaction.status,
        transaction.payment_method ? `${transaction.payment_method.brand?.toUpperCase() || transaction.payment_method.type}${transaction.payment_method.last4 ? ' •••• ' + transaction.payment_method.last4 : ''}` : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && transactions.length === 0) {
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
        <Button onClick={() => fetchTransactions()} variant="primary">
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
          <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
        </div>
      </div>

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
                    placeholder="Search transactions..."
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
                  <option value="failed">Failed</option>
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

      {/* Transaction Table */}
      {transactions.length > 0 ? (
        <Card className="overflow-hidden">
          {/* Table Header */}
          <div className="bg-token-surface-subtle px-6 py-3 border-b token-border-primary">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium token-text-secondary">
              <div className="col-span-1">Payment Date</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>
          {/* Table Body */}
          <div className="divide-y token-border-primary">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="px-6 py-4 hover:bg-token-surface-accent transition-colors cursor-pointer"
                onClick={() => openTransactionModal(transaction)}
              >
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* Payment Date */}
                  <div className="col-span-1">
                    <Text className="text-sm token-text-secondary">
                      {formatDate(transaction.created)}
                    </Text>
                  </div>
                  {/* Amount */}
                  <div className="col-span-1">
                    <Text className="font-medium token-text-primary">
                      {formatCurrency(transaction.amount_paid, transaction.currency)}
                    </Text>
                  </div>
                  {/* Actions */}
                  <div className="col-span-1">
                    {transaction.hosted_invoice_url ? (
                      <a
                        href={transaction.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 rounded token-border-primary border hover:bg-token-surface-subtle transition text-sm font-medium token-text-primary"
                      >
                        View Invoice
                      </a>
                    ) : (
                      <span className="token-text-muted text-sm">No invoice available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-12">
          <div className="token-text-muted text-6xl mb-4">💳</div>
          <Text className="token-text-secondary mb-2">No transactions found</Text>
          <Text className="token-text-muted text-sm">
            {statusFilter !== 'all' || searchQuery || dateRange.start || dateRange.end
              ? 'Try adjusting your filters'
              : 'Your transaction history will appear here'}
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

      {/* Transaction Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Text variant="h6">Transaction Details</Text>
              <Button
                onClick={closeTransactionModal}
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <X size={16} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Text className="text-sm text-gray-600">Transaction ID</Text>
                <Text className="font-mono text-sm">{selectedTransaction.id}</Text>
              </div>
              
              <div>
                <Text className="text-sm text-gray-600">Amount</Text>
                <Text className="text-lg font-bold">
                  {formatCurrency(selectedTransaction.amount_paid, selectedTransaction.currency)}
                </Text>
              </div>
              
              <div>
                <Text className="text-sm text-gray-600">Product</Text>
                <Text>{selectedTransaction.product}</Text>
              </div>
              
              <div>
                <Text className="text-sm text-gray-600">Interval</Text>
                <Text>{selectedTransaction.interval}</Text>
              </div>
              
              <div>
                <Text className="text-sm text-gray-600">Status</Text>
                <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
              </div>
              
              <div>
                <Text className="text-sm text-gray-600">Date</Text>
                <Text>{formatDateTime(selectedTransaction.created)}</Text>
              </div>
              
              {selectedTransaction.payment_method && (
                <div>
                  <Text className="text-sm text-gray-600">Payment Method</Text>
                  <Text>
                    {selectedTransaction.payment_method.brand?.toUpperCase() || selectedTransaction.payment_method.type}
                    {selectedTransaction.payment_method.last4 ? ` •••• ${selectedTransaction.payment_method.last4}` : ''}
                  </Text>
                </div>
              )}
              
              {selectedTransaction.description && (
                <div>
                  <Text className="text-sm text-gray-600">Description</Text>
                  <Text>{selectedTransaction.description}</Text>
                </div>
              )}
              
              {selectedTransaction.charge?.receipt_url && (
                <div className="pt-4">
                  <Button
                    onClick={() => window.open(selectedTransaction.charge?.receipt_url, '_blank')}
                    variant="primary"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <ExternalLink size={16} />
                    <span>View Receipt</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 