const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runThemeMigration() {
  console.log('🚀 Starting theme preferences migration...');
  
  try {
    // Test connection to profiles table
    console.log('⚡ Testing database connection...');
    const { error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === '42P01') {
      console.log('📋 Profiles table does not exist. You need to run the migration SQL first.');
    } else if (testError) {
      console.error('❌ Database connection failed:', testError);
      process.exit(1);
    } else {
      console.log('✅ Profiles table exists and is accessible!');
    }

    console.log('');
    console.log('📋 To complete the theme preferences setup, run this SQL in your Supabase Dashboard:');
    console.log('');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the following SQL:');
    console.log('');
    console.log('='.repeat(80));
    
    const migrationPath = path.join(__dirname, '../database/migrations/add_theme_preferences.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log(migrationSQL);
    
    console.log('='.repeat(80));
    console.log('');
    console.log('✅ After running the SQL above, your theme system will:');
    console.log('  - Store user theme preferences in the database');
    console.log('  - Sync preferences across devices');
    console.log('  - Persist through browser data clearing');
    console.log('  - Work with user authentication');
    console.log('');
    console.log('🎨 The theme system is now ready to use!');
    
  } catch (error) {
    console.error('❌ Migration check failed with error:', error);
    process.exit(1);
  }
}

// Run the migration
runThemeMigration(); 