-- Create tutor_applications table
CREATE TABLE IF NOT EXISTS public.tutor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'drafting' CHECK (status IN ('drafting', 'pending', 'reviewing', 'waitlist', 'rejected', 'approved')),
    application_data JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID REFERENCES auth.users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tutor_applications_user_id ON public.tutor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_applications_status ON public.tutor_applications(status);
CREATE INDEX IF NOT EXISTS idx_tutor_applications_submitted_at ON public.tutor_applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_tutor_applications_reviewer_id ON public.tutor_applications(reviewer_id);

-- Add unique constraint to prevent multiple applications per user
ALTER TABLE public.tutor_applications ADD CONSTRAINT unique_user_application UNIQUE (user_id);

-- Enable Row Level Security
ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own application
CREATE POLICY "Users can read own application" ON public.tutor_applications
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own application
CREATE POLICY "Users can insert own application" ON public.tutor_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own application (only if not submitted)
CREATE POLICY "Users can update own draft application" ON public.tutor_applications
    FOR UPDATE USING (auth.uid() = user_id AND status = 'drafting');

-- Create policy to allow service role to read all applications (for admin/API routes)
CREATE POLICY "Service role can read all applications" ON public.tutor_applications
    FOR SELECT USING (auth.role() = 'service_role');

-- Create policy to allow service role to update all applications (for admin review)
CREATE POLICY "Service role can update all applications" ON public.tutor_applications
    FOR UPDATE USING (auth.role() = 'service_role');

-- Create policy to allow service role to insert applications (for admin creation)
CREATE POLICY "Service role can insert applications" ON public.tutor_applications
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_tutor_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tutor_application_updated_at_trigger
  BEFORE UPDATE ON public.tutor_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_application_updated_at();

-- Create a function to automatically add tutor role when application is approved
CREATE OR REPLACE FUNCTION approve_tutor_application()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to approved, add tutor role to user
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'tutor')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  -- If status changed from approved to something else, remove tutor role
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.user_id AND role = 'tutor';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic role management
CREATE TRIGGER approve_tutor_application_trigger
  AFTER UPDATE ON public.tutor_applications
  FOR EACH ROW
  EXECUTE FUNCTION approve_tutor_application(); 