-- Add theme preference columns to profiles table
-- This migration adds support for storing user theme preferences in the database

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add theme preference columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(50) DEFAULT 'system',
ADD COLUMN IF NOT EXISTS custom_theme_data JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS theme_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for faster theme preference lookups
CREATE INDEX IF NOT EXISTS idx_profiles_theme_preference ON public.profiles(theme_preference);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.theme_preference IS 'User theme preference: light, dark, system, or custom theme name';
COMMENT ON COLUMN public.profiles.custom_theme_data IS 'JSON data for custom theme configuration';
COMMENT ON COLUMN public.profiles.theme_updated_at IS 'Timestamp when theme preference was last updated';

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id); 