const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySchema() {
  console.log('🔍 Verifying Word Maze database schema...\n');

  const tables = [
    'word_entries',
    'word_definitions', 
    'word_examples',
    'word_tags',
    'word_relationships',
    'user_word_mastery',
    'user_learning_sessions',
    'maze_paths',
    'maze_nodes',
    'user_maze_progress',
    'challenge_templates',
    'user_challenge_attempts',
    'api_cache'
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ ${table}: Table exists`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allTablesExist) {
    console.log('🎉 All Word Maze tables created successfully!');
    console.log('\nNext steps:');
    console.log('1. Run the setup script: node scripts/setup-word-maze.js');
    console.log('2. Test the API: npm run dev');
    console.log('3. Visit: http://localhost:3000/word-maze-test');
  } else {
    console.log('❌ Some tables are missing. Please run the SQL migration in Supabase Dashboard.');
    console.log('\nTo run the migration:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the content of word_maze_schema.sql');
    console.log('4. Click "Run"');
  }
}

verifySchema().catch(console.error); 