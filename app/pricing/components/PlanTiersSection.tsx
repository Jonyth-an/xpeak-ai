'use client';
import React, { useState, useEffect, Suspense } from "react";
import { Button, Badge, ToggleGroup, Card, Text } from "@/app/components/ui";
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

const plans = [
  {
    id: "free",
    name: "Xpeak Free",
    price: 0,
    priceLabel: "Free",
    priceSuffix: "",
    description: "Try AI-powered English learning at your own pace.",
    features: [
      "60 minutes of AI conversation per month",
      "Access to Word Maze vocabulary tool",
      "Co-create 2 custom topics per month",
      "Save progress & vocabulary"
    ],
    cta: "Great for exploring",
    highlight: false
  },
  {
    id: "plus",
    name: "Xpeak Plus",
    monthlyPrice: 14.99,
    quarterlyPrice: 40.47, // ~3 months at $13.49/month
    yearlyPrice: 143.90,   // ~12 months at $11.99/month (20% discount)
    description: "Perfect for serious learners who want to accelerate their progress.",
    features: [
      "Unlimited AI conversations",
      "Advanced vocabulary tracking",
      "Co-create unlimited custom topics",
      "Priority support",
      "Progress analytics",
      "Export your learning data"
    ],
    cta: "Start Learning",
    highlight: true
  },
  {
    id: "pro",
    name: "Xpeak Pro",
    monthlyPrice: 24.99,
    quarterlyPrice: 67.47, // ~3 months at $22.49/month
    yearlyPrice: 239.90,   // ~12 months at $19.99/month (20% discount)
    description: "For power users who want the ultimate learning experience.",
    features: [
      "Everything in Plus",
      "1-on-1 tutoring sessions",
      "Custom learning paths",
      "Advanced AI features",
      "API access",
      "White-label options"
    ],
    cta: "Go Pro",
    highlight: false
  }
];

