import Stripe from 'stripe';

export interface ProrationCalculation {
  unusedAmount: number;
  newPlanAmount: number;
  prorationAmount: number;
  daysRemaining: number;
  totalDays: number;
  unusedPercentage: number;
}

export interface CreditCalculation {
  creditAmount: number;
  creditDays: number;
  appliedAmount: number;
  finalCharge: number;
}

/**
 * Calculate proration for subscription changes
 */
export function calculateProration(
  currentSubscription: Stripe.Subscription,
  newPrice: Stripe.Price,
  currentDate: number = Math.floor(Date.now() / 1000)
): ProrationCalculation {
  const subscription = currentSubscription as Stripe.Subscription & { current_period_start: number, current_period_end: number };
  const currentPeriodStart = subscription.current_period_start;
  const currentPeriodEnd = subscription.current_period_end;
  const currentPrice = subscription.items.data[0]?.price;
  
  if (!currentPrice) {
    throw new Error('Current price not found in subscription');
  }

  // Calculate time remaining in current period
  const totalDays = currentPeriodEnd - currentPeriodStart;
  const daysElapsed = currentDate - currentPeriodStart;
  const daysRemaining = currentPeriodEnd - currentDate;
  const unusedPercentage = daysRemaining / totalDays;

  // Calculate amounts
  const currentAmount = currentPrice.unit_amount || 0;
  const newAmount = newPrice.unit_amount || 0;
  
  const unusedAmount = Math.round(currentAmount * unusedPercentage);
  const newPlanAmount = Math.round(newAmount * unusedPercentage);
  const prorationAmount = newPlanAmount - unusedAmount;

  return {
    unusedAmount,
    newPlanAmount,
    prorationAmount,
    daysRemaining,
    totalDays,
    unusedPercentage
  };
}

/**
 * Calculate credit for downgrade scenarios
 */
export function calculateCredit(
  currentSubscription: Stripe.Subscription,
  newPrice: Stripe.Price,
  currentDate: number = Math.floor(Date.now() / 1000)
): CreditCalculation {
  const proration = calculateProration(currentSubscription, newPrice, currentDate);
  
  // For downgrades, unused amount > new plan amount
  if (proration.unusedAmount > proration.newPlanAmount) {
    const creditAmount = proration.unusedAmount - proration.newPlanAmount;
    const creditDays = Math.round(proration.daysRemaining * (creditAmount / proration.unusedAmount));
    
    return {
      creditAmount,
      creditDays,
      appliedAmount: proration.newPlanAmount,
      finalCharge: 0 // No charge for downgrade
    };
  }
  
  return {
    creditAmount: 0,
    creditDays: 0,
    appliedAmount: proration.newPlanAmount,
    finalCharge: proration.prorationAmount
  };
}

/**
 * Calculate upgrade charge
 */
export function calculateUpgradeCharge(
  currentSubscription: Stripe.Subscription,
  newPrice: Stripe.Price,
  currentDate: number = Math.floor(Date.now() / 1000)
): number {
  const proration = calculateProration(currentSubscription, newPrice, currentDate);
  
  // For upgrades, new plan amount > unused amount
  if (proration.newPlanAmount > proration.unusedAmount) {
    return proration.prorationAmount;
  }
  
  return 0;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

/**
 * Get human readable description of the change
 */
export function getChangeDescription(
  currentPrice: Stripe.Price,
  newPrice: Stripe.Price,
  proration: ProrationCalculation
): string {
  const currentAmount = currentPrice.unit_amount || 0;
  const newAmount = newPrice.unit_amount || 0;
  
  if (newAmount > currentAmount) {
    return `Upgrade: ${formatCurrency(proration.prorationAmount)} additional charge for ${Math.round(proration.daysRemaining / 86400)} days`;
  } else if (newAmount < currentAmount) {
    return `Downgrade: ${formatCurrency(proration.unusedAmount - proration.newPlanAmount)} credit for unused time`;
  } else {
    return 'No change in pricing';
  }
} 