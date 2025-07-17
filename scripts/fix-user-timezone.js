const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixUserTimezone() {
  console.log('🔧 Fixing user timezone...\n');

  const studentId = 'e65af545-4e3f-4475-ba1a-e3702f1ee3b4';

  try {
    // 1. Check current timezone
    console.log('📊 Checking current user timezone...');
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('timezone')
      .eq('user_id', studentId)
      .single();

    if (userError) {
      console.error('❌ Error fetching user profile:', userError);
      return;
    }

    console.log(`   Current timezone: ${userProfile?.timezone || 'Not set'}`);

    // 2. Update to Pacific timezone
    console.log('\n🔄 Updating to Pacific timezone...');
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({ timezone: 'UTC-07:00 (America/Los_Angeles)' })
      .eq('user_id', studentId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating timezone:', updateError);
      return;
    }

    console.log(`✅ Updated timezone to: ${updatedProfile.timezone}`);

    // 3. Test the booking logic with correct timezone
    console.log('\n🕐 Testing booking logic with correct timezone...');
    
    const date = '2025-07-17';
    const startTime = '11:30';
    const endTime = '12:30';
    const userTimezone = 'UTC-07:00 (America/Los_Angeles)';
    
    // Convert to UTC
    const localDateTimeStart = `${date}T${startTime}`;
    const localDateTimeEnd = `${date}T${endTime}`;
    
    const scheduledStart = new Date(localDateTimeStart + (userTimezone !== 'UTC' ? ` ${userTimezone}` : '')).toISOString();
    const scheduledEnd = new Date(localDateTimeEnd + (userTimezone !== 'UTC' ? ` ${userTimezone}` : '')).toISOString();
    
    console.log('   Local time (Pacific):', { start: localDateTimeStart, end: localDateTimeEnd });
    console.log('   UTC time:', { start: scheduledStart, end: scheduledEnd });
    
    // 4. Check if this time is in the future
    const now = new Date();
    const lessonStart = new Date(scheduledStart);
    const minutesUntil = Math.floor((lessonStart.getTime() - now.getTime()) / (1000 * 60));
    
    console.log(`\n⏰ Minutes until lesson: ${minutesUntil}`);
    console.log(`   Is in future: ${minutesUntil > 0 ? 'Yes' : 'No'}`);
    
    if (minutesUntil > 0) {
      console.log('✅ The corrected timezone conversion would create a future lesson!');
    } else {
      console.log('❌ The time is still in the past - this is expected since it\'s already past 11:30 AM today');
    }

    // 5. Test with a future date
    console.log('\n🔮 Testing with a future date...');
    const futureDate = '2025-07-18'; // Tomorrow
    const futureLocalDateTimeStart = `${futureDate}T${startTime}`;
    const futureLocalDateTimeEnd = `${futureDate}T${endTime}`;
    
    const futureScheduledStart = new Date(futureLocalDateTimeStart + (userTimezone !== 'UTC' ? ` ${userTimezone}` : '')).toISOString();
    const futureScheduledEnd = new Date(futureLocalDateTimeEnd + (userTimezone !== 'UTC' ? ` ${userTimezone}` : '')).toISOString();
    
    console.log('   Future local time (Pacific):', { start: futureLocalDateTimeStart, end: futureLocalDateTimeEnd });
    console.log('   Future UTC time:', { start: futureScheduledStart, end: futureScheduledEnd });
    
    const futureLessonStart = new Date(futureScheduledStart);
    const futureMinutesUntil = Math.floor((futureLessonStart.getTime() - now.getTime()) / (1000 * 60));
    
    console.log(`   Minutes until future lesson: ${futureMinutesUntil}`);
    console.log(`   Is in future: ${futureMinutesUntil > 0 ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixUserTimezone(); 