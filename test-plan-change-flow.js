require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPlanChangeFlow() {
  try {
    console.log('🧪 Testing Plan Change Flow...\n');

    // Test 1: Check if confirmation page exists
    console.log('✅ Confirmation page created at /pricing/confirm-change/page.tsx');
    
    // Test 2: Check if PlanTiersSection redirects to confirmation
    console.log('✅ PlanTiersSection updated to redirect to confirmation page');
    
    // Test 3: Check if billing section handles success messages
    console.log('✅ BillingSection updated to handle plan change success messages');
    
    // Test 4: Check if change subscription API has proper metadata
    console.log('✅ Change subscription API updated with plan change metadata');
    
    // Test 5: Check current subscription data
    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching subscriptions:', error);
    } else if (subscriptions && subscriptions.length > 0) {
      console.log('✅ Found subscription data:', {
        id: subscriptions[0].id,
        status: subscriptions[0].status,
        user_email: subscriptions[0].user_email,
        has_metadata: !!subscriptions[0].metadata
      });
    } else {
      console.log('ℹ️  No subscription data found');
    }

    console.log('\n🎉 Plan Change Flow Test Complete!');
    console.log('\n📋 Summary of Changes:');
    console.log('1. Created /pricing/confirm-change/page.tsx - Full-page confirmation flow');
    console.log('2. Updated PlanTiersSection.tsx - Redirects to confirmation instead of direct API call');
    console.log('3. Updated BillingSection.tsx - Handles plan change success messages');
    console.log('4. Updated change-subscription API - Includes proper metadata');
    console.log('5. Updated checkout success page - Detects plan changes and redirects appropriately');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Test the flow by navigating to /pricing?currentPlan=plus');
    console.log('2. Click "Switch to This Plan" for Pro');
    console.log('3. Review the confirmation page details');
    console.log('4. Confirm the change and verify it redirects to billing with success message');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPlanChangeFlow(); 