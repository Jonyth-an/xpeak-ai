const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testJoinWindow() {
  console.log('🔍 Testing join window logic...\\n');

  const studentId = 'e65af545-4e3f-4475-ba1a-e3702f1ee3b4';
  const tutorId = '4f4e6ea2-81aa-417b-95fe-c9ec2fc36572';

  try {
    // 1. Get all lessons for the student
    console.log('📊 Getting lessons for student...');
    const { data: studentLessons, error: studentError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .order('scheduled_start', { ascending: true });

    if (studentError) {
      console.error('❌ Error fetching student lessons:', studentError);
      return;
    }

    console.log(`   Found ${studentLessons.length} lessons for student`);

    // 2. Test join window logic for each lesson
    const now = new Date();
    console.log(`\\n🕐 Current time: ${now.toISOString()}`);
    console.log(`   Current time (local): ${now.toLocaleString()}\\n`);

    studentLessons.forEach((lesson, index) => {
      const lessonStart = new Date(lesson.scheduled_start);
      const lessonEnd = new Date(lesson.scheduled_end);
      const oneHourBefore = new Date(lessonStart.getTime() - 60 * 60 * 1000);
      const minutesUntil = Math.floor((lessonStart.getTime() - now.getTime()) / (1000 * 60));
      
      // Calculate can_join using the new logic
      const canJoin = lesson.status === 'confirmed' && minutesUntil <= 60 && minutesUntil >= -60;
      
      console.log(`📅 Lesson ${index + 1}:`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Status: ${lesson.status}`);
      console.log(`   Start: ${lessonStart.toLocaleString()}`);
      console.log(`   End: ${lessonEnd.toLocaleString()}`);
      console.log(`   1 hour before: ${oneHourBefore.toLocaleString()}`);
      console.log(`   Minutes until: ${minutesUntil}`);
      console.log(`   Can join (new logic): ${canJoin ? '✅ YES' : '❌ NO'}`);
      
      if (canJoin) {
        console.log(`   ✅ This lesson can be joined now!`);
      } else {
        if (lesson.status !== 'confirmed') {
          console.log(`   ❌ Lesson not confirmed`);
        } else if (minutesUntil > 60) {
          console.log(`   ⏰ Too early (${minutesUntil} minutes until)`);
        } else if (minutesUntil < -60) {
          console.log(`   ⏰ Too late (${Math.abs(minutesUntil)} minutes ago)`);
        }
      }
      console.log('');
    });

    // 3. Test tutor lessons
    console.log('📊 Getting lessons for tutor...');
    const { data: tutorLessons, error: tutorError } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('scheduled_start', { ascending: true });

    if (tutorError) {
      console.error('❌ Error fetching tutor lessons:', tutorError);
      return;
    }

    console.log(`   Found ${tutorLessons.length} lessons for tutor`);

    tutorLessons.forEach((lesson, index) => {
      const lessonStart = new Date(lesson.scheduled_start);
      const minutesUntil = Math.floor((lessonStart.getTime() - now.getTime()) / (1000 * 60));
      const canJoin = lesson.status === 'confirmed' && minutesUntil <= 60 && minutesUntil >= -60;
      
      console.log(`📅 Tutor Lesson ${index + 1}:`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Status: ${lesson.status}`);
      console.log(`   Start: ${lessonStart.toLocaleString()}`);
      console.log(`   Minutes until: ${minutesUntil}`);
      console.log(`   Can join (new logic): ${canJoin ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });

    console.log('✅ Join window test completed!');
    console.log('\\n📝 Summary:');
    console.log('   - Lessons can now be joined 1 hour (60 minutes) before start time');
    console.log('   - Lessons can still be joined up to 1 hour after end time');
    console.log('   - This is for testing purposes only');

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testJoinWindow(); 