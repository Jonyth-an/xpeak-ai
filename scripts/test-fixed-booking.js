const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFixedBooking() {
  console.log('🔍 Testing fixed booking with timezone handling...\n');

  const studentId = 'e65af545-4e3f-4475-ba1a-e3702f1ee3b4';
  const tutorId = '4f4e6ea2-81aa-417b-95fe-c9ec2fc36572';

  try {
    // 1. Get user timezone
    console.log('🌍 Getting user timezone...');
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('timezone')
      .eq('user_id', studentId)
      .single();

    const userTimezone = userError ? 'UTC' : (userProfile?.timezone || 'UTC');
    console.log(`   User timezone: ${userTimezone}`);

    // 2. Test timezone conversion logic
    console.log('\n🕐 Testing timezone conversion...');
    
    const date = '2025-07-17';
    const startTime = '11:30';
    const endTime = '12:30';
    
    // Simulate the booking API logic
    const localDateTimeStart = `${date}T${startTime}`;
    const localDateTimeEnd = `${date}T${endTime}`;
    
    // Convert to UTC
    const scheduledStart = new Date(localDateTimeStart + (userTimezone !== 'UTC' ? ` ${userTimezone}` : '')).toISOString();
    const scheduledEnd = new Date(localDateTimeEnd + (userTimezone !== 'UTC' ? ` ${userTimezone}` : '')).toISOString();
    
    console.log('   Local time:', { start: localDateTimeStart, end: localDateTimeEnd });
    console.log('   UTC time:', { start: scheduledStart, end: scheduledEnd });
    
    // 3. Check current time
    const now = new Date();
    console.log('\n🕐 Current time analysis:');
    console.log(`   UTC: ${now.toISOString()}`);
    console.log(`   Local: ${now.toString()}`);
    
    // 4. Check if the converted time is in the future
    const lessonStart = new Date(scheduledStart);
    const minutesUntil = Math.floor((lessonStart.getTime() - now.getTime()) / (1000 * 60));
    console.log(`\n⏰ Minutes until lesson: ${minutesUntil}`);
    console.log(`   Is in future: ${minutesUntil > 0 ? 'Yes' : 'No'}`);
    
    // 5. Create a test lesson with the corrected time
    if (minutesUntil > 0) {
      console.log('\n📝 Creating test lesson with corrected time...');
      
      const lessonData = {
        tutor_id: tutorId,
        student_id: studentId,
        lesson_type: 'Conversation Practice',
        duration_minutes: 60,
        status: 'pending',
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        price_paid: 15.00,
        currency: 'USD',
        student_timezone: userTimezone,
        tutor_timezone: 'UTC-07:00 (America/Los_Angeles)'
      };

      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert(lessonData)
        .select()
        .single();

      if (lessonError) {
        console.error('❌ Error creating test lesson:', lessonError);
        return;
      }

      console.log('✅ Test lesson created successfully:', lesson.id);

      // 6. Verify it appears in upcoming lessons
      console.log('\n🔍 Verifying lesson appears in upcoming filter...');
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

      // 7. Clean up
      console.log('\n🧹 Cleaning up test lesson...');
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      if (deleteError) {
        console.error('❌ Error deleting test lesson:', deleteError);
      } else {
        console.log('✅ Test lesson deleted successfully');
      }
    } else {
      console.log('❌ Cannot create test lesson - time is in the past');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testFixedBooking(); 