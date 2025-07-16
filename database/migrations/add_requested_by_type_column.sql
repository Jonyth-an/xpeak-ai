-- Add requested_by_type column to reschedule_requests table
-- Check if column exists before adding it

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