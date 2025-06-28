-- Add language preferences columns to user_preferences table
-- Run this in your Supabase SQL editor

-- Add the missing columns for language preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS language_level TEXT,
ADD COLUMN IF NOT EXISTS learning_goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS topic_interests TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN user_preferences.languages IS 'Array of language codes the user is learning';
COMMENT ON COLUMN user_preferences.language_level IS 'Current language proficiency level (beginner, intermediate, advanced, etc.)';
COMMENT ON COLUMN user_preferences.learning_goals IS 'Array of learning goal IDs (travel, work, test prep, etc.)';
COMMENT ON COLUMN user_preferences.topic_interests IS 'Array of topic interest IDs (culture, business, pop trends, etc.)';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_preferences' 
ORDER BY ordinal_position; 