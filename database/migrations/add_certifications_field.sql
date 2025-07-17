-- Add separate certifications field to distinguish from teaching focus areas
-- This migration adds a new field and migrates existing data

-- 1. Add the new certifications field
ALTER TABLE public.tutor_profiles 
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;

-- 2. Add comment to document the new field
COMMENT ON COLUMN public.tutor_profiles.certifications IS 'Teaching certifications (TEFL, CELTA, DELE, etc.) as JSONB array';

-- 3. Update the specializations comment to clarify its purpose
COMMENT ON COLUMN public.tutor_profiles.specializations IS 'Teaching focus areas (Conversation, Grammar, Pronunciation, etc.) as JSONB array';

-- 4. Migrate existing data: Move certification-like items from specializations to certifications
-- This identifies items that look like certifications and moves them
UPDATE public.tutor_profiles 
SET 
  certifications = (
    SELECT jsonb_agg(spec)
    FROM jsonb_array_elements_text(specializations) AS spec
    WHERE spec IN (
      'TEFL', 'CELTA', 'TESOL', 'DELTA', 'DELE', 'HSK', 'JLPT', 
      'DELF/DALF', 'Goethe Certificate', 'CILS', 'Other'
    )
  ),
  specializations = (
    SELECT jsonb_agg(spec)
    FROM jsonb_array_elements_text(specializations) AS spec
    WHERE spec NOT IN (
      'TEFL', 'CELTA', 'TESOL', 'DELTA', 'DELE', 'HSK', 'JLPT', 
      'DELF/DALF', 'Goethe Certificate', 'CILS', 'Other'
    )
  )
WHERE specializations IS NOT NULL 
  AND jsonb_array_length(specializations) > 0;

-- 5. Handle empty arrays - set to empty array instead of null
UPDATE public.tutor_profiles 
SET certifications = '[]'::jsonb 
WHERE certifications IS NULL;

UPDATE public.tutor_profiles 
SET specializations = '[]'::jsonb 
WHERE specializations IS NULL;

-- 6. Update the trigger function to handle the new field
CREATE OR REPLACE FUNCTION create_tutor_profile_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    
    -- Extract certificate types from application data
    DECLARE
      cert_types jsonb := '[]'::jsonb;
      cert_other text := '';
    BEGIN
      -- Get certificate types from application data
      IF NEW.application_data ? 'certificates' THEN
        cert_types := NEW.application_data->'certificates';
      END IF;
      
      -- Get certificate other explanation
      IF NEW.application_data ? 'certificateOther' THEN
        cert_other := NEW.application_data->>'certificateOther';
      END IF;
      
      -- Add "Other" certificate if there's an explanation
      IF cert_other IS NOT NULL AND cert_other != '' THEN
        cert_types := cert_types || '"Other"'::jsonb;
      END IF;
      
      INSERT INTO public.tutor_profiles (
        user_id,
        application_id,
        display_name,
        bio,
        teaching_style,
        education,
        languages_taught,
        specializations,
        certifications,
        profile_image_url,
        intro_video_url,
        certificate_files,
        timezone,
        is_active
      ) VALUES (
        NEW.user_id,
        NEW.id,
        COALESCE(NEW.application_data->>'displayName', 'Tutor'),
        NEW.application_data->>'introduction',
        NEW.application_data->>'teachingStyle',
        NEW.application_data->>'education',
        COALESCE(NEW.application_data->'languagesSpoken', '[]'::jsonb),
        COALESCE(NEW.application_data->'specializations', '[]'::jsonb),
        cert_types,
        CASE 
          WHEN NEW.application_data ? 'profilePhotos' AND jsonb_array_length(NEW.application_data->'profilePhotos') > 0 
          THEN (NEW.application_data->'profilePhotos'->0)::text
          ELSE NULL
        END,
        NEW.application_data->>'demoVideo',
        NEW.application_data->'certificates',
        COALESCE(NEW.application_data->>'timezone', 'UTC'),
        TRUE
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_certifications ON public.tutor_profiles USING GIN (certifications);

-- 8. Add RLS policy for the new field
-- (The existing policies should already cover this since they use FOR ALL)

-- 9. Log the migration
INSERT INTO public.migration_log (migration_name, applied_at, description) 
VALUES (
  'add_certifications_field', 
  NOW(), 
  'Added separate certifications field and migrated existing data from specializations'
) ON CONFLICT DO NOTHING; 