'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, Text, Button } from '@/app/components/ui';

function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Verify the session and get subscription details
    const verifySession = async () => {
      try {
        const response = await fetch('/api/billing/subscription', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.subscription) {
            setSubscriptionDetails(data);
          }
        }
      } catch (err) {
        console.error('Error verifying session:', err);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleGoToBilling = () => {
    // Check if this was a plan change by looking at the subscription metadata
    const isPlanChange = subscriptionDetails?.subscription?.metadata?.change_type === 'upgrade_downgrade';
    
    // Redirect to billing tab with appropriate success message
    const redirectUrl = isPlanChange 
      ? '/profile/billing?success=true&planChange=true'
      : '/profile/billing?success=true';RedirecttobillingtabwithappropriatesuccessmessageconstredirectUrlisPlanChange
    
    window.location.href = redirectUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-token-surface">
        <div className="max-w-lg w-full py-20 px-6 sm:px-10 bg-token-elevated rounded-lg shadow text-center border border-token">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-accent mx-auto mb-4"></div>
          <Text className="text-lg text-token-primary">Verifying your payment...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-token-surface">
        <div className="max-w-lg w-full py-20 px-6 sm:px-10 bg-token-elevated rounded-lg shadow text-center border border-token">
          <div className="text-token-error text-6xl mb-4">⚠️</div>
          <Text as="h1" className="text-2xl font-bold mb-4 text-token-error">Payment Verification Failed</Text>
          <Text className="mb-6 text-token-secondary">{error}</Text>
          <div className="space-y-3">
            <Button onClick={handleGoToDashboard} variant="primary" className="w-full">
              Go to Dashboard
            </Button>
            <Button onClick={handleGoToBilling} variant="secondary" className="w-full">
              Check Billing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-token-surface">
      <div className="max-w-lg w-full py-20 px-6 sm:px-10 bg-token-elevated rounded-lg shadow text-center border border-token">
        <div className="text-token-success text-6xl mb-4">✅</div>
        <Text as="h1" className="text-3xl font-bold mb-4 text-token-success">Payment Successful!</Text>
        <Text className="mb-6 text-token-secondary">
          Thank you for subscribing to Xpeak AI. Your payment was processed successfully.
        </Text>
        
        {subscriptionDetails && (
          <Card className="mb-6 p-4 bg-token-surface border border-token">
            <Text className="text-sm text-token-tertiary mb-2">Subscription Details:</Text>
            <Text className="font-medium text-token-primary">
              {subscriptionDetails.subscription?.items?.data?.[0]?.price?.unit_amount 
                ? `$${(subscriptionDetails.subscription.items.data[0].price.unit_amount / 100).toFixed(2)}/month`
                : 'Active Subscription'
              }
            </Text>
          </Card>
        )}

        <div className="space-y-3">
          <Button onClick={handleGoToBilling} variant="primary" className="w-full">
            Go to Billing
          </Button>
          <Button onClick={handleGoToDashboard} variant="secondary" className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <Suspense>
      <CheckoutSuccessInner />
    </Suspense>
  );
} 