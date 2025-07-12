import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/serverSupabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tutor profile
    const { data: tutorProfile, error: profileError } = await serverSupabase
      .from('tutor_profiles')
      .select('id, timezone')
      .eq('user_id', user.id)
      .single();

    if (profileError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('week_start'); // Format: YYYY-MM-DD
    
    if (!weekStart) {
      return NextResponse.json({ error: 'week_start parameter is required' }, { status: 400 });
    }

    // Calculate week end
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    // Get availability for the week
    const { data: availability, error: availabilityError } = await serverSupabase
      .from('tutor_availability')
      .select('*')
      .eq('tutor_id', tutorProfile.id)
      .or(`is_recurring.eq.true,and(specific_date.gte.${weekStart},specific_date.lte.${endDate.toISOString().split('T')[0]})`);

    if (availabilityError) {
      console.error('Error fetching availability:', availabilityError);
      return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }

    // Get booked lessons for the week
    const { data: bookedLessons, error: lessonsError } = await serverSupabase
      .from('lessons')
      .select('scheduled_start, scheduled_end, status, student_id')
      .eq('tutor_id', tutorProfile.id)
      .gte('scheduled_start', `${weekStart}T00:00:00`)
      .lte('scheduled_start', `${endDate.toISOString().split('T')[0]}T23:59:59`)
      .in('status', ['confirmed', 'completed']);

    if (lessonsError) {
      console.error('Error fetching booked lessons:', lessonsError);
      return NextResponse.json({ error: 'Failed to fetch booked lessons' }, { status: 500 });
    }

    // Process availability data
    const processedAvailability = availability || [];
    const processedBookedLessons = bookedLessons || [];

    // Calculate weekly stats
    const totalSlots = processedAvailability.length * 7; // Assuming each slot is available all week
    const bookedSlots = processedBookedLessons.length;
    const availableSlots = Math.max(0, totalSlots - bookedSlots);
    const bookingRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

    return NextResponse.json({
      availability: processedAvailability,
      booked_lessons: processedBookedLessons,
      week_stats: {
        available_slots: availableSlots,
        booked_lessons: bookedSlots,
        booking_rate: bookingRate
      },
      tutor_timezone: tutorProfile.timezone
    });

  } catch (error) {
    console.error('Error in availability GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tutor profile
    const { data: tutorProfile, error: profileError } = await serverSupabase
      .from('tutor_profiles')
      .select('id, timezone')
      .eq('user_id', user.id)
      .single();

    if (profileError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const { 
      day_of_week, 
      start_time, 
      end_time, 
      is_recurring = true, 
      specific_date 
    } = await request.json();

    // Validate required fields
    if (day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json({ 
        error: 'day_of_week, start_time, and end_time are required' 
      }, { status: 400 });
    }

    // Validate day_of_week range
    if (day_of_week < 0 || day_of_week > 6) {
      return NextResponse.json({ 
        error: 'day_of_week must be between 0 (Sunday) and 6 (Saturday)' 
      }, { status: 400 });
    }

    // Validate time format and logic
    const startTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const endTimeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!startTimeRegex.test(start_time) || !endTimeRegex.test(end_time)) {
      return NextResponse.json({ 
        error: 'start_time and end_time must be in HH:MM format' 
      }, { status: 400 });
    }

    // Check if end time is after start time
    const [startHour, startMin] = start_time.split(':').map(Number);
    const [endHour, endMin] = end_time.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return NextResponse.json({ 
        error: 'end_time must be after start_time' 
      }, { status: 400 });
    }

    // Check for conflicts with existing availability
    const { data: existingAvailability, error: conflictError } = await serverSupabase
      .from('tutor_availability')
      .select('*')
      .eq('tutor_id', tutorProfile.id)
      .eq('day_of_week', day_of_week)
      .eq('is_recurring', is_recurring);

    if (conflictError) {
      console.error('Error checking conflicts:', conflictError);
      return NextResponse.json({ error: 'Failed to check conflicts' }, { status: 500 });
    }

    // Check for time overlaps
    const hasConflict = existingAvailability?.some(slot => {
      const existingStart = slot.start_time;
      const existingEnd = slot.end_time;
      
      return (
        (start_time >= existingStart && start_time < existingEnd) ||
        (end_time > existingStart && end_time <= existingEnd) ||
        (start_time <= existingStart && end_time >= existingEnd)
      );
    });

    if (hasConflict) {
      return NextResponse.json({ 
        error: 'Time slot conflicts with existing availability' 
      }, { status: 409 });
    }

    // Create new availability slot
    const newSlot = {
      tutor_id: tutorProfile.id,
      day_of_week,
      start_time,
      end_time,
      is_recurring,
      specific_date,
      timezone: tutorProfile.timezone
    };

    const { data: createdSlot, error: createError } = await serverSupabase
      .from('tutor_availability')
      .insert([newSlot])
      .select()
      .single();

    if (createError) {
      console.error('Error creating availability slot:', createError);
      return NextResponse.json({ error: 'Failed to create availability slot' }, { status: 500 });
    }

    return NextResponse.json({
      availability: createdSlot,
      message: 'Availability slot created successfully'
    });

  } catch (error) {
    console.error('Error in availability POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Get user from Supabase
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get tutor profile
    const { data: tutorProfile, error: profileError } = await serverSupabase
      .from('tutor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !tutorProfile) {
      return NextResponse.json({ error: 'Tutor profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get('slot_id');

    if (!slotId) {
      return NextResponse.json({ error: 'slot_id parameter is required' }, { status: 400 });
    }

    // Check if slot belongs to tutor
    const { data: slot, error: slotError } = await serverSupabase
      .from('tutor_availability')
      .select('*')
      .eq('id', slotId)
      .eq('tutor_id', tutorProfile.id)
      .single();

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Availability slot not found' }, { status: 404 });
    }

    // Check if there are any booked lessons in this time slot
    const { data: bookedLessons, error: lessonsError } = await serverSupabase
      .from('lessons')
      .select('id')
      .eq('tutor_id', tutorProfile.id)
      .gte('scheduled_start', new Date().toISOString())
      .in('status', ['confirmed']);

    if (lessonsError) {
      console.error('Error checking booked lessons:', lessonsError);
      return NextResponse.json({ error: 'Failed to check booked lessons' }, { status: 500 });
    }

    // For now, allow deletion even with booked lessons (in production, you might want to prevent this)
    if (bookedLessons && bookedLessons.length > 0) {
      console.warn(`Deleting availability slot with ${bookedLessons.length} booked lessons`);
    }

    // Delete the availability slot
    const { error: deleteError } = await serverSupabase
      .from('tutor_availability')
      .delete()
      .eq('id', slotId)
      .eq('tutor_id', tutorProfile.id);

    if (deleteError) {
      console.error('Error deleting availability slot:', deleteError);
      return NextResponse.json({ error: 'Failed to delete availability slot' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Availability slot deleted successfully'
    });

  } catch (error) {
    console.error('Error in availability DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 