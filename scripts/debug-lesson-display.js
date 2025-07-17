const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugLessonDisplay() {
  console.log('🔍 Debugging lesson display issue...\n');

  const studentId = 'e65af545-4e3f-4475-ba1a-e3702f1ee3b4';
  const tutorId = '4f4e6ea2-81aa-417b-95fe-c9ec2fc36572';

  try {
    // 1. Check all lessons for the student
    console.log('📊 Checking lessons for student:', studentId);
    const { data: studentLessons, error: studentError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_start', { ascending: true });

    if (studentError) {
      console.error('❌ Error fetching student lessons:', studentError);
      return;
    }

    console.log(`✅ Found ${studentLessons?.length || 0} lessons for student:`);
    studentLessons?.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ID: ${lesson.id}`);
      console.log(`     Status: ${lesson.status}`);
      console.log(`     Scheduled: ${lesson.scheduled_start} to ${lesson.scheduled_end}`);
      console.log(`     Tutor: ${lesson.tutor_id}`);
      console.log(`     Created: ${lesson.created_at}`);
      console.log('');
    });

    // 2. Check all lessons for the tutor
    console.log('📊 Checking lessons for tutor:', tutorId);
    const { data: tutorLessons, error: tutorError } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('scheduled_start', { ascending: true });

    if (tutorError) {
      console.error('❌ Error fetching tutor lessons:', tutorError);
      return;
    }

    console.log(`✅ Found ${tutorLessons?.length || 0} lessons for tutor:`);
    tutorLessons?.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ID: ${lesson.id}`);
      console.log(`     Status: ${lesson.status}`);
      console.log(`     Scheduled: ${lesson.scheduled_start} to ${lesson.scheduled_end}`);
      console.log(`     Student: ${lesson.student_id}`);
      console.log(`     Created: ${lesson.created_at}`);
      console.log('');
    });

    // 3. Check for lessons on July 17th specifically
    console.log('📅 Checking for lessons on July 17th, 2025...');
    const { data: july17Lessons, error: july17Error } = await supabase
      .from('lessons')
      .select('*')
      .gte('scheduled_start', '2025-07-17T00:00:00')
      .lt('scheduled_start', '2025-07-18T00:00:00')
      .order('scheduled_start', { ascending: true });

    if (july17Error) {
      console.error('❌ Error fetching July 17th lessons:', july17Error);
      return;
    }

    console.log(`✅ Found ${july17Lessons?.length || 0} lessons on July 17th:`);
    july17Lessons?.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ID: ${lesson.id}`);
      console.log(`     Status: ${lesson.status}`);
      console.log(`     Scheduled: ${lesson.scheduled_start} to ${lesson.scheduled_end}`);
      console.log(`     Tutor: ${lesson.tutor_id}, Student: ${lesson.student_id}`);
      console.log('');
    });

    // 4. Check current time and upcoming filter
    const now = new Date();
    console.log(`🕐 Current time: ${now.toISOString()}`);
    console.log(`🕐 Current time (local): ${now.toString()}`);

    // 5. Check what the upcoming filter would return
    console.log('\n🔍 Testing upcoming filter logic...');
    const { data: upcomingLessons, error: upcomingError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .gte('scheduled_start', now.toISOString())
      .order('scheduled_start', { ascending: true });

    if (upcomingError) {
      console.error('❌ Error fetching upcoming lessons:', upcomingError);
      return;
    }

    console.log(`✅ Upcoming filter would return ${upcomingLessons?.length || 0} lessons:`);
    upcomingLessons?.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ID: ${lesson.id}`);
      console.log(`     Status: ${lesson.status}`);
      console.log(`     Scheduled: ${lesson.scheduled_start} to ${lesson.scheduled_end}`);
      console.log(`     Minutes until: ${Math.floor((new Date(lesson.scheduled_start).getTime() - now.getTime()) / (1000 * 60))}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugLessonDisplay(); 