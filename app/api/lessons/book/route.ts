import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { serverSupabase } from '@/lib/serverSupabaseClient';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Booking API called - checking authentication...');
    
    let user = null;
    let sessionError = null;
    
    // Method 1: Try Authorization header (primary method since client uses localStorage)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🔐 Trying Authorization header with token...');
      
      const { data, error } = await serverSupabase.auth.getUser(token);
      if (data?.user) {
        user = data.user;
        console.log('✅ User authenticated via Authorization header:', user.email);
      } else {
        sessionError = error;
        console.log('❌ Authorization header failed:', error?.message);
      }
    }
    
    // Method 2: Try cookie-based session (fallback)
    if (!user) {
      try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return cookieStore.getAll();
              },
              setAll() {
                // No-op for API routes
              },
            },
          }
        );
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('🔐 Cookie session check result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          error: sessionError?.message
        });
        
        if (session && session.user) {
          user = session.user;
          console.log('✅ User authenticated via cookies:', user.email);
        }
      } catch (err) {
        console.log('❌ Cookie session failed:', err);
      }
    }
    
    if (!user) {
      console.error('❌ No active session found');
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'No active session found. Please log in.' }, { status: 401 });
    }
    
    console.log('✅ User authenticated:', user.email);
    
    // Parse request body
    const { tutorId, date, startTime, endTime, bookingType = 'lesson' } = await request.json();
    
    if (!tutorId || !date || !startTime || !endTime) {
      return NextResponse.json({ 
        error: 'Missing required fields: tutorId, date, startTime, endTime' 
      }, { status: 400 });
    }
    
    // Check for existing bookings that conflict with this time slot
    const scheduledStart = `${date}T${startTime}:00`;
    const scheduledEnd = `${date}T${endTime}:00`;
    
    console.log('🔍 Checking for time conflicts...');
    console.log('📅 Requested time slot:', { scheduledStart, scheduledEnd });
    
    const { data: conflictingLessons, error: conflictError } = await serverSupabase
      .from('lessons')
      .select('id, scheduled_start, scheduled_end, status')
      .eq('tutor_id', tutorId)
      .or(`scheduled_start.lt.${scheduledEnd},scheduled_end.gt.${scheduledStart}`)
      .in('status', ['pending', 'confirmed', 'reschedule_requested']);
    
    if (conflictError) {
      console.error('Error checking conflicts:', conflictError);
      return NextResponse.json({ 
        error: 'Failed to check availability. Please try again.' 
      }, { status: 500 });
    }
    
    if (conflictingLessons && conflictingLessons.length > 0) {
      console.log('❌ Time conflict detected:', conflictingLessons);
      return NextResponse.json({ 
        error: 'This time slot is no longer available. Please select a different time.',
        conflicts: conflictingLessons
      }, { status: 409 });
    }
    
    // Check if user already has a booking at this time
    const { data: userConflicts, error: userConflictError } = await serverSupabase
      .from('lessons')
      .select('id, scheduled_start, scheduled_end, status')
      .eq('student_id', user.id)
      .or(`scheduled_start.lt.${scheduledEnd},scheduled_end.gt.${scheduledStart}`)
      .in('status', ['pending', 'confirmed', 'reschedule_requested']);
    
    if (userConflictError) {
      console.error('Error checking user conflicts:', userConflictError);
      return NextResponse.json({ 
        error: 'Failed to check your schedule. Please try again.' 
      }, { status: 500 });
    }
    
    if (userConflicts && userConflicts.length > 0) {
      console.log('❌ User has conflicting lesson:', userConflicts);
      return NextResponse.json({ 
        error: 'You already have a lesson scheduled at this time. Please select a different time.',
        conflicts: userConflicts
      }, { status: 409 });
    }
    
    console.log('✅ No conflicts detected, proceeding with booking...');
    
    // Get user's timezone from profile or use default
    let studentTimezone = 'UTC';
    try {
      const { data: userProfile } = await serverSupabase
        .from('user_profiles')
        .select('timezone')
        .eq('user_id', user.id)
        .single();
      
      if (userProfile?.timezone) {
        studentTimezone = userProfile.timezone;
      }
    } catch (error) {
      console.log('Could not fetch user timezone, using default UTC');
    }
    
    // Get tutor's timezone from profile or use default
    let tutorTimezone = 'UTC';
    try {
      const { data: tutorProfile } = await serverSupabase
        .from('tutor_profiles')
        .select('timezone')
        .eq('user_id', tutorId)
        .single();
      
      if (tutorProfile?.timezone) {
        tutorTimezone = tutorProfile.timezone;
      }
    } catch (error) {
      console.log('Could not fetch tutor timezone, using default UTC');
    }
    
    // Create lesson record - only include fields that exist in the lessons table
    const lessonData = {
      tutor_id: tutorId,
      student_id: user.id,
      lesson_type: bookingType === 'trial' ? 'Trial Lesson' : 'Conversation Practice',
      duration_minutes: 30,
      status: 'pending',
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      price_paid: 15.00,
      currency: 'USD',
      student_timezone: studentTimezone,
      tutor_timezone: tutorTimezone
    };
    
    console.log('📝 Creating lesson with data:', lessonData);
    
    const { data: lesson, error: lessonError } = await serverSupabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();
    
    if (lessonError) {
      console.error('Error creating lesson:', lessonError);
      return NextResponse.json({ 
        error: 'Failed to create lesson. Please try again.' 
      }, { status: 500 });
    }
    
    console.log('✅ Lesson created successfully:', lesson.id);
    
    return NextResponse.json({
      success: true,
      lessonId: lesson.id,
      message: `${bookingType === 'trial' ? 'Trial lesson' : 'Lesson'} booked successfully!`
    });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({ error: 'Booking failed. Please try again.' }, { status: 500 });
  }
} 