import React from 'react';
import Layout from '../../../components/Layout';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import RealTimeCalendar from './components/RealTimeCalendar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchTutor(id: string) {
  // Use Supabase directly for server-side data fetching
  try {
    console.log('🔍 Server-side fetchTutor called with ID:', id);
    
    const { data: tutor, error } = await supabase
      .from('tutor_profiles')
      .select(`
        id,
        display_name,
        profile_image_url,
        bio,
        hourly_rate,
        languages_taught,
        specializations,
        is_active
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.log('Database error:', error);
      return { error: 'Tutor not found', tutor: null };
    }

    if (!tutor) {
      console.log('No tutor found for ID:', id);
      return { error: 'Tutor not found', tutor: null };
    }

    // Transform the data to match the expected format
    const transformedTutor = {
      id: tutor.id,
      name: tutor.display_name,
      profile_image_url: tutor.profile_image_url,
      accent: tutor.languages_taught?.[0]?.language || 'English',
      certificates: tutor.specializations || [],
      average_rating: 5.0, // Placeholder
      review_count: 0, // Placeholder
      lesson_count: 0, // Placeholder
      bio: tutor.bio,
      hourly_rate: tutor.hourly_rate
    };

    console.log('Found tutor:', transformedTutor);
    return { tutor: transformedTutor };
  } catch (error) {
    console.log('Error fetching tutor:', error);
    return { error: `Error fetching tutor: ${error instanceof Error ? error.message : String(error)}`, tutor: null };
  }
}

async function fetchTutorAvailability(id: string) {
  try {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

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
      return { error: 'Tutor not found', calendar: null };
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
      return { error: 'Failed to fetch availability', calendar: null };
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
      return { error: 'Failed to fetch booked lessons', calendar: null };
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
          const isBooked = dayBookedLessons.some(lesson => {
            const lessonStart = new Date(lesson.scheduled_start);
            const lessonEnd = new Date(lesson.scheduled_end);
            
            // Check for overlap
            return (interval.start < lessonEnd && interval.end > lessonStart);
          });

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

      const isAvailable = availableSlots.length > 0 && !isPast;
      
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

    return { 
      calendar: calendarData,
      month,
      year,
      availability: availability || [],
      booked_lessons: bookedLessons || []
    };

  } catch (error) {
    console.log('Error fetching tutor availability:', error);
    return { error: `Error fetching availability: ${error instanceof Error ? error.message : String(error)}`, calendar: null };
  }
}

export default async function TutorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tutorResult, availabilityResult] = await Promise.all([
    fetchTutor(id),
    fetchTutorAvailability(id)
  ]);

  if (tutorResult.error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-500 mb-4">{tutorResult.error}</p>
          <p className="text-sm text-gray-500">(Check server logs for details.)</p>
        </div>
      </Layout>
    );
  }

  const { tutor } = tutorResult;
  const { calendar, month, year } = availabilityResult || { calendar: [], month: 1, year: new Date().getFullYear() };

  // Ensure we have valid data
  if (!tutor) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-red-500 mb-4">Tutor data not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-16">
        <div className="flex flex-col items-center mb-8">
          <img
            src={tutor.profile_image_url}
            alt={tutor.name}
            className="w-24 h-24 rounded-full mb-4 object-cover"
          />
          <h3 className="text-2xl font-bold mb-2">{tutor.name}</h3>
          <div className="text-text-secondary mb-2">{tutor.accent}</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {tutor.certificates?.map((c: string, i: number) => (
              <span key={i} className="bg-surface-subtle px-2 py-1 rounded text-xs">
                {c}
              </span>
            ))}
          </div>
          <div className="flex gap-4 mb-2">
            <span className="text-yellow-500 font-semibold">★ {tutor.average_rating || 5.0}</span>
            <span className="text-text-secondary">{tutor.review_count || 0} reviews</span>
            <span className="text-text-secondary">{tutor.lesson_count || 0} lessons</span>
          </div>
        </div>

        {/* Self-Introduction Video Section */}
        <div className="w-full mb-8">
          <h4 className="font-semibold mb-4 text-lg">Self-Introduction Video</h4>
          <div className="bg-gray-200 rounded h-40 flex items-center justify-center text-gray-500">
            (Video placeholder)
          </div>
        </div>

        {/* Real-time Calendar Section */}
        <RealTimeCalendar 
          tutorId={tutor.id}
          initialCalendar={calendar || []}
          initialMonth={month || 1}
          initialYear={year || new Date().getFullYear()}
        />
      </div>
    </Layout>
  );
} 