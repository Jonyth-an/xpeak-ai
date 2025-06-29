const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMigrationStatus() {
  console.log('Checking migration status...\n');

  try {
    // Check if user_subscriptions table exists and has the new columns
    console.log('1. Checking user_subscriptions table...');
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1);

    if (subError) {
      console.log('❌ Error accessing user_subscriptions:', subError.message);
    } else {
      console.log('✅ user_subscriptions table exists');
      
      // Check if pause columns exist by trying to select them
      const { data: pauseTest, error: pauseError } = await supabase
        .from('user_subscriptions')
        .select('paused_at, resume_at, pause_duration')
        .limit(1);
      
      const hasPauseColumns = !pauseError;
      console.log('Pause columns exist:', hasPauseColumns ? '✅' : '❌');
    }

    // Check if user_usage table exists
    console.log('\n2. Checking user_usage table...');
    const { data: usageData, error: usageError } = await supabase
      .from('user_usage')
      .select('*')
      .limit(1);

    if (usageError) {
      console.log('❌ user_usage table does not exist or error:', usageError.message);
    } else {
      console.log('✅ user_usage table exists');
    }

    // Check if billing_events table exists
    console.log('\n3. Checking billing_events table...');
    const { data: eventsData, error: eventsError } = await supabase
      .from('billing_events')
      .select('*')
      .limit(1);

    if (eventsError) {
      console.log('❌ billing_events table does not exist or error:', eventsError.message);
    } else {
      console.log('✅ billing_events table exists');
    }

    // Check if subscription_changes table exists
    console.log('\n4. Checking subscription_changes table...');
    const { data: changesData, error: changesError } = await supabase
      .from('subscription_changes')
      .select('*')
      .limit(1);

    if (changesError) {
      console.log('❌ subscription_changes table does not exist or error:', changesError.message);
    } else {
      console.log('✅ subscription_changes table exists');
    }

    // Check current subscription data for your user
    console.log('\n5. Checking current subscription data...');
    const { data: userSubscriptions, error: subDataError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_email', 'clshou@gmail.com');

    if (subDataError) {
      console.log('❌ Error fetching subscription data:', subDataError.message);
    } else {
      console.log(`Found ${userSubscriptions.length} subscription records for clshou@gmail.com`);
      userSubscriptions.forEach((sub, index) => {
        console.log(`  ${index + 1}. ID: ${sub.id}, Status: ${sub.status}, Created: ${sub.created_at}`);
        if (sub.paused_at) console.log(`     Paused at: ${sub.paused_at}`);
        if (sub.resume_at) console.log(`     Resume at: ${sub.resume_at}`);
      });
    }

    // Check for unique constraint by trying to insert a duplicate
    console.log('\n6. Checking unique constraints...');
    const { error: uniqueError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_email: 'test@example.com',
        stripe_customer_id: 'test_customer',
        stripe_subscription_id: 'test_subscription',
        status: 'active'
      });

    const hasUniqueConstraint = uniqueError && uniqueError.message.includes('duplicate');
    console.log('Unique constraint exists:', hasUniqueConstraint ? '✅' : '❌');

    // Clean up test data
    if (!uniqueError) {
      await supabase
        .from('user_subscriptions')
        .delete()
        .eq('user_email', 'test@example.com');
    }

    console.log('\n=== MIGRATION STATUS SUMMARY ===');
    const hasAllTables = !usageError && !eventsError && !changesError;
    const hasPauseColumns = !pauseError;
    const hasMultipleSubscriptions = userSubscriptions && userSubscriptions.length > 1;

    console.log(`All tables exist: ${hasAllTables ? '✅' : '❌'}`);
    console.log(`Pause columns exist: ${hasPauseColumns ? '✅' : '❌'}`);
    console.log(`Unique constraint exists: ${hasUniqueConstraint ? '✅' : '❌'}`);
    console.log(`Multiple subscriptions found: ${hasMultipleSubscriptions ? '⚠️' : '✅'}`);

    if (!hasAllTables || !hasPauseColumns || !hasUniqueConstraint) {
      console.log('\n❌ Migration appears to be incomplete. Please run the migration script.');
      console.log('\nTo run the migration:');
      console.log('1. Copy the SQL from billing_improvements_migration.sql');
      console.log('2. Run it in your Supabase SQL editor');
      console.log('3. Or use the Supabase CLI if available');
    } else if (hasMultipleSubscriptions) {
      console.log('\n⚠️ Migration is complete but multiple subscription records exist. Consider cleanup.');
    } else {
      console.log('\n✅ Migration appears to be complete and database is clean.');
    }

  } catch (error) {
    console.error('Error checking migration status:', error);
  }
}

checkMigrationStatus(); 