function PlanTiersSectionInner() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const searchParams = useSearchParams();
  const urlCurrentPlan = searchParams.get('currentPlan');
  const { user, session } = useAuth();
  const [changing, setChanging] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentBillingCycle, setCurrentBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const router = useRouter();

  // Determine current plan - prioritize URL parameter, then fall back to user's subscription
  const currentPlan = urlCurrentPlan || (userSubscription?.plan_id ? userSubscription.plan_id : null);
  const isUpgradeDowngrade = !!currentPlan;

  // Fetch user's current subscription
  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (!user || !session) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/billing/subscription', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.subscription) {
            // Map Stripe price ID to plan ID and billing cycle
            const priceToPlanMap: { [key: string]: { plan: string; cycle: 'monthly' | 'quarterly' | 'yearly' } } = {
              // Plus plan prices
              'price_1RessSFM2iXH8TuN4U2vQz9E': { plan: 'plus', cycle: 'monthly' },
              'price_1Ret11FM2iXH8TuNdLCrRIxK': { plan: 'plus', cycle: 'quarterly' },
              'price_1Ret1bFM2iXH8TuNClhnN7c2': { plan: 'plus', cycle: 'yearly' },
              // Pro plan prices
              'price_1Rest1FM2iXH8TuNKvbhbeTG': { plan: 'pro', cycle: 'monthly' },
              'price_1Ret29FM2iXH8TuNKl7fICBr': { plan: 'pro', cycle: 'quarterly' },
              'price_1Ret2RFM2iXH8TuNYQIQk9BU': { plan: 'pro', cycle: 'yearly' },
            };
            
            const priceId = data.subscription.items?.data[0]?.price?.id;
            const planInfo = priceToPlanMap[priceId];
            
            console.log('Pricing page - Subscription detection:', {
              priceId,
              planInfo,
              subscriptionStatus: data.subscription.status,
              hasSubscription: !!data.subscription
            });
            
            if (planInfo) {
              setUserSubscription({
                ...data.subscription,
                plan_id: planInfo.plan
              });
              setCurrentBillingCycle(planInfo.cycle);
              // Set the billing cycle toggle to match current subscription
              setBillingCycle(planInfo.cycle);
            }
          } else {
            console.log('Pricing page - No subscription found for user');
          }
        }
      } catch (error) {
        console.error('Error fetching user subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubscription();
  }, [user, session]);

  // Calculate price and suffix based on billing cycle
  const getPlanPrice = (plan: any) => {
    if (plan.id === 'free') {
      return { price: 0, priceLabel: 'Free', priceSuffix: '' };
    }

    let price: number;
    let priceLabel: string;
    let priceSuffix: string;

    switch (billingCycle) {
      case 'monthly':
        price = plan.monthlyPrice;
        priceLabel = `$${plan.monthlyPrice}`;
        priceSuffix = '/month';
        break;
      case 'quarterly':
        price = plan.quarterlyPrice;
        priceLabel = `$${plan.quarterlyPrice}`;
        priceSuffix = '/quarter';
        break;
      case 'yearly':
        price = plan.yearlyPrice;
        priceLabel = `$${plan.yearlyPrice}`;
        priceSuffix = '/year';
        break;
      default:
        price = plan.monthlyPrice;
        priceLabel = `$${plan.monthlyPrice}`;
        priceSuffix = '/month';
    }

    return { price, priceLabel, priceSuffix };
  };

  // Get current plan's price for comparison
  const getCurrentPlanPrice = (): number => {
    if (!currentPlan || currentPlan === 'free') return 0;
    
    const plan = plans.find(p => p.id === currentPlan);
    if (!plan) return 0;

    switch (currentBillingCycle) {
      case 'monthly':
        return plan.monthlyPrice || 0;
      case 'quarterly':
        return plan.quarterlyPrice || 0;
      case 'yearly':
        return plan.yearlyPrice || 0;
      default:
        return plan.monthlyPrice || 0;
    }
  };

  // Determine if this is an upgrade or downgrade for same plan, different cycle
  const getActionText = (planId: string) => {
    if (!isUpgradeDowngrade || planId !== currentPlan) {
      return 'Switch to This Plan';
    }

    // Same plan, different billing cycle - compare prices
    const currentPrice: number = getCurrentPlanPrice();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return 'Switch to This Plan';
    
    const priceInfo = getPlanPrice(plan);
    const newPrice: number = priceInfo.price || 0;
    
    if (newPrice > currentPrice) {
      return 'Upgrade';
    } else if (newPrice < currentPrice) {
      return 'Downgrade';
    } else {
      return 'Switch to This Plan';
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user || !session) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }

    if (isUpgradeDowngrade) {
      // Handle subscription change
      await handleChangeSubscription(planId);
    } else {
      // Handle new subscription
      await handleNewSubscription(planId);
    }
  };

  const handleNewSubscription = async (planId: string) => {
    try {
      // Map billing cycle to Stripe interval
      const intervalMap = {
        'monthly': 'month',
        'quarterly': 'quarter',
        'yearly': 'year'
      };

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          planId,
          interval: intervalMap[billingCycle],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError(error instanceof Error ? error.message : 'Failed to create checkout session');
    }
  };

  const handleChangeSubscription = async (planId: string) => {
    if (!user || !session) return;
    
    setChanging(planId);
    setError(null);
    
    try {
      // Check if this is a cross-billing-cycle change
      const isCrossCycleChange = currentPlan === planId && currentBillingCycle !== billingCycle;
      
      // Redirect to confirmation page with both plan and billing cycle info
      const confirmUrl = `/pricing/confirm-change?plan=${planId}&cycle=${billingCycle}&currentPlan=${currentPlan}&currentCycle=${currentBillingCycle}`;
      router.push(confirmUrl);
    } catch (error) {
      console.error('Error navigating to confirmation; page:', error);
      setError('Failed to navigate to confirmation page');
    } finally {
      setChanging(null);
    }
  };

  // Show loading state only for authenticated users
  if (loading && user && session) {
    return (
      <section className="py-token-20 bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-token-12 w-token-12 border-b-token-2 border-token-primary mx-auto"></div>
            <p className="mt-token-4 token-text-secondary">Loading your current plan...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-token-20 bg-token-surface-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-token-8">
          <h2 className="text-token-4xl font-bold token-text-primary mb-token-2">
            Choose Your Plan
          </h2>
          <p className="text-token-lg token-text-secondary max-w-token-2xl mx-auto leading-relaxed">
          Start Your Language adventure with Xpeak AI. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-token-12">
          <ToggleGroup 
            value={billingCycle} 
            onChange={(value) => setBillingCycle(value as 'monthly' | 'quarterly' | 'yearly')}
            options={[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Quarterly', value: 'quarterly' },
              { 
                label: (
                  <>
                    Yearly
                    <Badge variant="primary" className="ml-token-2">Save 20%</Badge>
                  </>
                ), 
                value: 'yearly' 
              }
            ]}
          />
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-token-8">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isCurrentCycle = currentBillingCycle === billingCycle;
            const isCurrentPlanAndCycle = isCurrentPlan && isCurrentCycle;
            const isLoading = changing === plan.id;
            const { priceLabel, priceSuffix } = getPlanPrice(plan);
            
            return (
              <Card 
                key={plan.id} 
                className={`card-token-elevated relative p-token-8 transition-token-normal hover:shadow-token-xl hover:scale-token-105 ${
                  plan.highlight 
                    ? 'ring-token-2 ring-token-primary shadow-token-lg' 
                    : 'border-token-border hover:border-token-accent/30'
                } ${
                  isCurrentPlan 
                    ? 'ring-token-2 ring-token-primary-light bg-token-primary/5 shadow-token-lg' 
                    : ''
                }`}
              >
                {isCurrentPlan && (
                  <Badge variant="primary" className="absolute -top-token-3 left-1/2 transform -translate-x-1/2 z-token-10">
                    {isCurrentCycle ? 'Current Plan' : 'Current Plan (Different Cycle)'}
                  </Badge>
                )}
                
                <div className="text-center">
                  <h3 className="text-token-2xl font-bold token-text-primary mb-token-4">{plan.name}</h3>
                  <div className="mb-token-6">
                    <span className="text-token-4xl font-bold token-text-primary">{priceLabel}</span>
                    <span className="token-text-secondary text-token-lg">{priceSuffix}</span>
                  </div>
                  <p className="token-text-secondary mb-token-8 leading-relaxed">{plan.description}</p>
                  
                  <ul className="text-left space-y-token-4 mb-token-10">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-token-5 h-token-5 text-token-success mr-token-3 mt-token-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="token-text-primary leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading || (isCurrentPlanAndCycle && isUpgradeDowngrade)}
                    variant={plan.highlight ? "primary" : "secondary"}
                    className="w-full transition-token-normal hover:shadow-token-md hover:scale-token-105"
                  >
                    {isLoading ? 'Processing...' : 
                     isCurrentPlanAndCycle && isUpgradeDowngrade ? 'Current Plan' : 
                     isUpgradeDowngrade ? getActionText(plan.id) : plan.cta}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {error && (
          <div className="mt-token-8 text-center">
            <p className="token-text-error bg-token-error-light border border-token-error-light rounded-token-lg p-token-4">
              {error}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function PlanTiersSection() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlanTiersSectionInner />
    </Suspense>
  );
} 