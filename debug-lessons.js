require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugLessons() {
  try {
    console.log('🔍 Checking lessons in database...');
    
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching lessons:', error);
      return;
    }
    
    console.log(`✅ Found ${lessons.length} lessons:`);
    lessons.forEach((lesson, index) => {
      console.log(`\n📚 Lesson ${index + 1}:`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Status: ${lesson.status}`);
      console.log(`   Scheduled Start: ${lesson.scheduled_start}`);
      console.log(`   Scheduled End: ${lesson.scheduled_end}`);
      console.log(`   Tutor ID: ${lesson.tutor_id}`);
      console.log(`   Student ID: ${lesson.student_id}`);
      console.log(`   Lesson Type: ${lesson.lesson_type}`);
    });
    
    // Check if any lessons are in the right time window
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    console.log(`\n⏰ Current time: ${now.toISOString()}`);
    console.log(`📅 Looking for lessons between: ${oneHourAgo.toISOString()} and ${oneHourFromNow.toISOString()}`);
    
    const { data: validLessons, error: validError } = await supabase
      .from('lessons')
      .select('*')
      .gte('scheduled_start', oneHourAgo.toISOString())
      .lte('scheduled_end', oneHourFromNow.toISOString())
      .eq('status', 'confirmed');
    
    if (validError) {
      console.error('❌ Error fetching valid lessons:', validError);
      return;
    }
    
    console.log(`✅ Found ${validLessons.length} lessons in valid time window:`);
    validLessons.forEach((lesson, index) => {
      console.log(`\n🎯 Valid Lesson ${index + 1}:`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Status: ${lesson.status}`);
      console.log(`   Scheduled Start: ${lesson.scheduled_start}`);
      console.log(`   Scheduled End: ${lesson.scheduled_end}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugLessons(); 