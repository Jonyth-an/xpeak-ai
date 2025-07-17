const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🔄 Running lesson_participants table migration...');

    // Create lesson_participants table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS lesson_participants (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          uid INTEGER NOT NULL,
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          left_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(lesson_id, uid),
          UNIQUE(lesson_id, user_id)
        );
      `
    });

    if (createTableError) {
      console.error('Error creating table:', createTableError);
      return;
    }

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_lesson_participants_lesson_id ON lesson_participants(lesson_id);
        CREATE INDEX IF NOT EXISTS idx_lesson_participants_uid ON lesson_participants(uid);
        CREATE INDEX IF NOT EXISTS idx_lesson_participants_user_id ON lesson_participants(user_id);
      `
    });

    if (indexError) {
      console.error('Error creating indexes:', indexError);
      return;
    }

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE lesson_participants ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
      return;
    }

    // Create policies
    const policies = [
      {
        name: 'Users can view their own lesson participation',
        sql: 'CREATE POLICY "Users can view their own lesson participation" ON lesson_participants FOR SELECT USING (auth.uid() = user_id);'
      },
      {
        name: 'Users can insert their own lesson participation',
        sql: 'CREATE POLICY "Users can insert their own lesson participation" ON lesson_participants FOR INSERT WITH CHECK (auth.uid() = user_id);'
      },
      {
        name: 'Users can update their own lesson participation',
        sql: 'CREATE POLICY "Users can update their own lesson participation" ON lesson_participants FOR UPDATE USING (auth.uid() = user_id);'
      },
      {
        name: 'Users can delete their own lesson participation',
        sql: 'CREATE POLICY "Users can delete their own lesson participation" ON lesson_participants FOR DELETE USING (auth.uid() = user_id);'
      }
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (policyError) {
        console.error(`Error creating policy "${policy.name}":`, policyError);
      } else {
        console.log(`✅ Created policy: ${policy.name}`);
      }
    }

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration(); 