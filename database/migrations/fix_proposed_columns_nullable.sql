-- Fix proposed columns to be nullable
-- These columns should only be filled when a tutor responds with alternative times

-- Make proposed_date nullable
ALTER TABLE public.reschedule_requests ALTER COLUMN proposed_date DROP NOT NULL;

-- Make proposed_start_time nullable  
ALTER TABLE public.reschedule_requests ALTER COLUMN proposed_start_time DROP NOT NULL;

-- Make proposed_end_time nullable
ALTER TABLE public.reschedule_requests ALTER COLUMN proposed_end_time DROP NOT NULL;

-- Add comments for the proposed columns
COMMENT ON COLUMN public.reschedule_requests.proposed_date IS 'Alternative date proposed by tutor in response to reschedule request';
COMMENT ON COLUMN public.reschedule_requests.proposed_start_time IS 'Alternative start time proposed by tutor in response to reschedule request';
COMMENT ON COLUMN public.reschedule_requests.proposed_end_time IS 'Alternative end time proposed by tutor in response to reschedule request'; 