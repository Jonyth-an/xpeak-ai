"use client";

import React, { useState, useEffect } from "react";
import { Card, Text, Button } from '@/app/components/ui';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import { useSearchParams } from 'next/navigation';
import BillingInformationForm from './BillingInformationForm';
import InvoiceHistory from './InvoiceHistory';

interface Subscription {
  id: string;
  status: string;
  current_period_end: string | number;
  current_period_start: string | number;
  cancel_at_period_end: boolean;
  paused_at?: string;
  resume_at?: string;
  pause_duration?: number;
  items: {
    data: Array<{
      current_period_end?: string | number;
      price: {
        id: string;
        unit_amount: number;
        currency: string;
        recurring: {
          interval: string;
        };
      };
    }>;
  };
  start_date: string | number;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: string | number;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
}

interface BillingData {
  subscription: Subscription;
  customer: Customer;
  paymentMethod?: PaymentMethod;
  invoices: Invoice[];
}

export default function BillingSection() {
  const { user, session } = useAuth();
  const searchParams = useSearchParams();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [cancelType, setCancelType] = useState<'immediate' | 'end_of_period'>('end_of_period');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showBillingInfoModal, setShowBillingInfoModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [pauseDuration, setPauseDuration] = useState(1);
  const [cancelingPause, setCancelingPause] = useState(false);
  const [changingPlan, setChangingPlan] = useState(false);
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [credits, setCredits] = useState<any[]>([]);
  const [totalCredit, setTotalCredit] = useState(0);
  const [loadingCredits, setLoadingCredits] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Check for success parameter in URL
    const success = searchParams.get('success');
    const planChange = searchParams.get('planChange');
    
    if (success === 'true') {
      setShowSuccessMessage(true);
      setSuccessMessage(planChange === 'true' ? 'Plan changed successfully!' : 'Payment successful!');
      
      // Remove the success parameter from URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete('success');
      url.searchParams.delete('planChange');
      window.history.replaceState({}, '', url.toString());
      
      // Auto-hide success message after 10 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);
    }
    
    fetchBillingData();
    fetchCredits();
  }, [user, searchParams, session]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        // Clean up URL by removing the success parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('success');
        window.history.replaceState({}, '', url.toString());
      }, 10000); // Changed from 5000 to 10000 (10 seconds)

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const fetchBillingData = async () => {
    if (!user || !session) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/billing/subscription', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch billing data');
      }
      
      const data = await response.json();
      setBillingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCredits = async () => {
    if (!session?.access_token) return;
    
    try {
      setLoadingCredits(true);
      const response = await fetch('/api/billing/credits', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits || []);
        setTotalCredit(data.totalCredit || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    if (!user || !session) return;
    
    setUpdatingPayment(true);
    try {
      const response = await fetch('/api/billing/update-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment update session');
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment method');
      setUpdatingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !session) return;
    
    setCanceling(true);
    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ cancelType }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }
      
      const result = await response.json();
      setShowCancelModal(false);
      setError(null);
      
      // Refresh billing data to show updated status
      await fetchBillingData();
      
      // Show success message
      setSuccessMessage(result.message);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!user || !session) return;
    
    setReactivating(true);
    try {
      const response = await fetch('/api/billing/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reactivate subscription');
      }
      
      const result = await response.json();
      setError(null);
      
      // Refresh billing data to show updated status
      await fetchBillingData();
      
      // Show success message
      setSuccessMessage(result.message);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate subscription');
    } finally {
      setReactivating(false);
    }
  };

  const handlePauseSubscription = async () => {
    try {
      setPausing(true);
      setError(null);
      
      const response = await fetch('/api/billing/pause-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ pauseDuration }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to pause subscription');
      }

      const result = await response.json();
      console.log('Subscription paused successfully:', result);
      
      // Close modal and refresh data
      setShowPauseModal(false);
      await fetchBillingData();
      
      // Show success message
      setSuccessMessage(result.message);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 10000);
      
    } catch (error) {
      console.error('Error pausing subscription:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to pause subscription';
      setError(errorMessage);
      
      // If the error is about already being paused, refresh the data to update the UI
      if (errorMessage.includes('already paused')) {
        await fetchBillingData();
      }
    } finally {
      setPausing(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!user || !session) return;
    
    setResuming(true);
    try {
      const response = await fetch('/api/billing/resume-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to resume subscription');
      }
      
      const result = await response.json();
      setError(null);
      
      // Close modal if open and refresh billing data to show updated status
      setShowPauseModal(false);
      await fetchBillingData();
      
      // Show success message
      setSuccessMessage(result.message);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume subscription');
    } finally {
      setResuming(false);
    }
  };

  const handleUpgradeDowngrade = async () => {
    if (!user || !session) return;
    
    // For now, let's redirect to pricing page with current plan
    // In the future, we can implement a modal to select the new plan
    const currentPlanId = getCurrentPlanId();
    window.location.href = `/pricing?currentPlan=${currentPlanId}`;
  };

  const handleChangeSubscription = async (newPriceId: string) => {
    try {
      setChangingPlan(true);
      
      const response = await fetch('/api/billing/change-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ newPriceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change subscription');
      }

      // Show success message with proration details
      const prorationMessage = data.proration.isDowngrade 
        ? `Successfully downgraded! ${data.proration.credit ? `Credit of ${formatCurrency(data.proration.credit.amount, 'usd')} applied for ${data.proration.credit.days} days.` : ''}`
        : `Successfully upgraded! ${data.proration.amount > 0 ? `Additional charge of ${formatCurrency(data.proration.amount, 'usd')} applied.` : 'No additional charge.'}`;

      setSuccessMessage(prorationMessage);
      setShowSuccessMessage(true);
      
      // Refresh billing data
      await fetchBillingData();
      
      // Close any open modals
      setShowPauseModal(false);
      
    } catch (error) {
      console.error('Error changing subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to change subscription');
      setShowErrorBanner(true);
    } finally {
      setChangingPlan(false);
    }
  };

  const getCurrentPlanId = (): string => {
    if (!currentPlan) return 'free';
    
    // Map Stripe price IDs to plan IDs
    const priceId = currentPlan;
    const priceIdMap: { [key: string]: string } = {
      'price_1RessSFM2iXH8TuN4U2vQz9E': 'plus',    // Plus Monthly
      'price_1Ret11FM2iXH8TuNdLCrRIxK': 'plus',    // Plus Quarterly
      'price_1Ret1bFM2iXH8TuNClhnN7c2': 'plus',    // Plus Yearly
      'price_1Rest1FM2iXH8TuNKvbhbeTG': 'pro',     // Pro Monthly
      'price_1Ret29FM2iXH8TuNKl7fICBr': 'pro',     // Pro Quarterly
      'price_1Ret2RFM2iXH8TuNYQIQk9BU': 'pro',     // Pro Yearly
    };
    
    return priceIdMap[priceId] || 'free';
  };

  const formatDate = (timestamp: number | string) => {
    let date: Date;
    
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp * 1000);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getCardBrandIcon = (brand: string) => {
    const brandMap: { [key: string]: string } = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      jcb: '💳',
      diners: '💳',
    };
    return brandMap[brand.toLowerCase()] || '💳';
  };

  const handleCancelPause = async () => {
    try {
      setCancelingPause(true);
      
      const response = await fetch('/api/billing/cancel-pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel pause');
      }

      const result = await response.json();
      console.log('Pause cancelled successfully:', result);
      
      // Close modal and refresh billing data
      setShowPauseModal(false);
      await fetchBillingData();
      
      // Show success message
      setSuccessMessage(result.message);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 10000);
      
    } catch (error) {
      console.error('Error canceling pause:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel pause');
    } finally {
      setCancelingPause(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-12">
          <Text variant="h3" as="h3" className="mb-2">
            Billing & Subscription
          </Text>
          <Text variant="body" className="text-gray-600">
            Loading your billing information...
          </Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-12">
          <Text variant="h3" as="h3" className="mb-2">
            Billing & Subscription
          </Text>
          <Text variant="body" className="text-red-600">
            Error: {error}
          </Text>
          <Button onClick={fetchBillingData} variant="primary" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-12">
          <Text variant="h3" as="h3" className="mb-2">
            Billing & Subscription
          </Text>
          <Text variant="body" className="text-gray-600">
            No active subscription found.
          </Text>
        </div>
      </div>
    );
  }

  const { subscription, customer, paymentMethod, invoices } = billingData || {};
  const isCanceled = subscription?.cancel_at_period_end || false;
  const currentPlanPrice = subscription?.items?.data?.[0]?.price;
  const currentPlan = currentPlanPrice?.id;
  const isActive = subscription?.status === 'active';
  
  // Check if subscription is paused by looking for pause information
  const isPaused = subscription?.paused_at && subscription?.resume_at;
  const subscriptionPauseDuration = subscription?.pause_duration || 1;

  // Get renewal date - try subscription level first, then fallback to subscription item
  const renewalDate = subscription?.current_period_end || 
                     subscription?.items?.data?.[0]?.current_period_end;
  
  // Debug logging
  console.log('Subscription data:', {
    status: subscription?.status,
    current_period_end: subscription?.current_period_end,
    item_current_period_end: subscription?.items?.data?.[0]?.current_period_end,
    renewalDate,
    isCanceled
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <Text variant="h3" as="h3" className="mb-2">
          Billing & Subscription
        </Text>
        <Text variant="body" className="text-gray-600">
          Manage your subscription, payment methods, and billing information
        </Text>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-green-600 text-xl">✅</div>
            <div className="flex-1">
              <Text className="font-medium text-green-800">
                {successMessage || 'Action completed successfully!'}
              </Text>
            </div>
            <button
              className="ml-4 text-green-700 hover:text-green-900"
              onClick={() => setShowSuccessMessage(false)}
              aria-label="Dismiss success message"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Billing Address Section */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Text variant="h5">Billing Information</Text>
          <Button size="sm" variant="outline" onClick={() => setShowBillingInfoModal(true)}>
            Edit
          </Button>
        </div>
        <div className="text-gray-700 text-sm">
          {billingData?.customer?.address ? (
            <div className="space-y-2">
              {billingData.customer.name && (
                <div>
                  <span className="font-medium">Name:</span> {billingData.customer.name}
                </div>
              )}
              {billingData.customer.email && (
                <div>
                  <span className="font-medium">Email:</span> {billingData.customer.email}
                </div>
              )}
              {billingData.customer.address.line1 && (
                <div>
                  <span className="font-medium">Address:</span> {billingData.customer.address.line1}
                </div>
              )}
              {billingData.customer.address.line2 && (
                <div className="ml-4">{billingData.customer.address.line2}</div>
              )}
              {(billingData.customer.address.city || billingData.customer.address.state || billingData.customer.address.postal_code) && (
                <div>
                  <span className="font-medium">Location:</span> {
                    [
                      billingData.customer.address.city,
                      billingData.customer.address.state,
                      billingData.customer.address.postal_code
                    ].filter(Boolean).join(', ')
                  }
                </div>
              )}
              {billingData.customer.address.country && (
                <div>
                  <span className="font-medium">Country:</span> {billingData.customer.address.country}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-gray-500">
              <span>📍</span>
              <span>No billing address on file.</span>
            </div>
          )}
        </div>
      </Card>

      {/* Billing Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
        {/* Current Plan Section */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
              <p className="text-sm text-gray-600">Your active subscription details</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                isPaused ? 'bg-blue-100 text-blue-800' : isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isPaused ? 'Paused' : isActive ? 'Active' : 'Inactive'}
              </span>
              {isCanceled && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Canceling
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">
                  {currentPlanPrice ? `${formatCurrency(currentPlanPrice.unit_amount, currentPlanPrice.currency)}/${currentPlanPrice.recurring.interval}` : 'Plan'}
                </h3>
                <p className="text-sm text-gray-600">
                  {subscription?.status === 'canceled' ? 'Access until' : isCanceled ? 'Renews until' : 'Renews'} {renewalDate ? formatDate(renewalDate) : '—'}
                </p>
                {isPaused && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800 font-medium">
                      ⏸️ Subscription Paused
                    </p>
                    <p className="text-sm text-blue-700">
                      Paused on {billingData.subscription.paused_at ? 
                        formatDate(billingData.subscription.paused_at) : '—'
                      } for {subscriptionPauseDuration} month{subscriptionPauseDuration > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-blue-700">
                      Resumes on {billingData.subscription.resume_at ? 
                        formatDate(billingData.subscription.resume_at) : '—'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Credits Section */}
          {totalCredit > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Available Credits</h2>
                  <p className="text-sm text-gray-600">Credits from subscription changes</p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-800">
                      {formatCurrency(totalCredit, 'usd')} available
                    </p>
                    <p className="text-sm text-green-600">
                      {credits.length} credit{credits.length !== 1 ? 's' : ''} • Expires within 30 days
                    </p>
                  </div>
                  <div className="text-green-600 text-2xl">💰</div>
                </div>
                
                {credits.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {credits.slice(0, 3).map((credit) => (
                      <div key={credit.id} className="flex justify-between text-sm">
                        <span className="text-green-700">
                          {formatCurrency(credit.amount, credit.currency)}
                        </span>
                        <span className="text-green-600">
                          Expires {formatDate(credit.expires_at)}
                        </span>
                      </div>
                    ))}
                    {credits.length > 3 && (
                      <p className="text-xs text-green-600">
                        +{credits.length - 3} more credit{credits.length - 3 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Subscription Actions */}
          <div className="mt-4 flex space-x-3">
            {isCanceled ? (
              <Button
                onClick={handleReactivateSubscription}
                disabled={reactivating}
                variant="primary"
                size="sm"
              >
                {reactivating ? 'Reactivating...' : 'Reactivate Subscription'}
              </Button>
            ) : isPaused ? (
              <>
                <Button
                  onClick={handleResumeSubscription}
                  disabled={resuming}
                  variant="primary"
                  size="sm"
                >
                  {resuming ? 'Resuming...' : 'Resume Subscription'}
                </Button>
                <Button
                  onClick={() => setShowPauseModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50 focus:ring-blue-500"
                >
                  Manage Pause
                </Button>
                <Button
                  onClick={() => setShowCancelModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-600 hover:bg-red-50 focus:ring-red-500"
                >
                  Cancel Subscription
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleUpgradeDowngrade}
                  variant="primary"
                  size="sm"
                  disabled={changingPlan}
                >
                  {changingPlan ? 'Changing Plan...' : 'Upgrade/Downgrade'}
                </Button>
                <Button
                  onClick={() => setShowPauseModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500"
                >
                  Pause Subscription
                </Button>
                <Button
                  onClick={() => setShowCancelModal(true)}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-600 hover:bg-red-50 focus:ring-red-500"
                >
                  Cancel Subscription
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Payment Method Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              <p className="text-sm text-gray-600">Your current payment method</p>
            </div>
            <Button
              onClick={handleUpdatePaymentMethod}
              disabled={updatingPayment}
              variant="secondary"
              size="sm"
            >
              {updatingPayment ? 'Updating...' : 'Update Payment Method'}
            </Button>
          </div>
          
          {paymentMethod ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCardBrandIcon(paymentMethod.card?.brand || 'card')}</span>
                <div>
                  <p className="font-medium text-gray-900">
                    {paymentMethod.card?.brand?.toUpperCase()} •••• {paymentMethod.card?.last4}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expires {paymentMethod.card?.exp_month}/{paymentMethod.card?.exp_year}
                  </p>
                </div>
              </div>
              {/* Security Notice */}
              <div className="text-sm text-gray-500 mt-2">
                🔒 Your payment information is securely processed by Stripe. 
                We only store the last 4 digits and expiry date for display purposes.
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-sm text-yellow-800">
                  No payment method on file. Please add a payment method to continue your subscription.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Invoice History Section */}
        <section>
          <InvoiceHistory />
        </section>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancel Subscription
            </h3>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                How would you like to cancel your subscription?
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="cancelType"
                    value="end_of_period"
                    checked={cancelType === 'end_of_period'}
                    onChange={() => setCancelType('end_of_period')}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Cancel at period end</p>
                    <p className="text-sm text-gray-600">
                      Keep access until {renewalDate ? formatDate(renewalDate) : '—'}
                    </p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="cancelType"
                    value="immediate"
                    checked={cancelType === 'immediate'}
                    onChange={() => setCancelType('immediate')}
                    className="text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Cancel immediately</p>
                    <p className="text-sm text-gray-600">
                      Lose access right away (no refund)
                    </p>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleCancelSubscription}
                disabled={canceling}
                variant="outline"
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50 focus:ring-red-500"
              >
                {canceling ? 'Canceling...' : 'Cancel Subscription'}
              </Button>
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Keep Subscription
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Subscription Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {isPaused ? (
              // Show pause status and cancel pause option
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Subscription Paused
                </h3>
                
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-blue-600">⏸️</span>
                      <p className="font-medium text-blue-900">Currently Paused</p>
                    </div>
                    <p className="text-sm text-blue-800">
                      Your subscription is paused for {subscriptionPauseDuration} month{subscriptionPauseDuration > 1 ? 's' : ''}.
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      Paused on: {billingData.subscription.paused_at ? formatDate(billingData.subscription.paused_at) : '—'}
                    </p>
                    <p className="text-sm text-blue-800">
                      Will resume on: {billingData.subscription.resume_at ? formatDate(billingData.subscription.resume_at) : '—'}
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    You can cancel the pause to resume your subscription immediately, or wait for it to automatically resume.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleCancelPause}
                    disabled={cancelingPause}
                    variant="primary"
                    className="flex-1"
                  >
                    {cancelingPause ? 'Canceling...' : 'Cancel Pause & Resume'}
                  </Button>
                  <Button
                    onClick={() => setShowPauseModal(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Keep Paused
                  </Button>
                </div>
              </>
            ) : (
              // Show pause options for active subscription
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pause Subscription
                </h3>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Temporarily pause your subscription. You won't be charged during the pause period, but you'll maintain access to your current features.
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pause Duration
                    </label>
                    <select
                      value={pauseDuration}
                      onChange={(e) => setPauseDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>1 month</option>
                      <option value={2}>2 months</option>
                      <option value={3}>3 months</option>
                    </select>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Your subscription will automatically resume on{' '}
                      {(() => {
                        const resumeDate = new Date();
                        resumeDate.setMonth(resumeDate.getMonth() + pauseDuration);
                        return resumeDate.toLocaleDateString();
                      })()}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handlePauseSubscription}
                    disabled={pausing}
                    variant="outline"
                    className="flex-1 border-yellow-500 text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500"
                  >
                    {pausing ? 'Pausing...' : 'Pause Subscription'}
                  </Button>
                  <Button
                    onClick={() => setShowPauseModal(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Keep Active
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Billing Information Modal */}
      {showBillingInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowBillingInfoModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <BillingInformationForm
              isOpen={true}
              initialData={billingData ? {
                name: billingData.customer?.name,
                email: billingData.customer?.email,
                address: billingData.customer?.address
              } : undefined}
              onCancel={() => setShowBillingInfoModal(false)}
              onSave={async () => {
                setShowBillingInfoModal(false);
                await fetchBillingData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 