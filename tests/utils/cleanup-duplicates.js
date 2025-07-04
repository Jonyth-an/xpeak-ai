const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupDuplicates() {
  console.log('Checking for duplicate subscriptions...');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
  
  // First, let's see what we have
  const { data: duplicates, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return;
  }

  // Group by user_email
  const userSubscriptions = {};
  duplicates.forEach(sub => {
    if (!userSubscriptions[sub.user_email]) {
      userSubscriptions[sub.user_email] = [];
    }
    userSubscriptions[sub.user_email].push(sub);
  });

  // Find users with multiple subscriptions
  const usersWithDuplicates = Object.entries(userSubscriptions)
    .filter(([email, subs]) => subs.length > 1)
    .map(([email, subs]) => ({ email, subscriptions: subs }));

  console.log('Users with multiple subscriptions:', usersWithDuplicates.length);

  for (const { email, subscriptions } of usersWithDuplicates) {
    console.log(`\nProcessing ${email}:`);
    console.log('Subscriptions:', subscriptions.map(s => ({
      id: s.id,
      stripe_id: s.stripe_subscription_id,
      status: s.status,
      created_at: s.created_at
    })));

    // Keep the most recent active subscription, or the most recent one if none are active
    const activeSub = subscriptions.find(s => s.status === 'active');
    const subscriptionToKeep = activeSub || subscriptions[0];
    
    console.log('Keeping subscription:', subscriptionToKeep.stripe_subscription_id);

    // Delete the others
    const subscriptionsToDelete = subscriptions.filter(s => s.id !== subscriptionToKeep.id);
    
    for (const subToDelete of subscriptionsToDelete) {
      console.log('Deleting subscription:', subToDelete.stripe_subscription_id);
      const { error: deleteError } = await supabase
        .from('user_subscriptions')
        .delete()
        .eq('id', subToDelete.id);
      
      if (deleteError) {
        console.error('Error deleting subscription:', deleteError);
      } else {
        console.log('Successfully deleted subscription:', subToDelete.stripe_subscription_id);
      }
    }
  }

  console.log('\nCleanup completed!');
}

cleanupDuplicates().catch(console.error); 