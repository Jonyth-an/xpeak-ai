'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
import { Card, Text, Button } from '@/app/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { 
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Download,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Banknote,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

interface EarningsData {
  summary: {
    total_earnings: number;
    paid_earnings: number;
    pending_earnings: number;
    period_earnings: number;
    period_pending: number;
    lesson_earnings: number;
    bonus_earnings: number;
    referral_earnings: number;
    currency: string;
  };
  earnings: {
    data: Array<{
      id: string;
      earning_type: string;
      amount: number;
      currency: string;
      description: string;
      bonus_tier?: string;
      earned_at: string;
      is_paid: boolean;
      lesson_id?: string;
      payout_id?: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  payouts: {
    recent_payouts: Array<{
      id: string;
      amount: number;
      currency: string;
      payment_method: string;
      payment_account_id: string;
      payout_date: string;
      status: string;
      transaction_id?: string;
      notes?: string;
      created_at: string;
    }>;
    summary: {
      total_payouts: number;
      pending_payouts: number;
      completed_payouts: number;
      next_payout_eligible: boolean;
      next_payout_date: string;
      minimum_payout: number;
    };
  };
  trends: {
    monthly_data: Array<{
      month: string;
      month_name: string;
      total_earnings: number;
      lesson_earnings: number;
      bonus_earnings: number;
      transaction_count: number;
    }>;
    time_range: string;
    start_date: string;
    end_date: string;
  };
  filters: {
    earning_type: string;
    time_range: string;
    page: number;
    limit: number;
  };
}

export default function EarningsDashboard() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('month');
  const [earningType, setEarningType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [paymentAccount, setPaymentAccount] = useState('');

  useEffect(() => {
    fetchEarningsData();
  }, [timeRange, earningType, currentPage]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const params = new URLSearchParams({
        range: timeRange,
        type: earningType,
        page: currentPage.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/tutor/earnings?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEarningsData(data);
      } else {
        setError('Failed to load earnings data');
      }
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      setError('An error occurred while loading earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = async () => {
    if (!payoutAmount || !paymentAccount) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (amount < 50) {
      alert('Minimum payout amount is $50');
      return;
    }

    if (!earningsData || amount > earningsData.summary.pending_earnings) {
      alert('Insufficient balance');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/tutor/earnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'request_payout',
          amount,
          payment_method: paymentMethod,
          payment_account_id: paymentAccount
        })
      });

      if (response.ok) {
        setShowPayoutModal(false);
        setPayoutAmount('');
        setPaymentAccount('');
        await fetchEarningsData();
        alert('Payout request submitted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit payout request');
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('An error occurred while requesting payout');
    }
  };

  const getEarningTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <Calendar className="w-4 h-4" />;
      case 'bonus': return <TrendingUp className="w-4 h-4" />;
      case 'referral': return <ArrowUpRight className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getEarningTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'text-blue-600 bg-blue-100';
      case 'bonus': return 'text-green-600 bg-green-100';
      case 'referral': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPayoutStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <TutorLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary"></div>
        </div>
      </TutorLayout>
    );
  }

  if (error || !earningsData) {
    return (
      <TutorLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center">
            <Text variant="h2" className="text-token-error mb-2">Unable to Load Earnings Data</Text>
            <Text variant="body" className="text-token-text-secondary mb-4">{error}</Text>
            <Button variant="primary" onClick={fetchEarningsData}>Retry</Button>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Text variant="h1" as="h1" className="text-token-primary mb-2">
                Earnings & Payouts
              </Text>
              <Text variant="body" className="text-token-text-secondary">
                Track your income and manage withdrawals
              </Text>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-token rounded-md bg-token-surface"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              
              <Button
                variant="primary"
                onClick={() => setShowPayoutModal(true)}
                disabled={!earningsData.payouts.summary.next_payout_eligible}
              >
                <Download className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="text-token-text-secondary mb-1">
                    Total Earnings
                  </Text>
                  <Text variant="h2" className="text-2xl font-bold text-token-text-primary">
                    {formatCurrency(earningsData.summary.total_earnings)}
                  </Text>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="text-token-text-secondary mb-1">
                    Available Balance
                  </Text>
                  <Text variant="h2" className="text-2xl font-bold text-blue-600">
                    {formatCurrency(earningsData.summary.pending_earnings)}
                  </Text>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="text-token-text-secondary mb-1">
                    This {timeRange === 'week' ? 'Week' : timeRange === 'month' ? 'Month' : timeRange === 'quarter' ? 'Quarter' : 'Year'}
                  </Text>
                  <Text variant="h2" className="text-2xl font-bold text-purple-600">
                    {formatCurrency(earningsData.summary.period_earnings)}
                  </Text>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="small" className="text-token-text-secondary mb-1">
                    Total Paid Out
                  </Text>
                  <Text variant="h2" className="text-2xl font-bold text-orange-600">
                    {formatCurrency(earningsData.payouts.summary.completed_payouts)}
                  </Text>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Earnings by Type */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <Banknote className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Earnings Breakdown</Text>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                    <Text variant="body" className="text-token-text-secondary">Lesson Earnings</Text>
                  </div>
                  <Text variant="body" className="font-medium text-token-text-primary">
                    {formatCurrency(earningsData.summary.lesson_earnings)}
                  </Text>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    <Text variant="body" className="text-token-text-secondary">Bonus Earnings</Text>
                  </div>
                  <Text variant="body" className="font-medium text-token-text-primary">
                    {formatCurrency(earningsData.summary.bonus_earnings)}
                  </Text>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ArrowUpRight className="w-4 h-4 text-purple-600 mr-2" />
                    <Text variant="body" className="text-token-text-secondary">Referral Earnings</Text>
                  </div>
                  <Text variant="body" className="font-medium text-token-text-primary">
                    {formatCurrency(earningsData.summary.referral_earnings)}
                  </Text>
                </div>
              </div>
            </Card>

            {/* Payout Status */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Payout Status</Text>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text variant="body" className="text-token-text-secondary">Next Payout Date</Text>
                  <Text variant="body" className="font-medium text-token-text-primary">
                    {formatDate(earningsData.payouts.summary.next_payout_date)}
                  </Text>
                </div>
                
                <div className="flex items-center justify-between">
                  <Text variant="body" className="text-token-text-secondary">Minimum Payout</Text>
                  <Text variant="body" className="font-medium text-token-text-primary">
                    {formatCurrency(earningsData.payouts.summary.minimum_payout)}
                  </Text>
                </div>
                
                <div className="flex items-center justify-between">
                  <Text variant="body" className="text-token-text-secondary">Eligible for Payout</Text>
                  <div className="flex items-center">
                    {earningsData.payouts.summary.next_payout_eligible ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <Text variant="body" className={`font-medium ${earningsData.payouts.summary.next_payout_eligible ? 'text-green-600' : 'text-red-600'}`}>
                      {earningsData.payouts.summary.next_payout_eligible ? 'Yes' : 'No'}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Earnings History & Recent Payouts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Earnings */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-token-primary mr-2" />
                  <Text variant="h3" className="text-token-primary">Recent Earnings</Text>
                </div>
                
                <select
                  value={earningType}
                  onChange={(e) => setEarningType(e.target.value)}
                  className="px-3 py-1 border border-token rounded-md bg-token-surface text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="lesson">Lessons</option>
                  <option value="bonus">Bonuses</option>
                  <option value="referral">Referrals</option>
                </select>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {earningsData.earnings.data.length === 0 ? (
                  <Text variant="body" className="text-token-text-secondary text-center py-4">
                    No earnings found
                  </Text>
                ) : (
                  earningsData.earnings.data.slice(0, 10).map((earning) => (
                    <div key={earning.id} className="flex items-center justify-between p-3 border border-token rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${getEarningTypeColor(earning.earning_type)}`}>
                          {getEarningTypeIcon(earning.earning_type)}
                        </div>
                        <div>
                          <Text variant="body" className="font-medium text-token-text-primary">
                            {earning.description}
                          </Text>
                          <Text variant="small" className="text-token-text-muted">
                            {formatDate(earning.earned_at)}
                          </Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text variant="body" className="font-medium text-green-600">
                          +{formatCurrency(earning.amount)}
                        </Text>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-1 ${earning.is_paid ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <Text variant="small" className="text-token-text-muted">
                            {earning.is_paid ? 'Paid' : 'Pending'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recent Payouts */}
            <Card className="p-6 bg-token-surface border border-token">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-token-primary mr-2" />
                <Text variant="h3" className="text-token-primary">Recent Payouts</Text>
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {earningsData.payouts.recent_payouts.length === 0 ? (
                  <Text variant="body" className="text-token-text-secondary text-center py-4">
                    No payouts yet
                  </Text>
                ) : (
                  earningsData.payouts.recent_payouts.slice(0, 10).map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-3 border border-token rounded-lg">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {getPayoutStatusIcon(payout.status)}
                        </div>
                        <div>
                          <Text variant="body" className="font-medium text-token-text-primary">
                            {payout.payment_method.charAt(0).toUpperCase() + payout.payment_method.slice(1)} Payout
                          </Text>
                          <Text variant="small" className="text-token-text-muted">
                            {formatDate(payout.payout_date)}
                          </Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text variant="body" className="font-medium text-token-text-primary">
                          {formatCurrency(payout.amount)}
                        </Text>
                        <Text variant="small" className={`capitalize ${
                          payout.status === 'completed' ? 'text-green-600' :
                          payout.status === 'pending' ? 'text-yellow-600' :
                          payout.status === 'processing' ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {payout.status}
                        </Text>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Monthly Trends */}
          <Card className="p-6 bg-token-surface border border-token">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-token-primary mr-2" />
              <Text variant="h3" className="text-token-primary">Monthly Earnings Trends</Text>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-token">
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Month</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Total</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Lessons</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Bonuses</th>
                    <th className="text-left py-3 px-4 text-token-text-secondary font-medium">Transactions</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsData.trends.monthly_data.map((month, index) => (
                    <tr key={index} className="border-b border-token hover:bg-token-surface-subtle">
                      <td className="py-3 px-4">
                        <Text variant="body" className="font-medium text-token-text-primary">
                          {month.month_name}
                        </Text>
                      </td>
                      <td className="py-3 px-4">
                        <Text variant="body" className="font-medium text-green-600">
                          {formatCurrency(month.total_earnings)}
                        </Text>
                      </td>
                      <td className="py-3 px-4">
                        <Text variant="body" className="text-token-text-primary">
                          {formatCurrency(month.lesson_earnings)}
                        </Text>
                      </td>
                      <td className="py-3 px-4">
                        <Text variant="body" className="text-token-text-primary">
                          {formatCurrency(month.bonus_earnings)}
                        </Text>
                      </td>
                      <td className="py-3 px-4">
                        <Text variant="body" className="text-token-text-primary">
                          {month.transaction_count}
                        </Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Payout Request Modal */}
          {showPayoutModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-token-surface rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <Text variant="h3" className="text-token-primary">
                    Request Payout
                  </Text>
                  <Button variant="outline" size="sm" onClick={() => setShowPayoutModal(false)}>
                    ×
                  </Button>
                </div>
                
                <div className="mb-4">
                  <Text variant="body" className="text-token-text-secondary mb-2">
                    Available Balance: {formatCurrency(earningsData.summary.pending_earnings)}
                  </Text>
                  <Text variant="small" className="text-token-text-muted">
                    Minimum payout: {formatCurrency(earningsData.payouts.summary.minimum_payout)}
                  </Text>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-token-text-secondary mb-2">
                      Payout Amount
                    </label>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="50"
                      max={earningsData.summary.pending_earnings}
                      className="w-full p-3 border border-token rounded-md bg-token-surface"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-token-text-secondary mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-3 border border-token rounded-md bg-token-surface"
                    >
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                      <option value="bank">Bank Transfer</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-token-text-secondary mb-2">
                      Payment Account
                    </label>
                    <input
                      type="text"
                      value={paymentAccount}
                      onChange={(e) => setPaymentAccount(e.target.value)}
                      placeholder={paymentMethod === 'paypal' ? 'PayPal email' : paymentMethod === 'stripe' ? 'Stripe account ID' : 'Bank account details'}
                      className="w-full p-3 border border-token rounded-md bg-token-surface"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setShowPayoutModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handlePayoutRequest} className="flex-1">
                    Request Payout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TutorLayout>
  );
} 