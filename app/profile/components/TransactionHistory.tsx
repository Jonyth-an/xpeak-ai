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

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description?: string;
  product: string;
  interval: string;
  receipt_url?: string;
}

interface TransactionResponse {
  charges: Transaction[];
  has_more: boolean;
}

interface TransactionStats {
  totalTransactions: number;
  totalPaid: number;
  totalFailed: number;
  averageAmount: number;
}

export default function TransactionHistory() {
  const { session } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
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
      });

      const response = await fetch(`/api/billing/charges?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data: TransactionResponse = await response.json();
      
      // Filter transactions based on status, search, and date range
      let filteredTransactions = data.charges;
      
      if (status && status !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.status === status);
      }
      
      if (search) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.description?.toLowerCase().includes(search.toLowerCase()) ||
          t.product.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (dateStart) {
        const startTime = new Date(dateStart).getTime() / 1000;
        filteredTransactions = filteredTransactions.filter(t => t.created >= startTime);
      }
      
      if (dateEnd) {
        const endTime = new Date(dateEnd).getTime() / 1000;
        filteredTransactions = filteredTransactions.filter(t => t.created <= endTime);
      }
      
      if (startingAfter) {
        // Append to existing transactions for pagination
        setTransactions(prev => [...prev, ...filteredTransactions]);
      } else {
        // Replace transactions for new search/filter
        setTransactions(filteredTransactions);
      }
      
      setHasMore(data.has_more);
      
      // Calculate stats
      calculateStats(filteredTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactionList: Transaction[]) => {
    const totalTransactions = transactionList.length;
    const totalPaid = transactionList
      .filter(t => t.status === 'succeeded')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalFailed = transactionList
      .filter(t => t.status === 'failed')
      .reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = totalTransactions > 0 
      ? transactionList.reduce((sum, t) => sum + t.amount, 0) / totalTransactions 
      : 0;

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
      succeeded: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        label: 'Succeeded',
        icon: CheckCircle
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        label: 'Pending',
        icon: Clock
      },
      failed: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        label: 'Failed',
        icon: AlertCircle
      },
      canceled: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        label: 'Canceled',
        icon: AlertCircle
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} border flex items-center gap-1`}>
        <IconComponent size={12} />
        {config.label}
      </Badge>
    );
  };

  const openTransactionModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Payment Date', 'Amount', 'Product', 'Interval', 'Description', 'Status'],
      ...transactions.map(transaction => [
        formatDate(transaction.created),
        formatCurrency(transaction.amount, transaction.currency),
        transaction.product,
        transaction.interval,
        transaction.description || '',
        transaction.status
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
          <Text variant="h5" className="mb-1">Transaction History</Text>
          <Text variant="body" className="text-gray-600">
            {transactions.length > 0 ? `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''} found` : 'No transactions found'}
          </Text>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={exportTransactions}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
            disabled={transactions.length === 0}
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
                <Text className="text-sm text-gray-600">Total Transactions</Text>
                <Text className="text-2xl font-bold">{stats.totalTransactions}</Text>
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
                <Text className="text-sm text-gray-600">Failed</Text>
                <Text className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.totalFailed, 'usd')}
                </Text>
              </div>
              <TrendingDown className="text-red-500" size={24} />
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
                  <option value="succeeded">Succeeded</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="canceled">Canceled</option>
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
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-1">Payment Date</div>
              <div className="col-span-1">Amount</div>
              <div className="col-span-1">Product</div>
              <div className="col-span-1">Interval</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openTransactionModal(transaction)}
              >
                <div className="grid grid-cols-6 gap-4 items-center">
                  {/* Payment Date */}
                  <div className="col-span-1">
                    <Text className="text-sm text-gray-600">
                      {formatDate(transaction.created)}
                    </Text>
                  </div>
                  {/* Amount */}
                  <div className="col-span-1">
                    <Text className="font-medium text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </Text>
                  </div>
                  {/* Product */}
                  <div className="col-span-1">
                    <Text className="text-sm text-gray-700">
                      {transaction.product}
                    </Text>
                  </div>
                  {/* Interval */}
                  <div className="col-span-1">
                    <Text className="text-sm text-gray-700">
                      {transaction.interval}
                    </Text>
                  </div>
                  {/* Status */}
                  <div className="col-span-1">
                    {getStatusBadge(transaction.status)}
                  </div>
                  {/* Actions */}
                  <div className="col-span-1">
                    <div className="flex items-center space-x-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          openTransactionModal(transaction);
                        }}
                        variant="ghost"
                        size="sm"
                        className="p-1"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </Button>
                      {transaction.receipt_url && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(transaction.receipt_url, '_blank');
                          }}
                          variant="ghost"
                          size="sm"
                          className="p-1"
                          title="View Receipt"
                        >
                          <ExternalLink size={14} />
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
          <div className="text-gray-400 text-6xl mb-4">💳</div>
          <Text className="text-gray-500 mb-2">No transactions found</Text>
          <Text className="text-gray-400 text-sm">
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
                  {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
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
              
              {selectedTransaction.description && (
                <div>
                  <Text className="text-sm text-gray-600">Description</Text>
                  <Text>{selectedTransaction.description}</Text>
                </div>
              )}
              
              {selectedTransaction.receipt_url && (
                <div className="pt-4">
                  <Button
                    onClick={() => window.open(selectedTransaction.receipt_url, '_blank')}
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