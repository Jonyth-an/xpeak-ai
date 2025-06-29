const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupDuplicates() {
  console.log('Checking for duplicate subscriptions...');
  const { data: allSubs, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return;
  }

  // Group by user_email
  const grouped = {};
  allSubs.forEach(sub => {
    if (!grouped[sub.user_email]) grouped[sub.user_email] = [];
    grouped[sub.user_email].push(sub);
  });

  let toDelete = [];
  for (const [email, subs] of Object.entries(grouped)) {
    if (subs.length <= 1) continue;
    // Prefer active, else most recent
    const keep = subs.find(s => s.status === 'active') || subs[0];
    toDelete.push(...subs.filter(s => s.id !== keep.id));
  }

  if (toDelete.length === 0) {
    console.log('No duplicates found.');
    return;
  }

  console.log('Deleting', toDelete.length, 'duplicate records...');
  for (const sub of toDelete) {
    const { error: delErr } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('id', sub.id);
    if (delErr) {
      console.error('Failed to delete', sub.id, delErr);
    } else {
      console.log('Deleted duplicate subscription:', sub.id, sub.user_email);
    }
  }
  console.log('Cleanup complete.');
}

cleanupDuplicates(); 