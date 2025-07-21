require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestLesson() {
  try {
    console.log('🔍 Creating a test lesson...');
    
    // Get current time and create a lesson that starts in 5 minutes and lasts 30 minutes
    const now = new Date();
    const startTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes duration
    
    console.log(`⏰ Creating lesson from ${startTime.toISOString()} to ${endTime.toISOString()}`);
    
    // Get the first tutor and student from the database
    const { data: tutors } = await supabase
      .from('tutor_profiles')
      .select('id, user_id')
      .limit(1);
    
    const { data: students } = await supabase
      .from('auth.users')
      .select('id')
      .limit(1);
    
    if (!tutors || tutors.length === 0) {
      console.error('❌ No tutors found in database');
      return;
    }
    
    if (!students || students.length === 0) {
      console.error('❌ No students found in database');
      return;
    }
    
    const tutor = tutors[0];
    const student = students[0];
    
    console.log(`👨‍🏫 Using tutor: ${tutor.id} (user: ${tutor.user_id})`);
    console.log(`👨‍🎓 Using student: ${student.id}`);
    
    // Create the test lesson
    const { data: lesson, error } = await supabase
      .from('lessons')
      .insert({
        tutor_id: tutor.id,
        student_id: student.id,
        lesson_type: 'Conversation Practice',
        duration_minutes: 30,
        scheduled_start: startTime.toISOString(),
        scheduled_end: endTime.toISOString(),
        status: 'confirmed',
        student_timezone: 'UTC',
        tutor_timezone: 'UTC',
        price_paid: 15.00,
        currency: 'USD'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating lesson:', error);
      return;
    }
    
    console.log('✅ Test lesson created successfully!');
    console.log(`📚 Lesson ID: ${lesson.id}`);
    console.log(`📅 Start: ${lesson.scheduled_start}`);
    console.log(`📅 End: ${lesson.scheduled_end}`);
    console.log(`👨‍🏫 Tutor ID: ${lesson.tutor_id}`);
    console.log(`👨‍🎓 Student ID: ${lesson.student_id}`);
    console.log(`📊 Status: ${lesson.status}`);
    
    console.log('\n🎯 You can now test the video call with this lesson ID!');
    console.log(`🔗 URL: http://localhost:3000/lessons/${lesson.id}/video`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTestLesson(); 