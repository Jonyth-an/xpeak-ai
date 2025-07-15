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

    // Get both recurring slots and specific date slots for the week
    const weekStartStr = weekStart;
    const weekEndStr = endDate.toISOString().split('T')[0];
    console.log('Fetching availability for tutor_id:', tutorProfile.id, 'week:', weekStartStr, 'to', weekEndStr);
    
    // Fetch only slots with specific_date within the week
    const { data: weekSlots, error: weekSlotsError } = await serverSupabase
      .from('tutor_availability')
      .select('*')
      .eq('tutor_id', tutorProfile.id)
      .gte('specific_date', weekStartStr)
      .lte('specific_date', weekEndStr);

    if (weekSlotsError) {
      console.error('Error fetching week slots:', weekSlotsError);
      return NextResponse.json({ error: 'Failed to fetch week availability', details: weekSlotsError }, { status: 500 });
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
    const processedAvailability = weekSlots || [];
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

    const slots = await request.json();
    if (!Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: 'No slots provided' }, { status: 400 });
    }
    // Validate all slots
    for (const slot of slots) {
      if (!slot.specific_date || !slot.start_time || !slot.end_time) {
        return NextResponse.json({ error: 'Each slot must have specific_date, start_time, and end_time' }, { status: 400 });
      }
    }
    // Insert all slots
    const newSlots = slots.map(slot => ({
      tutor_id: tutorProfile.id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      specific_date: slot.specific_date,
      timezone: tutorProfile.timezone
    }));
    const { data: createdSlots, error: createError } = await serverSupabase
      .from('tutor_availability')
      .insert(newSlots)
      .select();
    if (createError) {
      console.error('Error creating slots:', createError);
      return NextResponse.json({ error: 'Failed to create slots' }, { status: 500 });
    }
    return NextResponse.json({
      availability: createdSlots,
      message: 'Slots created successfully'
    });
  } catch (error) {
    console.error('Error in availability POST:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
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