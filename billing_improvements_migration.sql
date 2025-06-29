-- Billing System Improvements Migration
-- Run this in your Supabase SQL Editor

-- 1. Create user_usage table for usage tracking
CREATE TABLE IF NOT EXISTS user_usage (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL UNIQUE,
  api_calls INTEGER DEFAULT 0,
  storage_mb INTEGER DEFAULT 0,
  features_used TEXT[] DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create billing_events table for audit trail
CREATE TABLE IF NOT EXISTS billing_events (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  stripe_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create subscription_changes table for tracking plan changes
CREATE TABLE IF NOT EXISTS subscription_changes (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  old_price_id TEXT,
  new_price_id TEXT NOT NULL,
  change_type TEXT NOT NULL, -- 'upgrade', 'downgrade', 'billing_cycle_change'
  proration_amount INTEGER,
  credit_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_usage_email ON user_usage(user_email);
CREATE INDEX IF NOT EXISTS idx_billing_events_email ON billing_events(user_email);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_email ON subscription_changes(user_email);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_subscription ON subscription_changes(stripe_subscription_id);

-- 5. Add RLS policies for new tables
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_changes ENABLE ROW LEVEL SECURITY;

-- User usage policies
CREATE POLICY "Users can view their own usage" ON user_usage
  FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Service role can manage usage" ON user_usage
  FOR ALL USING (auth.role() = 'service_role');

-- Billing events policies
CREATE POLICY "Users can view their own billing events" ON billing_events
  FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Service role can manage billing events" ON billing_events
  FOR ALL USING (auth.role() = 'service_role');

-- Subscription changes policies
CREATE POLICY "Users can view their own subscription changes" ON subscription_changes
  FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Service role can manage subscription changes" ON subscription_changes
  FOR ALL USING (auth.role() = 'service_role');

-- 6. Add additional columns to existing user_subscriptions table
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS total_amount_paid INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS billing_cycle TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS plan_features TEXT[] DEFAULT '{}';

-- 7. Create a function to update subscription metadata
CREATE OR REPLACE FUNCTION update_subscription_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for automatic metadata updates
CREATE TRIGGER update_subscription_metadata_trigger
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_metadata();

-- 9. Create a view for subscription analytics
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
  user_email,
  status,
  created_at,
  updated_at,
  total_amount_paid,
  last_payment_date,
  next_billing_date,
  billing_cycle,
  plan_features,
  CASE 
    WHEN status = 'active' THEN 'Active'
    WHEN status = 'canceled' THEN 'Canceled'
    WHEN status = 'past_due' THEN 'Past Due'
    ELSE status
  END as status_display,
  EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 as days_since_created
FROM user_subscriptions;

-- 10. Create a function to get subscription statistics
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE (
  total_subscriptions INTEGER,
  active_subscriptions INTEGER,
  canceled_subscriptions INTEGER,
  total_revenue INTEGER,
  avg_subscription_duration_days NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active')::INTEGER as active_subscriptions,
    COUNT(*) FILTER (WHERE status = 'canceled')::INTEGER as canceled_subscriptions,
    COALESCE(SUM(total_amount_paid), 0)::INTEGER as total_revenue,
    COALESCE(AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400), 0) as avg_subscription_duration_days
  FROM user_subscriptions;
END;
$$ LANGUAGE plpgsql;

-- 11. Add comments for documentation
COMMENT ON TABLE user_usage IS 'Tracks user usage metrics for billing purposes';
COMMENT ON TABLE billing_events IS 'Audit trail for all billing-related events';
COMMENT ON TABLE subscription_changes IS 'Tracks all subscription plan changes';
COMMENT ON VIEW subscription_analytics IS 'Analytics view for subscription data';
COMMENT ON FUNCTION get_subscription_stats() IS 'Returns aggregate subscription statistics';

-- 12. Grant necessary permissions
GRANT SELECT ON subscription_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_stats() TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role; 