const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedTutorTestData() {
  console.log('🌱 Seeding tutor test data...');

  try {
    // Get the first tutor profile
    const { data: tutorProfile, error: tutorError } = await supabase
      .from('tutor_profiles')
      .select('*')
      .limit(1)
      .single();

    if (tutorError || !tutorProfile) {
      console.log('❌ No tutor profile found. Please approve a tutor application first.');
      return;
    }

    console.log(`📝 Found tutor: ${tutorProfile.display_name}`);

    // Create sample student profiles
    const sampleStudents = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'maria.kim@example.com',
        full_name: 'Maria Kim',
        country: 'South Korea',
        avatar_url: null
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'john.smith@example.com',
        full_name: 'John Smith',
        country: 'United States',
        avatar_url: null
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'ahmed.hassan@example.com',
        full_name: 'Ahmed Hassan',
        country: 'Egypt',
        avatar_url: null
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'lisa.chen@example.com',
        full_name: 'Lisa Chen',
        country: 'Taiwan',
        avatar_url: null
      }
    ];

    // Insert sample students into profiles table
    console.log('👥 Creating sample students...');
    for (const student of sampleStudents) {
      const { error } = await supabase
        .from('profiles')
        .upsert(student, { onConflict: 'id' });
      
      if (error) {
        console.log(`⚠️  Could not create student ${student.full_name}:`, error.message);
      }
    }

    // Create sample lessons for today and this month
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const sampleLessons = [
      // Today's lessons
      {
        tutor_id: tutorProfile.id,
        student_id: sampleStudents[0].id,
        lesson_type: 'Conversation Practice',
        duration_minutes: 30,
        scheduled_start: new Date(today.getTime() + 10 * 60 * 60 * 1000).toISOString(), // 10 AM today
        scheduled_end: new Date(today.getTime() + 10.5 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        student_timezone: 'Asia/Seoul',
        tutor_timezone: tutorProfile.timezone,
        price_paid: 15.00
      },
      {
        tutor_id: tutorProfile.id,
        student_id: sampleStudents[1].id,
        lesson_type: 'Grammar Focus',
        duration_minutes: 30,
        scheduled_start: new Date(today.getTime() + 14.5 * 60 * 60 * 1000).toISOString(), // 2:30 PM today
        scheduled_end: new Date(today.getTime() + 15 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        student_timezone: 'America/New_York',
        tutor_timezone: tutorProfile.timezone,
        price_paid: 15.00
      },
      {
        tutor_id: tutorProfile.id,
        student_id: sampleStudents[2].id,
        lesson_type: 'Business English',
        duration_minutes: 30,
        scheduled_start: new Date(today.getTime() + 16 * 60 * 60 * 1000).toISOString(), // 4:00 PM today
        scheduled_end: new Date(today.getTime() + 16.5 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        student_timezone: 'Africa/Cairo',
        tutor_timezone: tutorProfile.timezone,
        price_paid: 15.00
      },
      {
        tutor_id: tutorProfile.id,
        student_id: sampleStudents[3].id,
        lesson_type: 'IELTS Preparation',
        duration_minutes: 30,
        scheduled_start: new Date(today.getTime() + 18.5 * 60 * 60 * 1000).toISOString(), // 6:30 PM today
        scheduled_end: new Date(today.getTime() + 19 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        student_timezone: 'Asia/Taipei',
        tutor_timezone: tutorProfile.timezone,
        price_paid: 15.00,
        reschedule_requested_by: 'student',
        reschedule_requested_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Add more lessons for this month
    for (let i = 1; i <= 20; i++) {
      const lessonDate = new Date(thisMonth.getTime() + i * 24 * 60 * 60 * 1000);
      if (lessonDate <= now) {
        sampleLessons.push({
          tutor_id: tutorProfile.id,
          student_id: sampleStudents[i % sampleStudents.length].id,
          lesson_type: ['Conversation Practice', 'Grammar Focus', 'Business English', 'IELTS Preparation'][i % 4],
          duration_minutes: 30,
          scheduled_start: new Date(lessonDate.getTime() + 10 * 60 * 60 * 1000).toISOString(),
          scheduled_end: new Date(lessonDate.getTime() + 10.5 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          student_timezone: ['Asia/Seoul', 'America/New_York', 'Africa/Cairo', 'Asia/Taipei'][i % 4],
          tutor_timezone: tutorProfile.timezone,
          price_paid: 15.00,
          actual_start: new Date(lessonDate.getTime() + 10 * 60 * 60 * 1000).toISOString(),
          actual_end: new Date(lessonDate.getTime() + 10.5 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    console.log('📚 Creating sample lessons...');
    const { error: lessonsError } = await supabase
      .from('lessons')
      .insert(sampleLessons);

    if (lessonsError) {
      console.log('⚠️  Could not create lessons:', lessonsError.message);
    } else {
      console.log(`✅ Created ${sampleLessons.length} sample lessons`);
    }

    // Create sample earnings
    const sampleEarnings = [];
    let totalEarnings = 0;

    // Earnings from lessons
    for (const lesson of sampleLessons) {
      if (lesson.status === 'completed') {
        sampleEarnings.push({
          tutor_id: tutorProfile.id,
          lesson_id: null, // Will be populated after lesson creation
          earning_type: 'lesson',
          amount: lesson.price_paid,
          currency: 'USD',
          description: `Lesson payment - ${lesson.lesson_type}`,
          earned_at: lesson.scheduled_start,
          is_paid: false
        });
        totalEarnings += lesson.price_paid;
      }
    }

    // Add bonus earnings
    sampleEarnings.push({
      tutor_id: tutorProfile.id,
      lesson_id: null,
      earning_type: 'bonus',
      amount: 125.00,
      currency: 'USD',
      description: 'Monthly Performance Bonus - Tier 2',
      bonus_tier: 'tier2',
      earned_at: new Date(thisMonth.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      is_paid: false
    });

    sampleEarnings.push({
      tutor_id: tutorProfile.id,
      lesson_id: null,
      earning_type: 'referral',
      amount: 25.00,
      currency: 'USD',
      description: 'Student Referral Bonus',
      earned_at: new Date(thisMonth.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      is_paid: false
    });

    console.log('💰 Creating sample earnings...');
    const { error: earningsError } = await supabase
      .from('tutor_earnings')
      .insert(sampleEarnings);

    if (earningsError) {
      console.log('⚠️  Could not create earnings:', earningsError.message);
    } else {
      console.log(`✅ Created ${sampleEarnings.length} earnings records`);
    }

    // Create sample feedback
    const sampleFeedback = [
      {
        lesson_id: null, // Will be populated after lesson creation
        student_id: sampleStudents[0].id,
        tutor_id: tutorProfile.id,
        rating: 5,
        comment: 'Really helpful and fun session! Sarah explains everything so clearly.',
        tags: ['clear_explanation', 'engaging', 'grammar_focus'],
        is_visible_to_tutor: true
      },
      {
        lesson_id: null,
        student_id: sampleStudents[1].id,
        tutor_id: tutorProfile.id,
        rating: 4,
        comment: 'Great lesson on business English. Very practical examples.',
        tags: ['business_english', 'practical', 'professional'],
        is_visible_to_tutor: true
      },
      {
        lesson_id: null,
        student_id: sampleStudents[2].id,
        tutor_id: tutorProfile.id,
        rating: 5,
        comment: 'Patient teacher who really understands my learning needs.',
        tags: ['patient', 'understanding', 'personalized'],
        is_visible_to_tutor: true
      },
      {
        lesson_id: null,
        student_id: sampleStudents[3].id,
        tutor_id: tutorProfile.id,
        rating: 4,
        comment: 'Excellent conversation practice. I feel more confident now.',
        tags: ['conversation', 'confidence', 'improvement'],
        is_visible_to_tutor: true
      }
    ];

    console.log('⭐ Creating sample feedback...');
    const { error: feedbackError } = await supabase
      .from('lesson_feedback')
      .insert(sampleFeedback);

    if (feedbackError) {
      console.log('⚠️  Could not create feedback:', feedbackError.message);
    } else {
      console.log(`✅ Created ${sampleFeedback.length} feedback records`);
    }

    // Create tutor-student relationships
    const tutorStudents = sampleStudents.map(student => ({
      tutor_id: tutorProfile.id,
      student_id: student.id,
      first_lesson_at: new Date(thisMonth.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      last_lesson_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      total_lessons: Math.floor(Math.random() * 10) + 5,
      total_minutes: Math.floor(Math.random() * 300) + 150,
      student_level: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
      student_goals: [
        'Improve conversation skills for work',
        'Prepare for IELTS exam',
        'Business English for presentations',
        'General English improvement'
      ][Math.floor(Math.random() * 4)]
    }));

    console.log('🤝 Creating tutor-student relationships...');
    const { error: relationshipError } = await supabase
      .from('tutor_students')
      .insert(tutorStudents);

    if (relationshipError) {
      console.log('⚠️  Could not create relationships:', relationshipError.message);
    } else {
      console.log(`✅ Created ${tutorStudents.length} tutor-student relationships`);
    }

    console.log('🎉 Test data seeding completed successfully!');
    console.log(`
📊 Summary:
- Tutor: ${tutorProfile.display_name}
- Students: ${sampleStudents.length}
- Lessons: ${sampleLessons.length}
- Earnings: ${sampleEarnings.length}
- Feedback: ${sampleFeedback.length}
- Relationships: ${tutorStudents.length}

🚀 You can now test the tutor dashboard at /tutor
    `);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  }
}

// Run the seeder
seedTutorTestData(); 