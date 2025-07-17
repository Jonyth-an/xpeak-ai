const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBookingWithAuth() {
  console.log('🔍 Testing booking with service role authentication...\n');

  const studentId = 'e65af545-4e3f-4475-ba1a-e3702f1ee3b4';
  const tutorId = '4f4e6ea2-81aa-417b-95fe-c9ec2fc36572';

  try {
    // 1. First, let's check if the service role can read lessons
    console.log('📊 Testing service role access to lessons table...');
    
    const { data: allLessons, error: readError } = await supabase
      .from('lessons')
      .select('*')
      .limit(5);

    if (readError) {
      console.error('❌ Service role cannot read lessons:', readError);
      return;
    }

    console.log(`✅ Service role can read lessons. Found ${allLessons?.length || 0} total lessons in database.`);

    // 2. Check if there are any lessons for our student/tutor
    console.log('\n📊 Checking existing lessons for student and tutor...');
    
    const { data: studentLessons, error: studentError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId);

    if (!studentError) {
      console.log(`✅ Student has ${studentLessons?.length || 0} lessons`);
      studentLessons?.forEach((lesson, i) => {
        console.log(`  ${i + 1}. ID: ${lesson.id}, Status: ${lesson.status}, Time: ${lesson.scheduled_start}`);
      });
    }

    const { data: tutorLessons, error: tutorError } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId);

    if (!tutorError) {
      console.log(`✅ Tutor has ${tutorLessons?.length || 0} lessons`);
      tutorLessons?.forEach((lesson, i) => {
        console.log(`  ${i + 1}. ID: ${lesson.id}, Status: ${lesson.status}, Time: ${lesson.scheduled_start}`);
      });
    }

    // 3. Try to create a lesson with service role
    console.log('\n📝 Testing lesson creation with service role...');
    
    const lessonData = {
      tutor_id: tutorId,
      student_id: studentId,
      lesson_type: 'Conversation Practice',
      duration_minutes: 60,
      status: 'pending',
      scheduled_start: '2025-07-17T11:30:00',
      scheduled_end: '2025-07-17T12:30:00',
      price_paid: 15.00,
      currency: 'USD',
      student_timezone: 'UTC-07:00',
      tutor_timezone: 'UTC-07:00'
    };

    console.log('📋 Lesson data to insert:', lessonData);

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();

    if (lessonError) {
      console.error('❌ Error creating lesson with service role:', lessonError);
      return;
    }

    console.log('✅ Lesson created successfully with service role:', lesson.id);

    // 4. Verify the lesson appears in queries
    console.log('\n🔍 Verifying lesson appears in queries...');
    
    // Wait a moment for the database to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: newStudentLessons, error: newStudentError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId);

    if (!newStudentError) {
      console.log(`✅ Student now has ${newStudentLessons?.length || 0} lessons`);
      newStudentLessons?.forEach((l, i) => {
        console.log(`  ${i + 1}. ID: ${l.id}, Status: ${l.status}, Time: ${l.scheduled_start}`);
      });
    }

    const { data: newTutorLessons, error: newTutorError } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId);

    if (!newTutorError) {
      console.log(`✅ Tutor now has ${newTutorLessons?.length || 0} lessons`);
      newTutorLessons?.forEach((l, i) => {
        console.log(`  ${i + 1}. ID: ${l.id}, Status: ${l.status}, Time: ${l.scheduled_start}`);
      });
    }

    // 5. Test the upcoming filter
    const now = new Date();
    const { data: upcomingLessons, error: upcomingError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .gte('scheduled_start', now.toISOString());

    if (!upcomingError) {
      console.log(`✅ Upcoming filter returns ${upcomingLessons?.length || 0} lessons`);
      upcomingLessons?.forEach((l, i) => {
        console.log(`  ${i + 1}. ID: ${l.id}, Status: ${l.status}, Time: ${l.scheduled_start}`);
      });
    }

    // 6. Clean up - delete the test lesson
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

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBookingWithAuth(); 