const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugBookingIssue() {
  console.log('🔍 Debugging Booking Issue\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Check all lessons in the database
    console.log('📊 Checking all lessons...');
    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, tutor_id, student_id, scheduled_start, scheduled_end, status, lesson_type')
      .order('scheduled_start', { ascending: true });

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    console.log(`✅ Found ${allLessons.length} total lessons`);
    
    // Group by status
    const lessonsByStatus = allLessons.reduce((acc, lesson) => {
      acc[lesson.status] = (acc[lesson.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Lessons by status:', lessonsByStatus);

    // 2. Check tutor availability
    console.log('\n📅 Checking tutor availability...');
    const { data: availability, error: availabilityError } = await supabase
      .from('tutor_availability')
      .select('id, tutor_id, specific_date, start_time, end_time')
      .not('specific_date', 'is', null)
      .order('specific_date', { ascending: true });

    if (availabilityError) {
      console.error('❌ Error fetching availability:', availabilityError);
      return;
    }

    console.log(`✅ Found ${availability.length} availability slots`);

    // 3. Check tutor profiles
    console.log('\n👨‍🏫 Checking tutor profiles...');
    const { data: tutors, error: tutorsError } = await supabase
      .from('tutor_profiles')
      .select('id, display_name, is_active')
      .eq('is_active', true);

    if (tutorsError) {
      console.error('❌ Error fetching tutors:', tutorsError);
      return;
    }

    console.log(`✅ Found ${tutors.length} active tutors`);

    // 4. Test a specific booking scenario
    if (tutors.length > 0 && availability.length > 0) {
      const testTutor = tutors[0];
      const testSlot = availability[0];
      
      console.log(`\n🧪 Testing booking for tutor ${testTutor.display_name} on ${testSlot.specific_date}`);
      
      const scheduledStart = `${testSlot.specific_date}T${testSlot.start_time}`;
      const scheduledEnd = `${testSlot.specific_date}T${testSlot.end_time}`;
      
      console.log('📅 Test time slot:', { scheduledStart, scheduledEnd });
      
      // Check for conflicts
      const { data: conflicts, error: conflictError } = await supabase
        .from('lessons')
        .select('id, scheduled_start, scheduled_end, status')
        .eq('tutor_id', testTutor.id)
        .gte('scheduled_start', `${testSlot.specific_date}T00:00:00`)
        .lt('scheduled_start', `${testSlot.specific_date}T23:59:59`)
        .or(`scheduled_start.lt.${scheduledEnd},scheduled_end.gt.${scheduledStart}`)
        .in('status', ['pending', 'confirmed', 'reschedule_requested']);

      if (conflictError) {
        console.error('❌ Error checking conflicts:', conflictError);
        return;
      }

      console.log(`🔍 Found ${conflicts.length} conflicts for this time slot`);
      
      if (conflicts.length > 0) {
        console.log('❌ Conflicts found:');
        conflicts.forEach(conflict => {
          console.log(`  - Lesson ${conflict.id}: ${conflict.scheduled_start} to ${conflict.scheduled_end} (${conflict.status})`);
        });
      } else {
        console.log('✅ No conflicts found - this slot should be bookable');
      }
    }

    // 5. Check for any lessons with unusual statuses
    console.log('\n🔍 Checking for unusual lesson statuses...');
    const unusualStatuses = allLessons.filter(lesson => 
      !['pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'reschedule_requested'].includes(lesson.status)
    );
    
    if (unusualStatuses.length > 0) {
      console.log('⚠️ Found lessons with unusual statuses:');
      unusualStatuses.forEach(lesson => {
        console.log(`  - Lesson ${lesson.id}: ${lesson.status}`);
      });
    } else {
      console.log('✅ All lessons have expected statuses');
    }

    // 6. Check for lessons in the future
    const now = new Date();
    const futureLessons = allLessons.filter(lesson => 
      new Date(lesson.scheduled_start) > now
    );
    
    console.log(`\n📅 Found ${futureLessons.length} lessons in the future`);
    
    if (futureLessons.length > 0) {
      console.log('🔮 Future lessons:');
      futureLessons.slice(0, 5).forEach(lesson => {
        console.log(`  - ${lesson.scheduled_start} (${lesson.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugBookingIssue(); 