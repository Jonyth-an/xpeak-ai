-- Add missing columns to reschedule_requests table
-- Check if columns exist before adding them

-- Add requested_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'requested_date'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN requested_date DATE;
    END IF;
END $$;

-- Add requested_start_time column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'requested_start_time'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN requested_start_time TIME;
    END IF;
END $$;

-- Add requested_end_time column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'requested_end_time'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN requested_end_time TIME;
    END IF;
END $$;

-- Add reason column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'reason'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN reason TEXT;
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
    END IF;
END $$;

-- Add current_scheduled_start column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'current_scheduled_start'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN current_scheduled_start TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add current_scheduled_end column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'current_scheduled_end'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN current_scheduled_end TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add approved_by column if it doesn't exist (using auth.users schema)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'approved_by'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add approved_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'approved_at'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add rejection_reason column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'rejection_reason'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reschedule_requests' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add status constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'reschedule_requests_status_check'
    ) THEN
        ALTER TABLE public.reschedule_requests ADD CONSTRAINT reschedule_requests_status_check 
        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));
    END IF;
END $$; 