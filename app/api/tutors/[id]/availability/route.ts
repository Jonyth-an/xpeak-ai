import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    console.log('🔍 Server-side fetchTutorAvailability called with ID:', id, 'month:', month, 'year:', year);

    // Get tutor profile to verify they exist and are active
    const { data: tutorProfile, error: tutorError } = await supabase
      .from('tutor_profiles')
      .select('id, timezone, is_active')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (tutorError || !tutorProfile) {
      console.log('Tutor not found or inactive:', tutorError);
      return NextResponse.json({ error: 'Tutor not found', calendar: null }, { status: 404 });
    }

    // Calculate month start and end dates
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    // Query the tutor_availability table for the specific tutor with specific dates
    const { data: availability, error } = await supabase
      .from('tutor_availability')
      .select(`
        id,
        tutor_id,
        day_of_week,
        start_time,
        end_time,
        specific_date,
        timezone
      `)
      .eq('tutor_id', id)
      .gte('specific_date', monthStartStr)
      .lte('specific_date', monthEndStr)
      .not('specific_date', 'is', null);

    if (error) {
      console.log('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch availability', calendar: null }, { status: 500 });
    }

    // Get booked lessons for the month to mark slots as unavailable
    const { data: bookedLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('scheduled_start, scheduled_end, status')
      .eq('tutor_id', id)
      .gte('scheduled_start', `${monthStartStr}T00:00:00`)
      .lte('scheduled_start', `${monthEndStr}T23:59:59`)
      .in('status', ['confirmed', 'completed']);

    if (lessonsError) {
      console.log('Error fetching booked lessons:', lessonsError);
      return NextResponse.json({ error: 'Failed to fetch booked lessons', calendar: null }, { status: 500 });
    }

    // Generate calendar data for the specified month
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    
    const calendarData = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarData.push({ 
        day: null, 
        available: false, 
        isToday: false, 
        isPast: false,
        availableSlots: []
      });
    }
    
    // Add days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Find availability slots for this specific date
      const dayAvailability = availability?.filter(a => a.specific_date === dateStr) || [];
      
      // Find booked lessons for this date
      const dayBookedLessons = bookedLessons?.filter(lesson => {
        const lessonDate = new Date(lesson.scheduled_start);
        return lessonDate.toISOString().split('T')[0] === dateStr;
      }) || [];

      // Process available time slots, excluding booked times
      const availableSlots: Array<{
        id: string;
        original_slot_id: string;
        start_time: string;
        end_time: string;
        is_booked: boolean;
        available: boolean;
        interval_index: number;
      }> = [];
      
      dayAvailability.forEach(slot => {
        const slotStart = new Date(`${dateStr}T${slot.start_time}`);
        const slotEnd = new Date(`${dateStr}T${slot.end_time}`);
        
        // Generate 30-minute intervals within this slot
        const intervals = [];
        let currentTime = new Date(slotStart);
        
        while (currentTime < slotEnd) {
          const intervalEnd = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30 minutes
          
          // Don't create intervals that extend beyond the original slot
          if (intervalEnd > slotEnd) {
            break;
          }
          
          intervals.push({
            start: new Date(currentTime),
            end: intervalEnd
          });
          
          currentTime = intervalEnd;
        }
        
        // Check each 30-minute interval for conflicts
        intervals.forEach((interval, index) => {
          const now = new Date();
          const isPast = interval.start < now;
          const isBooked = dayBookedLessons.some(lesson => {
            const lessonStart = new Date(lesson.scheduled_start);
            const lessonEnd = new Date(lesson.scheduled_end);
            
            // Check for overlap
            return (interval.start < lessonEnd && interval.end > lessonStart);
          });

          // Only add slots that are in the future and not booked
          if (!isBooked && !isPast) {
            availableSlots.push({
              id: `${slot.id}-${index}`, // Unique ID for each 30-min interval
              original_slot_id: slot.id,
              start_time: interval.start.toTimeString().substring(0, 5),
              end_time: interval.end.toTimeString().substring(0, 5),
              is_booked: false,
              available: true,
              interval_index: index
            });
          }
        });
      });

      // A day is available if it has future, non-booked slots
      const isAvailable = availableSlots.length > 0;
      
      calendarData.push({
        day,
        available: isAvailable,
        isToday,
        isPast,
        availableSlots,
        date: dateStr
      });
    }

    console.log('Generated calendar data:', calendarData);

    return NextResponse.json({ 
      calendar: calendarData,
      month,
      year,
      availability: availability || [],
      booked_lessons: bookedLessons || []
    });

  } catch (error) {
    console.log('Error fetching tutor availability:', error);
    return NextResponse.json(
      { error: `Error fetching availability: ${error instanceof Error ? error.message : String(error)}`, calendar: null },
      { status: 500 }
    );
  }
} 