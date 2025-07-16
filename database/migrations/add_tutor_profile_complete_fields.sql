-- Add complete tutor profile fields
-- This migration adds the missing fields that are collected during onboarding

-- Add teaching_style field for storing tutor's teaching approach and style
ALTER TABLE public.tutor_profiles 
ADD COLUMN IF NOT EXISTS teaching_style TEXT;

-- Add education field for storing tutor's educational background
ALTER TABLE public.tutor_profiles 
ADD COLUMN IF NOT EXISTS education TEXT;

-- Add languages_spoken field for storing languages the tutor speaks (not teaches)
-- This is different from languages_taught which is for languages they teach
ALTER TABLE public.tutor_profiles 
ADD COLUMN IF NOT EXISTS languages_spoken JSONB DEFAULT '[]'::jsonb;

-- Add comments to document the new fields
COMMENT ON COLUMN public.tutor_profiles.teaching_style IS 'Tutor''s teaching style and approach description';
COMMENT ON COLUMN public.tutor_profiles.education IS 'Tutor''s educational background and qualifications';
COMMENT ON COLUMN public.tutor_profiles.languages_spoken IS 'Languages the tutor speaks (not teaches) as JSONB array'; 