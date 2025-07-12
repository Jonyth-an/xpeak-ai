const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedPerformanceData() {
  console.log('🌱 Seeding performance test data...');

  try {
    // Your actual IDs
    const tutorId = '4f4e6ea2-81aa-417b-95fe-c9ec2fc36572';
    const studentId = '9517c622-9ab5-4091-a393-98533e572035';

    // Get existing lessons
    const { data: existingLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, scheduled_start')
      .eq('tutor_id', tutorId)
      .limit(5);

    if (lessonsError) {
      console.log('⚠️  Error fetching lessons:', lessonsError.message);
      return;
    }

    console.log(`📚 Found ${existingLessons?.length || 0} existing lessons`);

    // Add feedback for existing lessons
    if (existingLessons && existingLessons.length > 0) {
      const sampleFeedback = [
        {
          lesson_id: existingLessons[0]?.id,
          student_id: studentId,
          tutor_id: tutorId,
          rating: 5,
          comment: 'Excellent lesson! Very clear explanations and patient teaching style.',
          tags: ['clear_explanation', 'patient', 'engaging', 'helpful'],
          is_visible_to_tutor: true
        },
        {
          lesson_id: existingLessons[1]?.id,
          student_id: studentId,
          tutor_id: tutorId,
          rating: 4,
          comment: 'Great conversation practice. I feel more confident speaking now.',
          tags: ['conversation', 'confidence', 'improvement', 'practical'],
          is_visible_to_tutor: true
        }
      ];

      console.log('⭐ Creating sample feedback...');
      for (const feedback of sampleFeedback) {
        if (feedback.lesson_id) {
          const { error } = await supabase
            .from('lesson_feedback')
            .upsert(feedback, { onConflict: 'lesson_id' });
          
          if (error) {
            console.log(`⚠️  Could not create feedback:`, error.message);
          }
        }
      }
      console.log(`✅ Created ${sampleFeedback.length} feedback records`);
    }

    // Add sample earnings
    const currentDate = new Date();
    const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const sampleEarnings = [
      {
        tutor_id: tutorId,
        lesson_id: existingLessons?.[0]?.id,
        earning_type: 'lesson',
        amount: 15.00,
        currency: 'USD',
        description: 'Lesson payment - Conversation Practice',
        earned_at: existingLessons?.[0]?.scheduled_start || new Date().toISOString(),
        is_paid: false
      },
      {
        tutor_id: tutorId,
        lesson_id: existingLessons?.[1]?.id,
        earning_type: 'lesson',
        amount: 15.00,
        currency: 'USD',
        description: 'Lesson payment - Grammar Focus',
        earned_at: existingLessons?.[1]?.scheduled_start || new Date().toISOString(),
        is_paid: false
      },
      {
        tutor_id: tutorId,
        lesson_id: null,
        earning_type: 'bonus',
        amount: 25.00,
        currency: 'USD',
        description: 'Performance Bonus - High Rating',
        bonus_tier: 'silver',
        earned_at: new Date(thisMonth.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        is_paid: false
      },
      {
        tutor_id: tutorId,
        lesson_id: null,
        earning_type: 'referral',
        amount: 10.00,
        currency: 'USD',
        description: 'Student Referral Bonus',
        earned_at: new Date(thisMonth.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        is_paid: false
      }
    ];

    console.log('💰 Creating sample earnings...');
    const { error: earningsError } = await supabase
      .from('tutor_earnings')
      .insert(sampleEarnings);

    if (earningsError) {
      console.log('⚠️  Could not create earnings:', earningsError.message);
    } else {
      console.log(`✅ Created ${sampleEarnings.length} earnings records`);
    }

    // Update tutor-student relationship with more data
    const { error: relationshipError } = await supabase
      .from('tutor_students')
      .upsert({
        tutor_id: tutorId,
        student_id: studentId,
        first_lesson_at: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_lesson_at: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        total_lessons: existingLessons?.length || 2,
        total_minutes: (existingLessons?.length || 2) * 30,
        student_level: 'intermediate',
        student_goals: 'Improve conversation skills for work and daily life',
        tutor_notes: 'Great student, very motivated and practices regularly'
      }, { onConflict: 'tutor_id,student_id' });

    if (relationshipError) {
      console.log('⚠️  Could not update relationship:', relationshipError.message);
    } else {
      console.log('✅ Updated tutor-student relationship');
    }

    console.log('🎉 Performance data seeding completed successfully!');
    console.log(`
📊 Summary:
- Feedback: ${existingLessons?.length || 0} records
- Earnings: ${sampleEarnings.length} records
- Relationships: 1 updated

🚀 You can now test the performance dashboard at /tutor/performance
    `);

  } catch (error) {
    console.error('❌ Error seeding performance data:', error);
  }
}

// Run the seeder
seedPerformanceData(); 