-- Clean up duplicate subscription records
-- Keep only the most recent active subscription for each user

-- First, let's see what we have
SELECT 
  user_email,
  COUNT(*) as subscription_count,
  STRING_AGG(stripe_subscription_id, ', ') as subscription_ids,
  STRING_AGG(status, ', ') as statuses,
  STRING_AGG(created_at::text, ', ') as created_dates
FROM user_subscriptions 
GROUP BY user_email 
HAVING COUNT(*) > 1
ORDER BY user_email;

-- For each user with multiple subscriptions, keep only the most recent active one
-- If no active subscription, keep the most recent one

-- Delete duplicate subscriptions for users with multiple records
DELETE FROM user_subscriptions 
WHERE id IN (
  SELECT us.id
  FROM user_subscriptions us
  INNER JOIN (
    SELECT 
      user_email,
      MAX(created_at) as max_created_at
    FROM user_subscriptions
    GROUP BY user_email
    HAVING COUNT(*) > 1
  ) duplicates ON us.user_email = duplicates.user_email
  WHERE us.created_at < duplicates.max_created_at
);

-- Verify the cleanup
SELECT 
  user_email,
  COUNT(*) as subscription_count,
  stripe_subscription_id,
  status,
  created_at
FROM user_subscriptions 
GROUP BY user_email, stripe_subscription_id, status, created_at
ORDER BY user_email; 