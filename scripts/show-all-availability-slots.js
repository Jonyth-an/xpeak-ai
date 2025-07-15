const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function showAllAvailabilitySlots() {
  try {
    console.log('🔍 Fetching all availability slots...\n');

    // Get all availability slots
    const { data: allSlots, error } = await supabase
      .from('tutor_availability')
      .select(`
        id,
        tutor_id,
        day_of_week,
        start_time,
        end_time,
        is_recurring,
        specific_date,
        timezone,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching slots:', error);
      return;
    }

    if (!allSlots || allSlots.length === 0) {
      console.log('📭 No availability slots found in the database');
      return;
    }

    console.log(`📊 Found ${allSlots.length} availability slots:\n`);

    // Group by tutor
    const slotsByTutor = {};
    allSlots.forEach(slot => {
      const tutorKey = `Tutor ID: ${slot.tutor_id}`;
      if (!slotsByTutor[tutorKey]) {
        slotsByTutor[tutorKey] = [];
      }
      slotsByTutor[tutorKey].push(slot);
    });

    Object.entries(slotsByTutor).forEach(([tutorName, slots]) => {
      console.log(`👤 ${tutorName}:`);
      
      const recurringSlots = slots.filter(s => s.is_recurring);
      const specificDateSlots = slots.filter(s => !s.is_recurring);

      if (recurringSlots.length > 0) {
        console.log('  🔄 Recurring slots:');
        recurringSlots.forEach(slot => {
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.day_of_week];
          console.log(`    - ${dayName}: ${slot.start_time} - ${slot.end_time} (ID: ${slot.id})`);
        });
      }

      if (specificDateSlots.length > 0) {
        console.log('  📅 Specific date slots:');
        specificDateSlots.forEach(slot => {
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][slot.day_of_week];
          console.log(`    - ${slot.specific_date} (${dayName}): ${slot.start_time} - ${slot.end_time} (ID: ${slot.id})`);
        });
      }

      console.log('');
    });

    // Summary statistics
    const totalRecurring = allSlots.filter(s => s.is_recurring).length;
    const totalSpecific = allSlots.filter(s => !s.is_recurring).length;
    
    console.log('📈 Summary:');
    console.log(`  - Total slots: ${allSlots.length}`);
    console.log(`  - Recurring slots: ${totalRecurring}`);
    console.log(`  - Specific date slots: ${totalSpecific}`);
    console.log(`  - Unique tutors: ${Object.keys(slotsByTutor).length}`);

    // Show raw data for debugging
    console.log('\n🔍 Raw data (first 5 slots):');
    allSlots.slice(0, 5).forEach((slot, index) => {
      console.log(`  Slot ${index + 1}:`, JSON.stringify(slot, null, 2));
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
showAllAvailabilitySlots()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 