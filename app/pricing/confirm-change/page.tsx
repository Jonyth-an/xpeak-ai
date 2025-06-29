'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Layout from '../../../components/Layout';
import { Button, Card, Text, Badge } from '@/app/components/ui';

interface PlanChangeDetails {
  currentPlan: string;
  newPlan: string;
  currentBillingCycle: string;
  newBillingCycle: string;
  prorationAmount: number;
  creditAmount: number;
  additionalCharge: number;
  nextBillingDate: string;
  currentPlanPrice: number;
  newPlanPrice: number;
  isCrossCycleChange: boolean;
}

export default function ConfirmPlanChangePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changeDetails, setChangeDetails] = useState<PlanChangeDetails | null>(null);

  const newPlanId = searchParams.get('plan');
  const newBillingCycle = searchParams.get('cycle') || 'monthly';
  const currentPlan = searchParams.get('currentPlan');
  const currentBillingCycle = searchParams.get('currentCycle') || 'monthly';

  useEffect(() => {
    if (!user || !session) {
      router.push('/login');
      return;
    }

    if (!newPlanId || !currentPlan) {
      router.push('/pricing');
      return;
    }

    // Calculate plan change details
    calculatePlanChange();
  }, [user, session, newPlanId, currentPlan, newBillingCycle, currentBillingCycle]);

  const calculatePlanChange = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current subscription details
      const subscriptionResponse = await fetch('/api/billing/subscription', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!subscriptionResponse.ok) {
        throw new Error('Failed to fetch current subscription');
      }

      const subscriptionData = await subscriptionResponse.json();

      // Get credits
      const creditsResponse = await fetch('/api/billing/credits', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      const creditsData = creditsResponse.ok ? await creditsResponse.json() : { credits: 0 };

      // Calculate plan prices
      const planPrices = {
        'plus': { monthly: 14.99, quarterly: 40.47, yearly: 143.90 },
        'pro': { monthly: 24.99, quarterly: 67.47, yearly: 239.90 }
      };

      const currentPlanPrice = planPrices[currentPlan as keyof typeof planPrices]?.[currentBillingCycle as keyof typeof planPrices.plus] || 0;
      const newPlanPrice = planPrices[newPlanId as keyof typeof planPrices]?.[newBillingCycle as keyof typeof planPrices.plus] || 0;

      // Calculate proration (simplified - in real implementation, this would use the proration calculator)
      const priceDifference = Math.round((newPlanPrice - currentPlanPrice) * 100) / 100;
      const isUpgrade = priceDifference > 0;
      const isDowngrade = priceDifference < 0;
      const isCrossCycleChange = currentPlan === newPlanId && currentBillingCycle !== newBillingCycle;

      const details: PlanChangeDetails = {
        currentPlan: (currentPlan || '').charAt(0).toUpperCase() + (currentPlan || '').slice(1),
        newPlan: (newPlanId || '').charAt(0).toUpperCase() + (newPlanId || '').slice(1),
        currentBillingCycle: currentBillingCycle.charAt(0).toUpperCase() + currentBillingCycle.slice(1),
        newBillingCycle: newBillingCycle.charAt(0).toUpperCase() + newBillingCycle.slice(1),
        prorationAmount: Math.abs(priceDifference),
        creditAmount: isDowngrade ? Math.abs(priceDifference) : 0,
        additionalCharge: isUpgrade ? priceDifference : 0,
        nextBillingDate: subscriptionData.nextBillingDate || 'Next billing cycle',
        currentPlanPrice,
        newPlanPrice,
        isCrossCycleChange
      };

      setChangeDetails(details);
    } catch (error) {
      console.error('Error calculating plan change:', error);
      setError('Failed to calculate plan change details');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChange = async () => {
    if (!changeDetails) return;

    try {
      setLoading(true);
      setError(null);

      // Map plan ID and billing cycle to Stripe price ID
      const priceIdMap: { [key: string]: { [key: string]: string } } = {
        'plus': {
          'monthly': 'price_1RessSFM2iXH8TuN4U2vQz9E',
          'quarterly': 'price_1Ret11FM2iXH8TuNdLCrRIxK',
          'yearly': 'price_1Ret1bFM2iXH8TuNClhnN7c2',
        },
        'pro': {
          'monthly': 'price_1Rest1FM2iXH8TuNKvbhbeTG',
          'quarterly': 'price_1Ret29FM2iXH8TuNKl7fICBr',
          'yearly': 'price_1Ret2RFM2iXH8TuNYQIQk9BU',
        },
      };
      
      const newPriceId = priceIdMap[newPlanId!]?.[newBillingCycle];
      if (!newPriceId) {
        throw new Error('Invalid plan selected');
      }

      const response = await fetch('/api/billing/change-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ newPriceId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change subscription');
      }
      
      const result = await response.json();
      
      // Redirect to billing page with success message
      const redirectUrl = `/profile?tab=billing&success=true&planChange=true`;
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Error changing subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to change subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile?tab=billing');
  };

  if (loading && !changeDetails) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Text>Calculating plan change details...</Text>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !changeDetails) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Text className="text-red-600 mb-4">{error}</Text>
            <Button onClick={() => router.push('/profile?tab=billing')}>
              Back to Billing
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!changeDetails) {
    return null;
  }

  const isUpgrade = changeDetails.additionalCharge > 0;
  const isDowngrade = changeDetails.creditAmount > 0;
  const isSamePlan = changeDetails.currentPlan === changeDetails.newPlan;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Confirm Plan Change
            </h1>
            <p className="text-lg text-gray-600">
              {changeDetails.isCrossCycleChange 
                ? `You're changing your billing cycle from ${changeDetails.currentBillingCycle} to ${changeDetails.newBillingCycle}`
                : isSamePlan 
                  ? `You're staying on the ${changeDetails.newPlan} plan`
                  : `You're changing from ${changeDetails.currentPlan} to ${changeDetails.newPlan}`
              }
            </p>
          </div>

          <Card className="p-6 mb-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Text className="text-gray-600">Current Plan:</Text>
                <Text className="font-semibold">
                  {changeDetails.currentPlan} ({changeDetails.currentBillingCycle})
                </Text>
              </div>
              
              <div className="flex justify-between items-center">
                <Text className="text-gray-600">New Plan:</Text>
                <Text className="font-semibold">
                  {changeDetails.newPlan} ({changeDetails.newBillingCycle})
                </Text>
              </div>
              
              <div className="flex justify-between items-center">
                <Text className="text-gray-600">Current Price:</Text>
                <Text className="font-semibold">${changeDetails.currentPlanPrice}</Text>
              </div>
              
              <div className="flex justify-between items-center">
                <Text className="text-gray-600">New Price:</Text>
                <Text className="font-semibold">${changeDetails.newPlanPrice}</Text>
              </div>
              
              <hr className="my-4" />
              
              {isUpgrade && (
                <div className="flex justify-between items-center">
                  <Text className="text-gray-600">Additional Charge:</Text>
                  <Text className="font-semibold text-green-600">
                    +${changeDetails.additionalCharge}
                  </Text>
                </div>
              )}
              
              {isDowngrade && (
                <div className="flex justify-between items-center">
                  <Text className="text-gray-600">Credit Applied:</Text>
                  <Text className="font-semibold text-blue-600">
                    -${changeDetails.creditAmount}
                  </Text>
                </div>
              )}
              
              {!isUpgrade && !isDowngrade && (
                <div className="flex justify-between items-center">
                  <Text className="text-gray-600">Price Difference:</Text>
                  <Text className="font-semibold text-gray-600">No change</Text>
                </div>
              )}
            </div>
          </Card>

          {changeDetails.isCrossCycleChange && (
            <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <Text className="text-sm text-blue-800">
                    <strong>Billing Cycle Change:</strong> You're changing your billing cycle from {changeDetails.currentBillingCycle} to {changeDetails.newBillingCycle}. 
                    This will affect your billing schedule and may result in prorated charges or credits.
                  </Text>
                </div>
              </div>
            </Card>
          )}

          <div className="flex space-x-4">
            <Button
              onClick={handleCancel}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmChange}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Confirm Change'}
            </Button>
          </div>

          {error && (
            <div className="mt-4 text-center">
              <Text className="text-red-600">{error}</Text>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 