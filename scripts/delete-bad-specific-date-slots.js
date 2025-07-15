const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deleteBadSpecificDateSlots() {
  try {
    console.log('🔍 Deleting all specific-date slots with specific_date = null...');

    // Find all such slots first
    const { data: badSlots, error: findError } = await supabase
      .from('tutor_availability')
      .select('id')
      .eq('is_recurring', false)
      .is('specific_date', null);

    if (findError) {
      console.error('❌ Error finding bad slots:', findError);
      process.exit(1);
    }

    if (!badSlots || badSlots.length === 0) {
      console.log('✅ No bad specific-date slots found. Nothing to delete.');
      process.exit(0);
    }

    const idsToDelete = badSlots.map(slot => slot.id);
    console.log(`🗑 Deleting ${idsToDelete.length} bad slots...`);

    const { error: deleteError } = await supabase
      .from('tutor_availability')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('❌ Error deleting bad slots:', deleteError);
      process.exit(1);
    }

    console.log(`✅ Deleted ${idsToDelete.length} bad specific-date slots.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

deleteBadSpecificDateSlots(); 