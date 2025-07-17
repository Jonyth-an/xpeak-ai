const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBookingFix() {
  console.log('🧪 Testing booking fix...\n');

  try {
    // 1. Get a tutor
    const { data: tutors, error: tutorsError } = await supabase
      .from('tutor_profiles')
      .select('id, display_name, user_id')
      .eq('is_active', true)
      .limit(1);

    if (tutorsError || !tutors.length) {
      console.error('❌ No active tutors found');
      return;
    }

    const tutor = tutors[0];
    console.log(`✅ Found tutor: ${tutor.display_name} (${tutor.id})`);

    // 2. Get tutor availability
    const { data: availability, error: availabilityError } = await supabase
      .from('tutor_availability')
      .select('*')
      .eq('tutor_id', tutor.id)
      .not('specific_date', 'is', null)
      .gte('specific_date', new Date().toISOString().split('T')[0])
      .limit(1);

    if (availabilityError || !availability.length) {
      console.error('❌ No availability found for tutor');
      return;
    }

    const slot = availability[0];
    console.log(`✅ Found availability slot: ${slot.specific_date} ${slot.start_time}-${slot.end_time}`);

    // 3. Test the conflict detection logic
    const testDate = slot.specific_date;
    const testStartTime = slot.start_time;
    const testEndTime = slot.end_time;
    
    const scheduledStart = `${testDate}T${testStartTime}`;
    const scheduledEnd = `${testDate}T${testEndTime}`;

    console.log(`\n🔍 Testing conflict detection for: ${scheduledStart} to ${scheduledEnd}`);

    // Get all lessons for this tutor on this date
    const { data: conflictingLessons, error: conflictError } = await supabase
      .from('lessons')
      .select('id, scheduled_start, scheduled_end, status')
      .eq('tutor_id', tutor.id)
      .gte('scheduled_start', `${testDate}T00:00:00`)
      .lt('scheduled_start', `${testDate}T23:59:59`)
      .in('status', ['pending', 'confirmed', 'reschedule_requested']);

    if (conflictError) {
      console.error('❌ Error checking conflicts:', conflictError);
      return;
    }

    console.log(`📊 Found ${conflictingLessons.length} lessons on ${testDate}`);

    // Apply the new conflict detection logic
    const actualConflicts = conflictingLessons.filter(lesson => {
      const lessonStart = new Date(lesson.scheduled_start);
      const lessonEnd = new Date(lesson.scheduled_end);
      const requestedStart = new Date(scheduledStart);
      const requestedEnd = new Date(scheduledEnd);
      
      // Check for overlap: if one lesson starts before another ends and ends after another starts
      return (lessonStart < requestedEnd && lessonEnd > requestedStart);
    });

    console.log(`🔍 Actual conflicts found: ${actualConflicts.length}`);

    if (actualConflicts.length > 0) {
      console.log('❌ Conflicts detected:');
      actualConflicts.forEach(conflict => {
        console.log(`  - Lesson ${conflict.id}: ${conflict.scheduled_start} to ${conflict.scheduled_end} (${conflict.status})`);
      });
    } else {
      console.log('✅ No conflicts detected - this slot should be bookable!');
    }

    // 4. Test with a student
    const { data: students, error: studentsError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(1);

    if (studentsError || !students.length) {
      console.error('❌ No students found');
      return;
    }

    const student = students[0];
    console.log(`\n👤 Testing with student: ${student.email}`);

    // Check student conflicts
    const { data: userConflicts, error: userConflictError } = await supabase
      .from('lessons')
      .select('id, scheduled_start, scheduled_end, status')
      .eq('student_id', student.id)
      .gte('scheduled_start', `${testDate}T00:00:00`)
      .lt('scheduled_start', `${testDate}T23:59:59`)
      .in('status', ['pending', 'confirmed', 'reschedule_requested']);

    if (userConflictError) {
      console.error('❌ Error checking user conflicts:', userConflictError);
      return;
    }

    const actualUserConflicts = userConflicts.filter(lesson => {
      const lessonStart = new Date(lesson.scheduled_start);
      const lessonEnd = new Date(lesson.scheduled_end);
      const requestedStart = new Date(scheduledStart);
      const requestedEnd = new Date(scheduledEnd);
      
      return (lessonStart < requestedEnd && lessonEnd > requestedStart);
    });

    console.log(`👤 Student conflicts found: ${actualUserConflicts.length}`);

    if (actualUserConflicts.length > 0) {
      console.log('❌ Student has conflicts:');
      actualUserConflicts.forEach(conflict => {
        console.log(`  - Lesson ${conflict.id}: ${conflict.scheduled_start} to ${conflict.scheduled_end} (${conflict.status})`);
      });
    } else {
      console.log('✅ Student has no conflicts');
    }

    // 5. Summary
    console.log('\n📋 Summary:');
    console.log(`- Tutor: ${tutor.display_name}`);
    console.log(`- Date: ${testDate}`);
    console.log(`- Time: ${testStartTime} - ${testEndTime}`);
    console.log(`- Tutor conflicts: ${actualConflicts.length}`);
    console.log(`- Student conflicts: ${actualUserConflicts.length}`);
    
    if (actualConflicts.length === 0 && actualUserConflicts.length === 0) {
      console.log('🎉 This slot should be bookable!');
    } else {
      console.log('❌ This slot has conflicts and cannot be booked.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBookingFix(); 