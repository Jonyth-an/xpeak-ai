-- Add proposed columns and requested_by_type to reschedule_requests table
-- This migration adds support for tutor counter-proposals and user type tracking

-- Add requested_by_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'requested_by_type'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN requested_by_type VARCHAR(50) NOT NULL DEFAULT 'student';
    END IF;
END $$;

-- Add proposed_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'proposed_date'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN proposed_date DATE;
    END IF;
END $$;

-- Add proposed_start_time column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'proposed_start_time'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN proposed_start_time TIME;
    END IF;
END $$;

-- Add proposed_end_time column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'proposed_end_time'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN proposed_end_time TIME;
    END IF;
END $$;

-- Add tutor_response column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'tutor_response'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN tutor_response VARCHAR(50);
    END IF;
END $$;

-- Add tutor_response_reason column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'tutor_response_reason'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN tutor_response_reason TEXT;
    END IF;
END $$;

-- Add responded_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'responded_at'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update status constraint to include new statuses
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'reschedule_requests_status_check'
    ) THEN
        ALTER TABLE public.reschedule_requests DROP CONSTRAINT reschedule_requests_status_check;
    END IF;
    
    ALTER TABLE public.reschedule_requests ADD CONSTRAINT reschedule_requests_status_check 
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'proposed'));
END $$;

-- Add comments
COMMENT ON COLUMN public.reschedule_requests.requested_by_type IS 'Type of user requesting reschedule: student or tutor';
COMMENT ON COLUMN public.reschedule_requests.proposed_date IS 'Alternative date proposed by tutor';
COMMENT ON COLUMN public.reschedule_requests.proposed_start_time IS 'Alternative start time proposed by tutor';
COMMENT ON COLUMN public.reschedule_requests.proposed_end_time IS 'Alternative end time proposed by tutor';
COMMENT ON COLUMN public.reschedule_requests.tutor_response IS 'Tutor response: accepted, rejected, proposed';
COMMENT ON COLUMN public.reschedule_requests.tutor_response_reason IS 'Reason for tutor response';
COMMENT ON COLUMN public.reschedule_requests.responded_at IS 'When the tutor responded to the request'; 