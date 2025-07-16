-- Add intro video and certificate files fields to tutor_profiles table
-- This migration adds support for intro videos and teaching certificates

-- Add intro_video_url field for storing intro video URLs
ALTER TABLE public.tutor_profiles 
ADD COLUMN IF NOT EXISTS intro_video_url TEXT;

-- Add certificate_files field for storing certificate file URLs as JSONB array
ALTER TABLE public.tutor_profiles 
ADD COLUMN IF NOT EXISTS certificate_files JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the new fields
COMMENT ON COLUMN public.tutor_profiles.intro_video_url IS 'URL to the tutor''s intro video file';
COMMENT ON COLUMN public.tutor_profiles.certificate_files IS 'Array of certificate file URLs as JSONB'; 