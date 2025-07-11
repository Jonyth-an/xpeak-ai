-- Add admin review fields to tutor_applications table
-- This migration adds fields needed for comprehensive admin review functionality

-- Add rejection_reason field for storing why an application was rejected
ALTER TABLE public.tutor_applications 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add waitlist_reason field for storing why an application was waitlisted
ALTER TABLE public.tutor_applications 
ADD COLUMN IF NOT EXISTS waitlist_reason TEXT;

-- Add admin_action_history field for audit trail (JSONB for flexibility)
ALTER TABLE public.tutor_applications 
ADD COLUMN IF NOT EXISTS admin_action_history JSONB DEFAULT '[]'::jsonb;

-- Add reviewer_email field for easier admin identification
ALTER TABLE public.tutor_applications 
ADD COLUMN IF NOT EXISTS reviewer_email TEXT;

-- Add indexes for better query performance on new fields
CREATE INDEX IF NOT EXISTS idx_tutor_applications_reviewer_email ON public.tutor_applications(reviewer_email);
CREATE INDEX IF NOT EXISTS idx_tutor_applications_rejection_reason ON public.tutor_applications(rejection_reason) WHERE rejection_reason IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tutor_applications_waitlist_reason ON public.tutor_applications(waitlist_reason) WHERE waitlist_reason IS NOT NULL;

-- Create a function to log admin actions in the history
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
    action_record JSONB;
BEGIN
    -- Only log if status or review_notes changed
    IF (OLD.status IS DISTINCT FROM NEW.status) OR 
       (OLD.review_notes IS DISTINCT FROM NEW.review_notes) OR
       (OLD.rejection_reason IS DISTINCT FROM NEW.rejection_reason) OR
       (OLD.waitlist_reason IS DISTINCT FROM NEW.waitlist_reason) THEN
        
        action_record := jsonb_build_object(
            'action_type', CASE 
                WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'status_change'
                WHEN OLD.review_notes IS DISTINCT FROM NEW.review_notes THEN 'notes_update'
                WHEN OLD.rejection_reason IS DISTINCT FROM NEW.rejection_reason THEN 'rejection_reason_update'
                WHEN OLD.waitlist_reason IS DISTINCT FROM NEW.waitlist_reason THEN 'waitlist_reason_update'
                ELSE 'other'
            END,
            'old_status', OLD.status,
            'new_status', NEW.status,
            'reviewer_email', NEW.reviewer_email,
            'timestamp', NOW(),
            'old_review_notes', OLD.review_notes,
            'new_review_notes', NEW.review_notes,
            'old_rejection_reason', OLD.rejection_reason,
            'new_rejection_reason', NEW.rejection_reason,
            'old_waitlist_reason', OLD.waitlist_reason,
            'new_waitlist_reason', NEW.waitlist_reason
        );
        
        -- Append to the history array
        NEW.admin_action_history := COALESCE(NEW.admin_action_history, '[]'::jsonb) || action_record;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging admin actions
DROP TRIGGER IF EXISTS log_admin_action_trigger ON public.tutor_applications;
CREATE TRIGGER log_admin_action_trigger
    BEFORE UPDATE ON public.tutor_applications
    FOR EACH ROW
    EXECUTE FUNCTION log_admin_action();

-- Add comments for documentation
COMMENT ON COLUMN public.tutor_applications.rejection_reason IS 'Reason provided when rejecting a tutor application';
COMMENT ON COLUMN public.tutor_applications.waitlist_reason IS 'Reason provided when waitlisting a tutor application';
COMMENT ON COLUMN public.tutor_applications.admin_action_history IS 'JSON array of admin actions for audit trail';
COMMENT ON COLUMN public.tutor_applications.reviewer_email IS 'Email of the admin who reviewed the application'; 