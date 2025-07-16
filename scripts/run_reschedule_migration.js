const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Running reschedule requests migration...\n');

  try {
    // Add requested_by_type column
    console.log('1. Adding requested_by_type column...');
    const { error: typeError } = await supabase
      .from('reschedule_requests')
      .select('requested_by_type')
      .limit(1);
    
    if (typeError && typeError.code === 'PGRST204') {
      console.log('   Column does not exist, adding it...');
      // We'll need to run this in the Supabase SQL editor
      console.log('   ⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('   ALTER TABLE public.reschedule_requests ADD COLUMN requested_by_type VARCHAR(50) NOT NULL DEFAULT \'student\';');
    } else {
      console.log('   ✅ requested_by_type column already exists');
    }

    // Add proposed_date column
    console.log('2. Adding proposed_date column...');
    const { error: dateError } = await supabase
      .from('reschedule_requests')
      .select('proposed_date')
      .limit(1);
    
    if (dateError && dateError.code === 'PGRST204') {
      console.log('   Column does not exist, adding it...');
      console.log('   ⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('   ALTER TABLE public.reschedule_requests ADD COLUMN proposed_date DATE;');
    } else {
      console.log('   ✅ proposed_date column already exists');
    }

    // Add proposed_start_time column
    console.log('3. Adding proposed_start_time column...');
    const { error: startTimeError } = await supabase
      .from('reschedule_requests')
      .select('proposed_start_time')
      .limit(1);
    
    if (startTimeError && startTimeError.code === 'PGRST204') {
      console.log('   Column does not exist, adding it...');
      console.log('   ⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('   ALTER TABLE public.reschedule_requests ADD COLUMN proposed_start_time TIME;');
    } else {
      console.log('   ✅ proposed_start_time column already exists');
    }

    // Add proposed_end_time column
    console.log('4. Adding proposed_end_time column...');
    const { error: endTimeError } = await supabase
      .from('reschedule_requests')
      .select('proposed_end_time')
      .limit(1);
    
    if (endTimeError && endTimeError.code === 'PGRST204') {
      console.log('   Column does not exist, adding it...');
      console.log('   ⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('   ALTER TABLE public.reschedule_requests ADD COLUMN proposed_end_time TIME;');
    } else {
      console.log('   ✅ proposed_end_time column already exists');
    }

    // Add tutor_response column
    console.log('5. Adding tutor_response column...');
    const { error: responseError } = await supabase
      .from('reschedule_requests')
      .select('tutor_response')
      .limit(1);
    
    if (responseError && responseError.code === 'PGRST204') {
      console.log('   Column does not exist, adding it...');
      console.log('   ⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('   ALTER TABLE public.reschedule_requests ADD COLUMN tutor_response VARCHAR(50);');
    } else {
      console.log('   ✅ tutor_response column already exists');
    }

    // Add tutor_response_reason column
    console.log('6. Adding tutor_response_reason column...');
    const { error: reasonError } = await supabase
      .from('reschedule_requests')
      .select('tutor_response_reason')
      .limit(1);
    
    if (reasonError && reasonError.code === 'PGRST204') {
      console.log('   Column does not exist, adding it...');
      console.log('   ⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('   ALTER TABLE public.reschedule_requests ADD COLUMN tutor_response_reason TEXT;');
    } else {
      console.log('   ✅ tutor_response_reason column already exists');
    }

    // Add responded_at column
    console.log('7. Adding responded_at column...');
    const { error: respondedAtError } = await supabase
      .from('reschedule_requests')
      .select('responded_at')
      .limit(1);
    
    if (respondedAtError && respondedAtError.code === 'PGRST204') {
      console.log('   Column does not exist, adding it...');
      console.log('   ⚠️  Please run this SQL in your Supabase SQL Editor:');
      console.log('   ALTER TABLE public.reschedule_requests ADD COLUMN responded_at TIMESTAMP WITH TIME ZONE;');
    } else {
      console.log('   ✅ responded_at column already exists');
    }

    console.log('\n📋 Migration check completed!');
    console.log('🔧 If any columns were missing, please run the suggested SQL commands in your Supabase SQL Editor.');

  } catch (error) {
    console.error('❌ Migration check failed:', error);
    process.exit(1);
  }
}

runMigration(); 