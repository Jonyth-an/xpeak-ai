-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email ON public.user_subscriptions(user_email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscription_id ON public.user_subscriptions(stripe_subscription_id);

-- Add unique constraint to prevent duplicates
ALTER TABLE public.user_subscriptions ADD CONSTRAINT unique_user_subscription UNIQUE (user_email, stripe_subscription_id);

-- Enable Row Level Security
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow webhook to insert data (no auth required for webhook)
CREATE POLICY "Allow webhook inserts" ON public.user_subscriptions
    FOR INSERT WITH CHECK (true);

-- Create policy to allow users to read their own subscription data
CREATE POLICY "Allow users to read own subscriptions" ON public.user_subscriptions
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR user_email = current_setting('app.current_user_email', true));

-- Create policy to allow users to update their own subscription data
CREATE POLICY "Allow users to update own subscriptions" ON public.user_subscriptions
    FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR user_email = current_setting('app.current_user_email', true));

-- Create policy to allow service role to read all data (for API routes)
CREATE POLICY "Allow service role to read all" ON public.user_subscriptions
    FOR SELECT USING (auth.role() = 'service_role');

-- Create policy to allow service role to insert data (for webhook)
CREATE POLICY "Allow service role to insert" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create policy to allow service role to update data (for webhook)
CREATE POLICY "Allow service role to update" ON public.user_subscriptions
    FOR UPDATE USING (auth.role() = 'service_role'); 