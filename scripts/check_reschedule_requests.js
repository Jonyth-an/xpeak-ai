const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRescheduleRequests() {
  console.log('🔍 Checking reschedule requests in database...\n');

  try {
    // Check all reschedule requests
    const { data: allRequests, error: allError } = await supabase
      .from('reschedule_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all reschedule requests:', allError);
      return;
    }

    console.log(`📊 Found ${allRequests.length} total reschedule requests:\n`);

    allRequests.forEach((request, index) => {
      console.log(`${index + 1}. Request ID: ${request.id}`);
      console.log(`   Lesson ID: ${request.lesson_id}`);
      console.log(`   Status: ${request.status}`);
      console.log(`   Requested by: ${request.requested_by} (${request.requested_by_type})`);
      console.log(`   Requested date: ${request.requested_date}`);
      console.log(`   Requested time: ${request.requested_start_time} - ${request.requested_end_time}`);
      console.log(`   Created: ${request.created_at}`);
      console.log('');
    });

    // Check lessons with reschedule_requested status
    const { data: rescheduleLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, status, scheduled_start, tutor_id, student_id')
      .eq('status', 'reschedule_requested');

    if (lessonsError) {
      console.error('❌ Error fetching lessons with reschedule status:', lessonsError);
      return;
    }

    console.log(`📊 Found ${rescheduleLessons.length} lessons with 'reschedule_requested' status:\n`);

    rescheduleLessons.forEach((lesson, index) => {
      console.log(`${index + 1}. Lesson ID: ${lesson.id}`);
      console.log(`   Status: ${lesson.status}`);
      console.log(`   Scheduled: ${lesson.scheduled_start}`);
      console.log(`   Tutor ID: ${lesson.tutor_id}`);
      console.log(`   Student ID: ${lesson.student_id}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkRescheduleRequests(); 