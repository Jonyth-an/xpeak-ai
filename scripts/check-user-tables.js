const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUserTables() {
  console.log('🔍 Checking user tables and timezone storage...\n');

  const studentId = 'e65af545-4e3f-4475-ba1a-e3702f1ee3b4';

  try {
    // 1. Check what tables exist
    console.log('📊 Checking available tables...');
    
    // Try to query different possible table names
    const possibleTables = [
      'user_profiles',
      'profiles', 
      'users',
      'user_settings',
      'user_preferences'
    ];

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          console.log(`✅ Table '${tableName}' exists`);
          if (data && data.length > 0) {
            console.log(`   Sample columns:`, Object.keys(data[0]));
          }
        }
      } catch (err) {
        console.log(`❌ Table '${tableName}' does not exist`);
      }
    }

    // 2. Check the users table directly
    console.log('\n👥 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .limit(1);

    if (!usersError && users && users.length > 0) {
      console.log('✅ Found user in users table:');
      console.log('   Columns:', Object.keys(users[0]));
      console.log('   User data:', users[0]);
    } else {
      console.log('❌ User not found in users table or error:', usersError);
    }

    // 3. Check if timezone is stored in user_metadata
    console.log('\n🌍 Checking user_metadata for timezone...');
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('user_metadata')
      .eq('id', studentId)
      .single();

    if (!userDataError && userData) {
      console.log('✅ User metadata:', userData.user_metadata);
    } else {
      console.log('❌ Could not fetch user metadata:', userDataError);
    }

    // 4. Check lessons table to see how timezone is stored
    console.log('\n📚 Checking lessons table for timezone info...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('student_timezone, tutor_timezone')
      .eq('student_id', studentId)
      .limit(1);

    if (!lessonsError && lessons && lessons.length > 0) {
      console.log('✅ Lesson timezone info:', lessons[0]);
    } else {
      console.log('❌ Could not fetch lesson timezone info:', lessonsError);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkUserTables(); 