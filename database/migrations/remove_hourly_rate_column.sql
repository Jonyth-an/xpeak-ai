-- Migration: Remove hourly_rate column from tutor_profiles
-- Date: 2025-07-16
-- Description: Tutors are now paid per lesson with fixed base payment + performance bonuses
--              rather than by hourly rate. This column is no longer needed.

-- Remove the hourly_rate column from tutor_profiles table
ALTER TABLE public.tutor_profiles DROP COLUMN IF EXISTS hourly_rate;

-- Log the migration
INSERT INTO public.migration_log (migration_name, applied_at, description) 
VALUES (
  'remove_hourly_rate_column', 
  NOW(), 
  'Removed hourly_rate column from tutor_profiles. Tutors now paid per lesson with fixed base + performance bonuses.'
) ON CONFLICT DO NOTHING; 