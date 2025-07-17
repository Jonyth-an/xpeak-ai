const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTimezoneIssue() {
  console.log('🔍 Checking timezone issue...\n');

  const studentId = 'e65af545-4e3f-4475-ba1a-e3702f1ee3b4';
  const tutorId = '4f4e6ea2-81aa-417b-95fe-c9ec2fc36572';

  try {
    // 1. Check the existing lesson details
    console.log('📊 Checking existing lesson details...');
    
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .eq('scheduled_start', '2025-07-17T11:30:00+00:00')
      .single();

    if (lessonError) {
      console.error('❌ Error fetching lesson:', lessonError);
      return;
    }

    console.log('✅ Found lesson:', {
      id: lesson.id,
      scheduled_start: lesson.scheduled_start,
      scheduled_end: lesson.scheduled_end,
      student_timezone: lesson.student_timezone,
      tutor_timezone: lesson.tutor_timezone,
      status: lesson.status
    });

    // 2. Check current time in different timezones
    const now = new Date();
    console.log('\n🕐 Current time analysis:');
    console.log(`   UTC: ${now.toISOString()}`);
    console.log(`   Local: ${now.toString()}`);
    console.log(`   Pacific: ${now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);

    // 3. Check what time the lesson should be in different timezones
    const lessonStart = new Date(lesson.scheduled_start);
    console.log('\n📅 Lesson time analysis:');
    console.log(`   UTC: ${lessonStart.toISOString()}`);
    console.log(`   Local: ${lessonStart.toString()}`);
    console.log(`   Pacific: ${lessonStart.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);

    // 4. Check if the lesson is in the past
    const minutesUntil = Math.floor((lessonStart.getTime() - now.getTime()) / (1000 * 60));
    console.log(`\n⏰ Minutes until lesson: ${minutesUntil}`);
    console.log(`   Is in past: ${minutesUntil < 0 ? 'Yes' : 'No'}`);

    // 5. Check what the upcoming filter would return
    console.log('\n🔍 Testing upcoming filter...');
    const { data: upcomingLessons, error: upcomingError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .gte('scheduled_start', now.toISOString());

    if (!upcomingError) {
      console.log(`✅ Upcoming filter returns ${upcomingLessons?.length || 0} lessons:`);
      upcomingLessons?.forEach((l, i) => {
        const lessonTime = new Date(l.scheduled_start);
        const minutesUntil = Math.floor((lessonTime.getTime() - now.getTime()) / (1000 * 60));
        console.log(`  ${i + 1}. ID: ${l.id}, Time: ${l.scheduled_start}, Minutes until: ${minutesUntil}`);
      });
    }

    // 6. Check what time it should be for a future lesson
    console.log('\n🔮 Testing future lesson time...');
    const futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + 2); // 2 hours from now
    
    console.log(`   Future time (UTC): ${futureTime.toISOString()}`);
    console.log(`   Future time (Pacific): ${futureTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);

    // 7. Check user and tutor timezone settings
    console.log('\n🌍 Checking timezone settings...');
    
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('timezone')
      .eq('user_id', studentId)
      .single();

    if (!userError && userProfile) {
      console.log(`   Student timezone: ${userProfile.timezone}`);
    }

    const { data: tutorProfile, error: tutorError } = await supabase
      .from('tutor_profiles')
      .select('timezone')
      .eq('id', tutorId)
      .single();

    if (!tutorError && tutorProfile) {
      console.log(`   Tutor timezone: ${tutorProfile.timezone}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTimezoneIssue(); 