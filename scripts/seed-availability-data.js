const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedAvailabilityData() {
  console.log('🗓️ Seeding availability data...');

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

    // Create sample availability slots
    const sampleAvailability = [
      // Monday
      {
        tutor_id: tutorProfile.id,
        day_of_week: 1, // Monday
        start_time: '09:00',
        end_time: '12:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      {
        tutor_id: tutorProfile.id,
        day_of_week: 1, // Monday
        start_time: '14:00',
        end_time: '17:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      
      // Tuesday
      {
        tutor_id: tutorProfile.id,
        day_of_week: 2, // Tuesday
        start_time: '10:00',
        end_time: '13:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      {
        tutor_id: tutorProfile.id,
        day_of_week: 2, // Tuesday
        start_time: '15:00',
        end_time: '18:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      
      // Wednesday
      {
        tutor_id: tutorProfile.id,
        day_of_week: 3, // Wednesday
        start_time: '09:00',
        end_time: '11:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      {
        tutor_id: tutorProfile.id,
        day_of_week: 3, // Wednesday
        start_time: '16:00',
        end_time: '19:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      
      // Thursday
      {
        tutor_id: tutorProfile.id,
        day_of_week: 4, // Thursday
        start_time: '11:00',
        end_time: '14:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      {
        tutor_id: tutorProfile.id,
        day_of_week: 4, // Thursday
        start_time: '16:00',
        end_time: '20:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      
      // Friday
      {
        tutor_id: tutorProfile.id,
        day_of_week: 5, // Friday
        start_time: '09:00',
        end_time: '12:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      {
        tutor_id: tutorProfile.id,
        day_of_week: 5, // Friday
        start_time: '13:00',
        end_time: '16:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      
      // Saturday
      {
        tutor_id: tutorProfile.id,
        day_of_week: 6, // Saturday
        start_time: '10:00',
        end_time: '13:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      },
      
      // Sunday
      {
        tutor_id: tutorProfile.id,
        day_of_week: 0, // Sunday
        start_time: '14:00',
        end_time: '17:00',
        is_recurring: true,
        timezone: tutorProfile.timezone
      }
    ];

    console.log('🕐 Creating availability slots...');
    
    // First, clear existing availability for this tutor
    const { error: deleteError } = await supabase
      .from('tutor_availability')
      .delete()
      .eq('tutor_id', tutorProfile.id);

    if (deleteError) {
      console.log('⚠️  Could not clear existing availability:', deleteError.message);
    }

    // Insert new availability
    const { error: availabilityError } = await supabase
      .from('tutor_availability')
      .insert(sampleAvailability);

    if (availabilityError) {
      console.log('⚠️  Could not create availability:', availabilityError.message);
    } else {
      console.log(`✅ Created ${sampleAvailability.length} availability slots`);
    }

    console.log('🎉 Availability data seeding completed successfully!');
    console.log(`
📊 Summary:
- Tutor: ${tutorProfile.display_name}
- Availability Slots: ${sampleAvailability.length}
- Days Covered: Monday-Sunday
- Time Ranges: Morning and afternoon slots

🚀 You can now test the calendar at /tutor/calendar

📅 Sample Schedule:
- Monday: 9:00-12:00, 14:00-17:00
- Tuesday: 10:00-13:00, 15:00-18:00
- Wednesday: 9:00-11:00, 16:00-19:00
- Thursday: 11:00-14:00, 16:00-20:00
- Friday: 9:00-12:00, 13:00-16:00
- Saturday: 10:00-13:00
- Sunday: 14:00-17:00
    `);

  } catch (error) {
    console.error('❌ Error seeding availability data:', error);
  }
}

// Run the seeder
seedAvailabilityData(); 