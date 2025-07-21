'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
import { 
  Card, 
  Text, 
  Button, 
  TutorPageLayout, 
  TutorPageHeader, 
  MetricsGrid, 
  LoadingState, 
  ErrorState 
} from '@/app/components/ui';
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
  RefreshCw,
  BarChart3
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
      pending_amount: number;
      available_amount: number;
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
  overview: {
    total_earnings: number;
    current_month_earnings: number;
  };
  breakdown?: {
    lesson_earnings: number;
    bonus_earnings: number;
    referral_earnings: number;
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
      case 'lesson': return 'text-primary bg-primary/20';
      case 'bonus': return 'text-token-success bg-token-success/20';
      case 'referral': return 'text-accent bg-accent/20';
      default: return 'text-token-text-secondary bg-token-surface-accent';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-token-success" />;
      case 'pending': return <Clock className="w-4 h-4 text-token-warning" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-primary" />;
      case 'failed': return <XCircle className="w-4 h-4 text-token-error" />;
      default: return <AlertCircle className="w-4 h-4 text-token-text-secondary" />;
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
        <TutorPageLayout containerWidth="xl" padding="lg">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <Text variant="body" className="text-token-text-secondary">Loading earnings data...</Text>
            </div>
          </div>
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  if (error || !earningsData) {
    return (
      <TutorLayout>
        <TutorPageLayout containerWidth="xl" padding="lg">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <Text variant="h2" className="text-token-error mb-2">Unable to Load Earnings</Text>
              <Text variant="body" className="text-token-text-secondary mb-4">{error || 'No earnings data available'}</Text>
              <Button variant="primary" onClick={fetchEarningsData}>Retry</Button>
            </div>
          </div>
        </TutorPageLayout>
      </TutorLayout>
    );
  }

  const metrics = [
    {
      title: 'Total Earnings',
      value: `$${earningsData?.overview?.total_earnings || '0.00'}`,
      icon: <DollarSign className="w-6 h-6" />,
      iconBgColor: 'bg-token-success/20',
      iconColor: 'text-token-success'
    },
    {
      title: 'This Month',
      value: `$${earningsData?.overview?.current_month_earnings || '0.00'}`,
      icon: <TrendingUp className="w-6 h-6" />,
      iconBgColor: 'bg-primary/20',
      iconColor: 'text-primary'
    },
    {
      title: 'Pending Payouts',
      value: `$${earningsData?.payouts?.summary?.pending_amount || '0.00'}`,
      icon: <Clock className="w-6 h-6" />,
      iconBgColor: 'bg-accent/20',
      iconColor: 'text-accent'
    },
    {
      title: 'Next Payout',
      value: earningsData?.payouts?.summary?.next_payout_date ? formatDate(earningsData.payouts.summary.next_payout_date) : 'TBD',
      icon: <Calendar className="w-6 h-6" />,
      iconBgColor: 'bg-token-warning/20',
      iconColor: 'text-token-warning'
    }
  ];

  return (
    <TutorLayout>
      <TutorPageLayout containerWidth="xl" padding="lg">
        <TutorPageHeader
          title="Earnings Dashboard"
          subtitle="Track your income, payouts, and financial performance"
          titleVariant="h1"
          subtitleVariant="body"
          actions={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-token-success/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-token-success" />
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-surface text-token-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                aria-label="Select time range"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          }
        />

        {/* Key Metrics Cards */}
        <MetricsGrid 
          metrics={metrics} 
          columns={4} 
          className="mb-8"
          cardVariant="default"
          cardPadding="lg"
        />

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Earnings Overview */}
          <Card className="p-6 rounded-xl shadow-sm" variant="default">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <Text variant="h3" className="text-token-text font-semibold">Earnings Breakdown</Text>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <Text variant="body" className="text-token-text-secondary">Lesson Earnings</Text>
                </div>
                <Text variant="body" className="font-semibold text-primary">
                  ${earningsData?.breakdown?.lesson_earnings || '0.00'}
                </Text>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-token-success/5 rounded-lg border border-token-success/20">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-token-success/20 rounded-full flex items-center justify-center mr-3">
                    <TrendingUp className="w-4 h-4 text-token-success" />
                  </div>
                  <Text variant="body" className="text-token-text-secondary">Bonus Earnings</Text>
                </div>
                <Text variant="body" className="font-semibold text-token-success">
                  ${earningsData?.breakdown?.bonus_earnings || '0.00'}
                </Text>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border border-accent/20">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center mr-3">
                    <ArrowUpRight className="w-4 h-4 text-accent" />
                  </div>
                  <Text variant="body" className="text-token-text-secondary">Referral Earnings</Text>
                </div>
                <Text variant="body" className="font-semibold text-accent">
                  ${earningsData?.breakdown?.referral_earnings || '0.00'}
                </Text>
              </div>
            </div>
          </Card>

          {/* Payout Status */}
          <Card className="p-6 rounded-xl shadow-sm" variant="default">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4 text-accent" />
              </div>
              <Text variant="h3" className="text-token-text font-semibold">Payout Status</Text>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-token-surface-accent rounded-lg border border-border">
                <div className="flex items-center justify-between mb-3">
                  <Text variant="body" className="text-token-text-secondary font-medium">Next Payout Eligible</Text>
                  <div className="flex items-center">
                    {earningsData?.payouts?.summary?.next_payout_eligible ? (
                      <CheckCircle className="w-4 h-4 text-token-success mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 text-token-error mr-1" />
                    )}
                    <Text variant="body" className={`font-semibold ${earningsData?.payouts?.summary?.next_payout_eligible ? 'text-token-success' : 'text-token-error'}`}>
                      {earningsData?.payouts?.summary?.next_payout_eligible ? 'Yes' : 'No'}
                    </Text>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Text variant="body" className="text-token-text-secondary font-medium">Available Amount</Text>
                  <Text variant="body" className="font-bold text-token-text">
                    ${earningsData?.payouts?.summary?.available_amount || '0.00'}
                  </Text>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowPayoutModal(true)}
                disabled={!earningsData?.payouts?.summary?.next_payout_eligible}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Earnings */}
          <Card className="p-6 rounded-xl shadow-sm" variant="default">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-token-success/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-token-success" />
                </div>
                <Text variant="h3" className="text-token-text font-semibold">Recent Earnings</Text>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {(!earningsData?.earnings?.recent || earningsData.earnings.recent.length === 0) ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-token-text-muted/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-token-text-muted" />
                  </div>
                  <Text variant="body" className="text-token-text-secondary">
                    No recent earnings
                  </Text>
                </div>
              ) : (
                earningsData.earnings.recent.slice(0, 5).map((earning, index) => (
                  <div key={index} className="p-4 bg-token-surface-accent rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEarningTypeColor(earning.type)}`}>
                            {earning.type}
                          </span>
                        </div>
                        <div>
                          <Text variant="body" className="font-semibold text-token-text mb-1">
                            {earning.description || 'Lesson Payment'}
                          </Text>
                          <Text variant="small" className="text-token-text-muted">
                            {formatDate(earning.date)}
                          </Text>
                        </div>
                      </div>
                      <div className="text-right">
                        <Text variant="body" className="font-semibold text-token-success">
                          +${earning.amount || '0.00'}
                        </Text>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-1 ${earning.is_paid ? 'bg-token-success' : 'bg-token-warning'}`}></div>
                          <Text variant="small" className="text-token-text-muted">
                            {earning.is_paid ? 'Paid' : 'Pending'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Payouts */}
          <Card className="p-6 rounded-xl" variant="default">
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
                        {getStatusIcon(payout.status)}
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
                        payout.status === 'completed' ? 'text-token-success' :
                        payout.status === 'pending' ? 'text-token-warning' :
                        payout.status === 'processing' ? 'text-primary' :
                        'text-token-error'
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
        <Card className="p-6 rounded-xl" variant="default">
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
                      <Text variant="body" className="font-medium text-token-success">
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
          <div className="fixed inset-0 bg-token-overlay flex items-center justify-center z-50">
            <div className="bg-token-surface rounded-xl p-6 w-full max-w-md">
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
                  Available Balance: {formatCurrency(earningsData?.summary?.pending_earnings || 0)}
                </Text>
                <Text variant="small" className="text-token-text-muted">
                  Minimum payout: {formatCurrency(earningsData?.payouts?.summary?.minimum_payout || 0)}
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
                    max={earningsData?.summary?.pending_earnings || 0}
                    className="w-full p-3 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-token-text-secondary mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
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
                    className="w-full p-3 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
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
      </TutorPageLayout>
    </TutorLayout>
  );
} 