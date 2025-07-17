const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSpecificBooking() {
  console.log('🧪 Testing Specific Booking Scenario\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get a specific tutor and availability slot
    const { data: tutors } = await supabase
      .from('tutor_profiles')
      .select('id, display_name')
      .eq('is_active', true)
      .limit(1);

    if (!tutors || tutors.length === 0) {
      console.error('❌ No active tutors found');
      return;
    }

    const tutor = tutors[0];
    console.log(`👨‍🏫 Testing with tutor: ${tutor.display_name} (${tutor.id})`);

    // Get availability for this tutor
    const { data: availability } = await supabase
      .from('tutor_availability')
      .select('id, specific_date, start_time, end_time')
      .eq('tutor_id', tutor.id)
      .not('specific_date', 'is', null)
      .gte('specific_date', '2025-07-17')
      .limit(1);

    if (!availability || availability.length === 0) {
      console.error('❌ No availability found for this tutor');
      return;
    }

    const slot = availability[0];
    console.log(`📅 Testing slot: ${slot.specific_date} ${slot.start_time}-${slot.end_time}`);

    // Test the exact booking scenario
    const date = slot.specific_date;
    const startTime = slot.start_time;
    const endTime = slot.end_time;
    
    const scheduledStart = `${date}T${startTime}:00`;
    const scheduledEnd = `${date}T${endTime}:00`;
    
    console.log('🔍 Testing booking parameters:');
    console.log('  - Date:', date);
    console.log('  - Start Time:', startTime);
    console.log('  - End Time:', endTime);
    console.log('  - Scheduled Start:', scheduledStart);
    console.log('  - Scheduled End:', scheduledEnd);

    // Check for conflicts using the exact same logic as the booking API
    console.log('\n🔍 Checking for conflicts...');
    
    // 1. Check tutor conflicts
    const { data: tutorConflicts, error: tutorConflictError } = await supabase
      .from('lessons')
      .select('id, scheduled_start, scheduled_end, status')
      .eq('tutor_id', tutor.id)
      .gte('scheduled_start', `${date}T00:00:00`)
      .lt('scheduled_start', `${date}T23:59:59`)
      .or(`scheduled_start.lt.${scheduledEnd},scheduled_end.gt.${scheduledStart}`)
      .in('status', ['pending', 'confirmed', 'reschedule_requested']);

    if (tutorConflictError) {
      console.error('❌ Error checking tutor conflicts:', tutorConflictError);
      return;
    }

    console.log(`📊 Found ${tutorConflicts.length} tutor conflicts`);
    if (tutorConflicts.length > 0) {
      console.log('❌ Tutor conflicts:');
      tutorConflicts.forEach(conflict => {
        console.log(`  - Lesson ${conflict.id}: ${conflict.scheduled_start} to ${conflict.scheduled_end} (${conflict.status})`);
      });
    }

    // 2. Check all lessons for this tutor on this date (without overlap check)
    const { data: allTutorLessons } = await supabase
      .from('lessons')
      .select('id, scheduled_start, scheduled_end, status')
      .eq('tutor_id', tutor.id)
      .gte('scheduled_start', `${date}T00:00:00`)
      .lt('scheduled_start', `${date}T23:59:59`);

    console.log(`📊 All tutor lessons on ${date}: ${allTutorLessons.length}`);
    if (allTutorLessons.length > 0) {
      allTutorLessons.forEach(lesson => {
        console.log(`  - Lesson ${lesson.id}: ${lesson.scheduled_start} to ${lesson.scheduled_end} (${lesson.status})`);
      });
    }

    // 3. Check all lessons for this tutor (any date)
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id, scheduled_start, scheduled_end, status')
      .eq('tutor_id', tutor.id)
      .in('status', ['pending', 'confirmed', 'reschedule_requested']);

    console.log(`📊 All active lessons for tutor: ${allLessons.length}`);
    if (allLessons.length > 0) {
      allLessons.forEach(lesson => {
        console.log(`  - Lesson ${lesson.id}: ${lesson.scheduled_start} to ${lesson.scheduled_end} (${lesson.status})`);
      });
    }

    // 4. Test the overlap logic manually
    console.log('\n🔍 Testing overlap logic manually...');
    const testStart = new Date(scheduledStart);
    const testEnd = new Date(scheduledEnd);
    
    console.log('  - Test start:', testStart.toISOString());
    console.log('  - Test end:', testEnd.toISOString());
    
    allLessons.forEach(lesson => {
      const lessonStart = new Date(lesson.scheduled_start);
      const lessonEnd = new Date(lesson.scheduled_end);
      
      const hasOverlap = testStart < lessonEnd && testEnd > lessonStart;
      
      console.log(`  - Lesson ${lesson.id}: ${lessonStart.toISOString()} to ${lessonEnd.toISOString()} - Overlap: ${hasOverlap}`);
    });

    // 5. Check if the slot is actually available
    console.log('\n🔍 Checking if slot is marked as available...');
    const { data: slotAvailability } = await supabase
      .from('tutor_availability')
      .select('*')
      .eq('id', slot.id);

    console.log('Slot availability:', slotAvailability);

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testSpecificBooking(); 