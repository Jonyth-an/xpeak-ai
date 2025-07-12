-- Create tutor dashboard tables
-- This migration creates all tables needed for the tutor dashboard system

-- 1. Tutor profiles table (extends approved applications)
CREATE TABLE IF NOT EXISTS public.tutor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES public.tutor_applications(id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    bio TEXT,
    hourly_rate DECIMAL(10,2) DEFAULT 15.00,
    timezone VARCHAR(100) NOT NULL,
    ip_timezone VARCHAR(100), -- For timezone detection
    timezone_confirmed BOOLEAN DEFAULT FALSE,
    languages_taught JSONB DEFAULT '[]'::jsonb,
    specializations JSONB DEFAULT '[]'::jsonb,
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(application_id)
);

-- 2. Tutor availability table (30-minute slots)
CREATE TABLE IF NOT EXISTS public.tutor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE,
    specific_date DATE, -- For one-time availability
    timezone VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lessons table (bookings and completed lessons)
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_type VARCHAR(100) NOT NULL DEFAULT 'Conversation Practice',
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show', 'reschedule_requested')),
    student_timezone VARCHAR(100) NOT NULL,
    tutor_timezone VARCHAR(100) NOT NULL,
    lesson_notes TEXT, -- Private tutor notes
    student_goals TEXT, -- Student's learning goals for this lesson
    homework_assigned TEXT,
    agora_channel_name VARCHAR(255), -- For video integration
    agora_token TEXT, -- For video integration
    price_paid DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    currency VARCHAR(3) DEFAULT 'USD',
    reschedule_reason TEXT,
    reschedule_requested_by VARCHAR(20), -- 'student' or 'tutor'
    reschedule_requested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Student feedback table (ratings and reviews)
CREATE TABLE IF NOT EXISTS public.lesson_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tags JSONB DEFAULT '[]'::jsonb, -- e.g., ["clear_explanation", "patient", "engaging"]
    is_visible_to_tutor BOOLEAN DEFAULT TRUE, -- Hide 1-3 star ratings from tutors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(lesson_id) -- One feedback per lesson
);

-- 5. Tutor earnings table (lessons, bonuses, payouts)
CREATE TABLE IF NOT EXISTS public.tutor_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL, -- NULL for bonuses/other earnings
    earning_type VARCHAR(50) NOT NULL CHECK (earning_type IN ('lesson', 'bonus', 'referral', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT,
    bonus_tier VARCHAR(20), -- 'base', 'tier1', 'tier2', etc.
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payout_id UUID, -- Links to payouts table
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tutor payouts table (withdrawal history)
CREATE TABLE IF NOT EXISTS public.tutor_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL, -- 'paypal', 'stripe', 'bank'
    payment_account_id TEXT NOT NULL, -- PayPal email, Stripe account, etc.
    payout_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    transaction_id TEXT, -- External payment processor transaction ID
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tutor performance metrics table (monthly aggregates)
CREATE TABLE IF NOT EXISTS public.tutor_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    lessons_booked INTEGER DEFAULT 0,
    lessons_taught INTEGER DEFAULT 0,
    lessons_cancelled INTEGER DEFAULT 0,
    cancellations_within_12h INTEGER DEFAULT 0,
    total_minutes_taught INTEGER DEFAULT 0,
    unique_students_taught INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_feedback_count INTEGER DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    completion_rate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    bonus_tier VARCHAR(20) DEFAULT 'base',
    bonus_earned DECIMAL(10,2) DEFAULT 0.00,
    top_strengths JSONB DEFAULT '[]'::jsonb, -- AI-generated strengths
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutor_id, month_year)
);

