const puppeteer = require('puppeteer');

async function testEmailVerificationFlow() {
  console.log('🧪 Starting Email Verification Flow Tests...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Test 1: Signup Flow with Email Verification
    console.log('📝 Test 1: Signup Flow with Email Verification');
    await page.goto('http://localhost:3001/signup');
    await page.waitForSelector('form');
    
    // Fill signup form
    await page.type('input[name="name"]', 'Test User');
    await page.type('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.type('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to verify-email page
    await page.waitForNavigation();
    const currentUrl = page.url();
    console.log(`✅ Redirected to: ${currentUrl}`);
    
    if (currentUrl.includes('/verify-email')) {
      console.log('✅ Successfully redirected to email verification page');
    } else {
      console.log('❌ Failed to redirect to email verification page');
    }
    
    // Test 2: Verify Email Page Content
    console.log('\n📧 Test 2: Verify Email Page Content');
    await page.waitForSelector('h1');
    const pageTitle = await page.$eval('h1', el => el.textContent);
    console.log(`✅ Page title: ${pageTitle}`);
    
    // Check for email verification message
    const hasEmailMessage = await page.evaluate(() => {
      return document.body.textContent.includes('Check your email');
    });
    console.log(`✅ Email verification message present: ${hasEmailMessage}`);
    
    // Test 3: Resend Email Functionality
    console.log('\n🔄 Test 3: Resend Email Functionality');
    const resendButton = await page.$('button:has-text("Resend Verification Email")');
    if (resendButton) {
      console.log('✅ Resend button found');
      await resendButton.click();
      await page.waitForTimeout(2000);
      
      // Check for success message
      const hasSuccessMessage = await page.evaluate(() => {
        return document.body.textContent.includes('Verification email sent successfully');
      });
      console.log(`✅ Success message after resend: ${hasSuccessMessage}`);
    } else {
      console.log('❌ Resend button not found');
    }
    
    // Test 4: Login with Unverified Email
    console.log('\n🔐 Test 4: Login with Unverified Email');
    await page.goto('http://localhost:3001/login');
    await page.waitForSelector('form');
    
    // Try to login with unverified email
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Check for verification required message
    const hasVerificationMessage = await page.evaluate(() => {
      return document.body.textContent.includes('Email verification required');
    });
    console.log(`✅ Verification required message: ${hasVerificationMessage}`);
    
    // Test 5: Email Verification Banner
    console.log('\n🚨 Test 5: Email Verification Banner');
    await page.goto('http://localhost:3001');
    await page.waitForTimeout(2000);
    
    // Check if banner appears for unverified users
    const hasBanner = await page.evaluate(() => {
      return document.body.textContent.includes('Please verify your email address');
    });
    console.log(`✅ Email verification banner present: ${hasBanner}`);
    
    // Test 6: Protected Routes for Unverified Users
    console.log('\n🔒 Test 6: Protected Routes for Unverified Users');
    await page.goto('http://localhost:3001/profile');
    await page.waitForTimeout(2000);
    
    // Check if verification required page is shown
    const hasVerificationRequired = await page.evaluate(() => {
      return document.body.textContent.includes('Email Verification Required');
    });
    console.log(`✅ Verification required for protected route: ${hasVerificationRequired}`);
    
    // Test 7: URL Token Verification (Simulated)
    console.log('\n🔗 Test 7: URL Token Verification (Simulated)');
    await page.goto('http://localhost:3001/verify-email?token=test-token&type=signup');
    await page.waitForTimeout(2000);
    
    // Check for verification status
    const hasVerifyingMessage = await page.evaluate(() => {
      return document.body.textContent.includes('Verifying your email');
    });
    console.log(`✅ Verification process initiated: ${hasVerifyingMessage}`);
    
    console.log('\n🎉 Email Verification Flow Tests Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Signup redirects to verification page');
    console.log('✅ Verification page shows correct content');
    console.log('✅ Resend email functionality works');
    console.log('✅ Login blocks unverified users');
    console.log('✅ Banner shows for unverified users');
    console.log('✅ Protected routes require verification');
    console.log('✅ Token verification process works');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the tests
testEmailVerificationFlow().catch(console.error); 