const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testBookingAPI() {
  console.log('🔍 Testing booking API...\n');

  const studentId = 'e65af545-4e3f-4475-ba1a-e3702f1ee3b4';
  const tutorId = '4f4e6ea2-81aa-417b-95fe-c9ec2fc36572';

  try {
    // 1. First, let's check if we can authenticate as the student
    console.log('🔐 Testing authentication for student:', studentId);
    
    // We need to get a valid session token. Let's check if there are any existing sessions
    // or we can create a test booking directly in the database
    
    // 2. Let's try to create a lesson directly in the database to test the booking logic
    console.log('\n📝 Testing direct lesson creation...');
    
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
      console.error('❌ Error creating lesson directly:', lessonError);
      
      // Check if it's a constraint violation
      if (lessonError.code === '23505') {
        console.log('🔍 This might be a unique constraint violation. Checking existing lessons...');
        
        const { data: existingLessons, error: existingError } = await supabase
          .from('lessons')
          .select('*')
          .eq('tutor_id', tutorId)
          .eq('student_id', studentId)
          .gte('scheduled_start', '2025-07-17T00:00:00')
          .lt('scheduled_start', '2025-07-18T00:00:00');

        if (!existingError && existingLessons?.length > 0) {
          console.log('✅ Found existing lessons for this time slot:');
          existingLessons.forEach((l, i) => {
            console.log(`  ${i + 1}. ID: ${l.id}, Status: ${l.status}, Time: ${l.scheduled_start} to ${l.scheduled_end}`);
          });
        }
      }
      return;
    }

    console.log('✅ Lesson created successfully:', lesson.id);

    // 3. Now let's verify it appears in the queries
    console.log('\n🔍 Verifying lesson appears in queries...');
    
    // Check student lessons
    const { data: studentLessons, error: studentError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId);

    if (!studentError) {
      console.log(`✅ Student now has ${studentLessons?.length || 0} lessons`);
    }

    // Check tutor lessons
    const { data: tutorLessons, error: tutorError } = await supabase
      .from('lessons')
      .select('*')
      .eq('tutor_id', tutorId);

    if (!tutorError) {
      console.log(`✅ Tutor now has ${tutorLessons?.length || 0} lessons`);
    }

    // 4. Test the upcoming filter
    const now = new Date();
    const { data: upcomingLessons, error: upcomingError } = await supabase
      .from('lessons')
      .select('*')
      .eq('student_id', studentId)
      .gte('scheduled_start', now.toISOString());

    if (!upcomingError) {
      console.log(`✅ Upcoming filter returns ${upcomingLessons?.length || 0} lessons`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBookingAPI(); 