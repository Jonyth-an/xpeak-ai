#!/usr/bin/env node

/**
 * Test Script for Billing Functionality
 * 
 * This script helps test the billing system step by step.
 * Run this script and follow the prompts to test different features.
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🧪 Xpeak AI Billing Functionality Test\n');
  console.log('This script will help you test the billing system.\n');
  
  console.log('📋 Test Checklist:');
  console.log('1. ✅ Database cleanup (duplicate subscriptions)');
  console.log('2. 🔄 Billing API endpoint');
  console.log('3. 💳 New subscription creation');
  console.log('4. 🔄 Subscription upgrade/downgrade');
  console.log('5. ❌ Subscription cancellation');
  console.log('6. 🔄 Subscription reactivation');
  console.log('7. 💳 Payment method management');
  console.log('8. 📄 Invoice viewing');
  console.log('9. 🔗 Webhook processing');
  
  console.log('\n🚀 Let\'s start testing!\n');
  
  // Step 1: Database cleanup
  console.log('Step 1: Database Cleanup');
  console.log('⚠️  You need to run the SQL cleanup script in your Supabase dashboard:');
  console.log('   - Go to your Supabase project dashboard');
  console.log('   - Navigate to SQL Editor');
  console.log('   - Run the contents of cleanup-duplicate-subscriptions.sql');
  console.log('   - This will remove duplicate subscription records\n');
  
  await question('Press Enter after running the SQL cleanup...');
  
  // Step 2: Test billing API
  console.log('\nStep 2: Test Billing API');
  console.log('🌐 Open your browser and navigate to:');
  console.log('   http://localhost:3000/profile/billing');
  console.log('   (Make sure you\'re logged in)');
  console.log('\nExpected behavior:');
  console.log('   - Should show current subscription details');
  console.log('   - Should display payment method info');
  console.log('   - Should show recent invoices');
  console.log('   - Should have "Cancel Subscription" button');
  console.log('   - Should have "Change Plan" button\n');
  
  await question('Press Enter after checking the billing page...');
  
  // Step 3: Test new subscription
  console.log('\nStep 3: Test New Subscription');
  console.log('🌐 Navigate to:');
  console.log('   http://localhost:3000/pricing');
  console.log('\nExpected behavior:');
  console.log('   - Should show plan options (Free, Plus, Pro)');
  console.log('   - Should have monthly/yearly toggle');
  console.log('   - Clicking "Start Learning" should redirect to Stripe');
  console.log('   - After payment, should redirect to success page');
  console.log('   - Webhook should process the subscription\n');
  
  await question('Press Enter after testing new subscription...');
  
  // Step 4: Test upgrade/downgrade
  console.log('\nStep 4: Test Upgrade/Downgrade');
  console.log('🌐 Navigate to:');
  console.log('   http://localhost:3000/profile/billing');
  console.log('   Click "Change Plan" button');
  console.log('\nExpected behavior:');
  console.log('   - Should redirect to pricing page with current plan pre-selected');
  console.log('   - Should show upgrade/downgrade context');
  console.log('   - Selecting a different plan should create new checkout session');
  console.log('   - After payment, old subscription should be cancelled at period end\n');
  
  await question('Press Enter after testing upgrade/downgrade...');
  
  // Step 5: Test cancellation
  console.log('\nStep 5: Test Subscription Cancellation');
  console.log('🌐 Navigate to:');
  console.log('   http://localhost:3000/profile/billing');
  console.log('   Click "Cancel Subscription" button');
  console.log('\nExpected behavior:');
  console.log('   - Should show confirmation modal');
  console.log('   - Confirming should cancel subscription at period end');
  console.log('   - Should show "Reactivate" button after cancellation');
  console.log('   - Subscription should remain active until period end\n');
  
  await question('Press Enter after testing cancellation...');
  
  // Step 6: Test reactivation
  console.log('\nStep 6: Test Subscription Reactivation');
  console.log('🌐 On the billing page, click "Reactivate Subscription"');
  console.log('\nExpected behavior:');
  console.log('   - Should reactivate the subscription immediately');
  console.log('   - Should remove "Reactivate" button');
  console.log('   - Should show normal subscription status\n');
  
  await question('Press Enter after testing reactivation...');
  
  // Step 7: Test payment method management
  console.log('\nStep 7: Test Payment Method Management');
  console.log('🌐 On the billing page, click "Update Payment Method"');
  console.log('\nExpected behavior:');
  console.log('   - Should redirect to Stripe Customer Portal');
  console.log('   - Should allow updating payment method');
  console.log('   - Should return to billing page after update\n');
  
  await question('Press Enter after testing payment method management...');
  
  // Step 8: Test invoice viewing
  console.log('\nStep 8: Test Invoice Viewing');
  console.log('🌐 On the billing page, click on an invoice');
  console.log('\nExpected behavior:');
  console.log('   - Should open invoice PDF in new tab');
  console.log('   - Should show correct invoice details\n');
  
  await question('Press Enter after testing invoice viewing...');
  
  // Step 9: Test webhook processing
  console.log('\nStep 9: Test Webhook Processing');
  console.log('📡 Check your terminal where stripe listen is running');
  console.log('\nExpected behavior:');
  console.log('   - Should see webhook events being processed');
  console.log('   - Should see successful POST requests (200 status)');
  console.log('   - Should see subscription data being stored in database\n');
  
  await question('Press Enter after checking webhook processing...');
  
  console.log('\n🎉 Testing Complete!');
  console.log('\n📝 Summary:');
  console.log('If all steps worked correctly, your billing system is functioning properly!');
  console.log('\n🔧 If you encountered issues:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Check terminal for server errors');
  console.log('3. Check Stripe dashboard for webhook failures');
  console.log('4. Check Supabase logs for database errors');
  
  rl.close();
}

main().catch(console.error); 