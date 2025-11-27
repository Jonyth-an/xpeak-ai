-- Migration: Fix tutor profile trigger to ensure hourly_rate is not referenced
-- Date: 2025-01-XX
-- Description: Ensures the create_tutor_profile_on_approval function doesn't reference hourly_rate
--              which was removed in a previous migration

-- Update the trigger function to use the latest version without hourly_rate
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
      )
      ON CONFLICT (user_id) DO NOTHING;
    END;
  END IF;
  
  -- If status changed from approved to something else, deactivate profile
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.tutor_profiles 
    SET is_active = FALSE 
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS create_tutor_profile_on_approval_trigger ON public.tutor_applications;
CREATE TRIGGER create_tutor_profile_on_approval_trigger
  AFTER UPDATE ON public.tutor_applications
  FOR EACH ROW
  EXECUTE FUNCTION create_tutor_profile_on_approval();

-- Log the migration
INSERT INTO public.migration_log (migration_name, applied_at, description) 
VALUES (
  'fix_tutor_profile_trigger_no_hourly_rate', 
  NOW(), 
  'Fixed tutor profile trigger function to ensure hourly_rate column is not referenced'
) ON CONFLICT DO NOTHING;