-- 8. Student-tutor relationships table
CREATE TABLE IF NOT EXISTS public.tutor_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    first_lesson_at TIMESTAMP WITH TIME ZONE,
    last_lesson_at TIMESTAMP WITH TIME ZONE,
    total_lessons INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    student_goals TEXT, -- Overall learning goals
    tutor_notes TEXT, -- Private notes about this student
    student_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tutor_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_user_id ON public.tutor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_active ON public.tutor_profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor_id ON public.tutor_availability(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_day_time ON public.tutor_availability(day_of_week, start_time);

CREATE INDEX IF NOT EXISTS idx_lessons_tutor_id ON public.lessons(tutor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON public.lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_start ON public.lessons(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons(status);

CREATE INDEX IF NOT EXISTS idx_lesson_feedback_tutor_id ON public.lesson_feedback(tutor_id);
CREATE INDEX IF NOT EXISTS idx_lesson_feedback_visible ON public.lesson_feedback(is_visible_to_tutor);

CREATE INDEX IF NOT EXISTS idx_tutor_earnings_tutor_id ON public.tutor_earnings(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_earned_at ON public.tutor_earnings(earned_at);
CREATE INDEX IF NOT EXISTS idx_tutor_earnings_paid ON public.tutor_earnings(is_paid);

CREATE INDEX IF NOT EXISTS idx_tutor_payouts_tutor_id ON public.tutor_payouts(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_payouts_date ON public.tutor_payouts(payout_date);

CREATE INDEX IF NOT EXISTS idx_tutor_performance_tutor_month ON public.tutor_performance(tutor_id, month_year);

CREATE INDEX IF NOT EXISTS idx_tutor_students_tutor_id ON public.tutor_students(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_students_student_id ON public.tutor_students(student_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tutors to access their own data
CREATE POLICY "Tutors can read own profile" ON public.tutor_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Tutors can update own profile" ON public.tutor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Tutors can manage own availability" ON public.tutor_availability
    FOR ALL USING (tutor_id IN (SELECT id FROM public.tutor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors can read own lessons" ON public.lessons
    FOR SELECT USING (tutor_id IN (SELECT id FROM public.tutor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can read own lessons" ON public.lessons
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Tutors can read visible feedback" ON public.lesson_feedback
    FOR SELECT USING (tutor_id IN (SELECT id FROM public.tutor_profiles WHERE user_id = auth.uid()) AND is_visible_to_tutor = TRUE);

CREATE POLICY "Tutors can read own earnings" ON public.tutor_earnings
    FOR SELECT USING (tutor_id IN (SELECT id FROM public.tutor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors can read own payouts" ON public.tutor_payouts
    FOR SELECT USING (tutor_id IN (SELECT id FROM public.tutor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors can read own performance" ON public.tutor_performance
    FOR SELECT USING (tutor_id IN (SELECT id FROM public.tutor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Tutors can manage own students" ON public.tutor_students
    FOR ALL USING (tutor_id IN (SELECT id FROM public.tutor_profiles WHERE user_id = auth.uid()));

-- Service role policies for admin access
CREATE POLICY "Service role can access all tutor data" ON public.tutor_profiles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all availability" ON public.tutor_availability
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all lessons" ON public.lessons
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all feedback" ON public.lesson_feedback
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all earnings" ON public.tutor_earnings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all payouts" ON public.tutor_payouts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all performance" ON public.tutor_performance
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all tutor students" ON public.tutor_students
    FOR ALL USING (auth.role() = 'service_role');

-- Create functions for automatic profile creation when tutor is approved
CREATE OR REPLACE FUNCTION create_tutor_profile_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to approved, create tutor profile
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    INSERT INTO public.tutor_profiles (
      user_id,
      application_id,
      display_name,
      timezone,
      bio,
      languages_taught,
      specializations
    ) VALUES (
      NEW.user_id,
      NEW.id,
      COALESCE(NEW.application_data->>'displayName', NEW.application_data->>'fullName', 'New Tutor'),
      COALESCE(NEW.application_data->>'timezone', 'UTC'),
      NEW.application_data->>'introduction',
      COALESCE(NEW.application_data->'languagesSpoken', '[]'::jsonb),
      '[]'::jsonb
    )
    ON CONFLICT (user_id) DO NOTHING;
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

-- Create trigger for automatic profile creation
CREATE TRIGGER create_tutor_profile_on_approval_trigger
  AFTER UPDATE ON public.tutor_applications
  FOR EACH ROW
  EXECUTE FUNCTION create_tutor_profile_on_approval();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_tutor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_tutor_profiles_updated_at_trigger
  BEFORE UPDATE ON public.tutor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_updated_at();

CREATE TRIGGER update_tutor_availability_updated_at_trigger
  BEFORE UPDATE ON public.tutor_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_updated_at();

CREATE TRIGGER update_lessons_updated_at_trigger
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_updated_at();

CREATE TRIGGER update_tutor_payouts_updated_at_trigger
  BEFORE UPDATE ON public.tutor_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_updated_at();

CREATE TRIGGER update_tutor_performance_updated_at_trigger
  BEFORE UPDATE ON public.tutor_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_updated_at();

CREATE TRIGGER update_tutor_students_updated_at_trigger
  BEFORE UPDATE ON public.tutor_students
  FOR EACH ROW
  EXECUTE FUNCTION update_tutor_updated_at();

-- Create function for timezone detection and notification
CREATE OR REPLACE FUNCTION detect_tutor_timezone()
RETURNS TRIGGER AS $$
BEGIN
  -- If IP timezone is different from profile timezone, mark as unconfirmed
  IF NEW.ip_timezone IS NOT NULL AND NEW.ip_timezone != NEW.timezone THEN
    NEW.timezone_confirmed = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for timezone detection
CREATE TRIGGER detect_tutor_timezone_trigger
  BEFORE INSERT OR UPDATE ON public.tutor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION detect_tutor_timezone(); 