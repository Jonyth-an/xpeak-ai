-- Create newsletter_subscriptions table
-- This table stores email addresses for newsletter subscriptions without requiring user accounts

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) DEFAULT 'footer', -- 'footer', 'career', 'community', etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON public.newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed_at ON public.newsletter_subscriptions(subscribed_at);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for public subscription)
CREATE POLICY "Allow public subscription" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- Create policy to allow service role to read all data (for admin/API routes)
CREATE POLICY "Allow service role to read all" ON public.newsletter_subscriptions
    FOR SELECT USING (auth.role() = 'service_role');

-- Create policy to allow service role to update data (for unsubscribe functionality)
CREATE POLICY "Allow service role to update" ON public.newsletter_subscriptions
    FOR UPDATE USING (auth.role() = 'service_role');

-- Create policy to allow service role to delete data (for cleanup)
CREATE POLICY "Allow service role to delete" ON public.newsletter_subscriptions
    FOR DELETE USING (auth.role() = 'service_role');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_newsletter_subscription_updated_at_trigger
    BEFORE UPDATE ON public.newsletter_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_subscription_updated_at();

-- Create a view for newsletter analytics
CREATE OR REPLACE VIEW newsletter_analytics AS
SELECT 
    COUNT(*) as total_subscribers,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
    COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count,
    COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '30 days') as new_subscribers_30_days,
    COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '7 days') as new_subscribers_7_days,
    COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '24 hours') as new_subscribers_24_hours,
    AVG(EXTRACT(EPOCH FROM (NOW() - subscribed_at)) / 86400) as avg_subscription_duration_days
FROM public.newsletter_subscriptions;

-- Add comments for documentation
COMMENT ON TABLE public.newsletter_subscriptions IS 'Stores newsletter subscription emails without requiring user accounts';
COMMENT ON COLUMN public.newsletter_subscriptions.email IS 'Email address of the subscriber';
COMMENT ON COLUMN public.newsletter_subscriptions.status IS 'Subscription status: active, unsubscribed';
COMMENT ON COLUMN public.newsletter_subscriptions.source IS 'Where the subscription came from: footer, career, community, etc.';
COMMENT ON COLUMN public.newsletter_subscriptions.metadata IS 'Additional data about the subscription (browser, location, etc.)';
COMMENT ON VIEW newsletter_analytics IS 'Analytics view for newsletter subscription data';

-- Grant necessary permissions
GRANT SELECT ON newsletter_analytics TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role; 