-- Create reschedule_requests table
CREATE TABLE IF NOT EXISTS public.reschedule_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    requested_date DATE NOT NULL,
    requested_start_time TIME NOT NULL,
    requested_end_time TIME NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    current_scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_lesson_id ON public.reschedule_requests(lesson_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_requested_by ON public.reschedule_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_status ON public.reschedule_requests(status);
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_created_at ON public.reschedule_requests(created_at);

-- Add comments
COMMENT ON TABLE public.reschedule_requests IS 'Stores reschedule requests for lessons';
COMMENT ON COLUMN public.reschedule_requests.lesson_id IS 'Reference to the lesson being rescheduled';
COMMENT ON COLUMN public.reschedule_requests.requested_by IS 'User ID of the person requesting the reschedule';
COMMENT ON COLUMN public.reschedule_requests.requested_date IS 'New requested date for the lesson';
COMMENT ON COLUMN public.reschedule_requests.requested_start_time IS 'New requested start time for the lesson';
COMMENT ON COLUMN public.reschedule_requests.requested_end_time IS 'New requested end time for the lesson';
COMMENT ON COLUMN public.reschedule_requests.reason IS 'Optional reason for the reschedule request';
COMMENT ON COLUMN public.reschedule_requests.status IS 'Status of the reschedule request: pending, approved, rejected, cancelled';
COMMENT ON COLUMN public.reschedule_requests.current_scheduled_start IS 'Original scheduled start time of the lesson';
COMMENT ON COLUMN public.reschedule_requests.current_scheduled_end IS 'Original scheduled end time of the lesson';
COMMENT ON COLUMN public.reschedule_requests.approved_by IS 'User ID of the person who approved/rejected the request';
COMMENT ON COLUMN public.reschedule_requests.approved_at IS 'Timestamp when the request was approved/rejected';
COMMENT ON COLUMN public.reschedule_requests.rejection_reason IS 'Reason for rejection if the request was rejected';

-- Enable RLS
ALTER TABLE public.reschedule_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view reschedule requests for their lessons" ON public.reschedule_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.lessons 
            WHERE lessons.id = reschedule_requests.lesson_id 
            AND (lessons.student_id = auth.uid() OR lessons.tutor_id = auth.uid())
        )
    );

CREATE POLICY "Users can create reschedule requests for their lessons" ON public.reschedule_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.lessons 
            WHERE lessons.id = reschedule_requests.lesson_id 
            AND (lessons.student_id = auth.uid() OR lessons.tutor_id = auth.uid())
        )
        AND requested_by = auth.uid()
    );

CREATE POLICY "Users can update reschedule requests for their lessons" ON public.reschedule_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.lessons 
            WHERE lessons.id = reschedule_requests.lesson_id 
            AND (lessons.student_id = auth.uid() OR lessons.tutor_id = auth.uid())
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reschedule_requests_updated_at 
    BEFORE UPDATE ON public.reschedule_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 