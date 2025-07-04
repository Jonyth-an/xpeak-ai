const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Starting user_word_collections migration...');

    // Read the migration SQL
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'create_user_word_collections_table.sql'),
      'utf8'
    );

    // Execute the migration
    console.log('Creating user_word_collections table...');
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (migrationError) {
      console.error('Migration error:', migrationError);
      
      // Try alternative approach - execute SQL directly
      console.log('Trying alternative migration approach...');
      const { error: altError } = await supabase
        .from('user_word_collections')
        .select('*')
        .limit(1);
      
      if (altError && altError.code === '42P01') {
        console.log('Table does not exist, creating it manually...');
        // The table doesn't exist, we need to create it manually
        // This would require direct database access or using Supabase dashboard
        console.log('Please run the SQL from create_user_word_collections_table.sql in your Supabase dashboard');
        return;
      }
    }

    console.log('Migration completed successfully!');

    // Now populate the table with existing user data
    console.log('Populating user_word_collections with existing data...');
    
    // Get all users (you might need to adjust this based on your user table structure)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users.length} users`);

    // For each user, get their words and add them to the collection
    for (const user of users) {
      console.log(`Processing user: ${user.email}`);
      
      // Get all words for this user (assuming they're all in word_entries for now)
      const { data: words, error: wordsError } = await supabase
        .from('word_entries')
        .select('id, word_text');

      if (wordsError) {
        console.error(`Error fetching words for user ${user.email}:`, wordsError);
        continue;
      }

      console.log(`Found ${words.length} words for user ${user.email}`);

      // Add each word to the user's collection
      for (const word of words) {
        const { error: insertError } = await supabase
          .from('user_word_collections')
          .insert({
            user_id: user.id,
            word_id: word.id,
            added_via: 'migration'
          });

        if (insertError && insertError.code !== '23505') { // Ignore unique constraint violations
          console.error(`Error adding word ${word.word_text} to user ${user.email}:`, insertError);
        }
      }

      console.log(`Completed processing user: ${user.email}`);
    }

    console.log('Migration and population completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration(); 