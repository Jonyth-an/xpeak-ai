-- Add booking_type field and update status constraint for lessons table
-- This migration adds support for trial vs regular lessons and proper status management

-- Add booking_type field to lessons table
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'lesson' CHECK (booking_type IN ('trial', 'lesson'));

-- Update the status constraint to include the new statuses
-- First, drop the existing constraint
ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_status_check;

-- Add the new constraint with all required statuses
ALTER TABLE public.lessons 
ADD CONSTRAINT lessons_status_check 
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'reschedule_requested'));

-- Add comments to document the new fields
COMMENT ON COLUMN public.lessons.booking_type IS 'Type of booking: trial or regular lesson';
COMMENT ON COLUMN public.lessons.status IS 'Lesson status: pending, confirmed, completed, cancelled, no_show, reschedule_requested';

-- Create index for booking_type for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_booking_type ON public.lessons(booking_type);

-- Create index for status for better query performance
CREATE INDEX IF NOT EXISTS idx_lessons_status_new ON public.lessons(status); 