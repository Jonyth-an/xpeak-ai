-- Add a unique constraint to prevent duplicate subscriptions per user
-- Run this in your Supabase SQL Editor

-- First, check if the constraint already exists
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'user_subscriptions' 
AND constraint_type = 'UNIQUE' 
AND constraint_name = 'unique_user_email';

-- Add the unique constraint (only if it doesn't exist)
ALTER TABLE user_subscriptions
ADD CONSTRAINT unique_user_email UNIQUE (user_email);

-- Verify the constraint was added
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'user_subscriptions' 
AND constraint_type = 'UNIQUE'; 