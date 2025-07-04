require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('🚀 Starting pause-related database migrations...\n');

  try {
    // 1. Add pause columns to user_subscriptions table
    console.log('1. Adding pause columns to user_subscriptions table...');
    const { error: pauseColumnsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_subscriptions 
        ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS resume_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS pause_duration INTEGER;
      `
    });

    if (pauseColumnsError) {
      console.error('❌ Error adding pause columns:', pauseColumnsError);
    } else {
      console.log('✅ Pause columns added successfully');
    }

    // 2. Create pause history table
    console.log('\n2. Creating subscription_pause_history table...');
    const { error: historyTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS subscription_pause_history (
          id SERIAL PRIMARY KEY,
          user_email TEXT NOT NULL,
          stripe_subscription_id TEXT NOT NULL,
          action TEXT NOT NULL CHECK (action IN ('paused', 'resumed')),
          pause_duration INTEGER,
          paused_at TIMESTAMP WITH TIME ZONE,
          resumed_at TIMESTAMP WITH TIME ZONE,
          resume_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          metadata JSONB
        );
      `
    });

    if (historyTableError) {
      console.error('❌ Error creating pause history table:', historyTableError);
    } else {
      console.log('✅ Pause history table created successfully');
    }

    // 3. Add indexes
    console.log('\n3. Adding indexes...');
    const { error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_pause_status 
        ON user_subscriptions(paused_at, resume_at) 
        WHERE status = 'paused';

        CREATE INDEX IF NOT EXISTS idx_pause_history_user_email 
        ON subscription_pause_history(user_email);

        CREATE INDEX IF NOT EXISTS idx_pause_history_subscription_id 
        ON subscription_pause_history(stripe_subscription_id);

        CREATE INDEX IF NOT EXISTS idx_pause_history_created_at 
        ON subscription_pause_history(created_at);
      `
    });

    if (indexesError) {
      console.error('❌ Error adding indexes:', indexesError);
    } else {
      console.log('✅ Indexes added successfully');
    }

    // 4. Add RLS policies
    console.log('\n4. Adding RLS policies...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE subscription_pause_history ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view own pause history" ON subscription_pause_history;
        CREATE POLICY "Users can view own pause history" ON subscription_pause_history
          FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

        DROP POLICY IF EXISTS "Service role can manage pause history" ON subscription_pause_history;
        CREATE POLICY "Service role can manage pause history" ON subscription_pause_history
          FOR ALL USING (auth.role() = 'service_role');
      `
    });

    if (rlsError) {
      console.error('❌ Error adding RLS policies:', rlsError);
    } else {
      console.log('✅ RLS policies added successfully');
    }

    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('- Added paused_at, resume_at, pause_duration columns to user_subscriptions');
    console.log('- Created subscription_pause_history table for audit trail');
    console.log('- Added indexes for efficient queries');
    console.log('- Added RLS policies for security');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 