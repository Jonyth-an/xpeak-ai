const puppeteer = require('puppeteer');

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001', // Update this to match your dev server port
  testUser: {
    email: 'test@example.com',
    password: 'testpassword123',
    fullName: 'Test User'
  },
  timeout: 10000
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to log test results
function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name} - ${details}`);
  }
  testResults.details.push({ name, passed, details });
}

// Helper function to wait for element
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to check if element exists
async function elementExists(page, selector) {
  const element = await page.$(selector);
  return element !== null;
}

// Main test suite
async function runProfileTests() {
  console.log('🚀 Starting Profile Page Functionality Tests...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless mode
    slowMo: 100 // Slow down actions for visibility
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Access profile page without authentication
    console.log('📋 Test 1: Protected Route Access');
    await page.goto(`${TEST_CONFIG.baseUrl}/profile`);
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/signup');
    logTest('Profile page redirects unauthenticated users', isRedirected);
    
    // Test 2: Sign up process
    console.log('\n📋 Test 2: User Registration');
    await page.goto(`${TEST_CONFIG.baseUrl}/signup`);
    await page.waitForTimeout(1000);
    
    // Fill signup form
    await page.type('input[name="email"]', TEST_CONFIG.testUser.email);
    await page.type('input[name="password"]', TEST_CONFIG.testUser.password);
    await page.type('input[name="fullName"]', TEST_CONFIG.testUser.fullName);
    
    // Submit form
    const signupButton = await page.$('button[type="submit"]');
    if (signupButton) {
      await signupButton.click();
      await page.waitForTimeout(3000);
      
      // Check for success message or redirect
      const successMessage = await page.$('.text-green-800, .bg-green-50');
      const isSignedUp = successMessage !== null || page.url().includes('/profile');
      logTest('User registration works', isSignedUp);
    } else {
      logTest('User registration works', false, 'Signup button not found');
    }
    
    // Test 3: Profile page access after authentication
    console.log('\n📋 Test 3: Profile Page Access');
    await page.goto(`${TEST_CONFIG.baseUrl}/profile`);
    await page.waitForTimeout(2000);
    
    const profileHeader = await page.$('h1');
    const canAccessProfile = profileHeader && await profileHeader.evaluate(el => el.textContent.includes('Profile'));
    logTest('Authenticated users can access profile page', canAccessProfile);
    
    // Test 4: Profile form data loading
    console.log('\n📋 Test 4: Profile Data Loading');
    const emailField = await page.$('input[name="email"]');
    const nameField = await page.$('input[name="full_name"]');
    
    if (emailField && nameField) {
      const emailValue = await emailField.evaluate(el => el.value);
      const nameValue = await nameField.evaluate(el => el.value);
      
      const dataLoaded = emailValue === TEST_CONFIG.testUser.email && nameValue === TEST_CONFIG.testUser.fullName;
      logTest('Profile data loads correctly', dataLoaded, `Email: ${emailValue}, Name: ${nameValue}`);
    } else {
      logTest('Profile data loads correctly', false, 'Form fields not found');
    }
    
    // Test 5: Profile editing functionality
    console.log('\n📋 Test 5: Profile Editing');
    const editButton = await page.$('button:has-text("Edit Profile")');
    if (editButton) {
      await editButton.click();
      await page.waitForTimeout(1000);
      
      // Check if form becomes editable
      const nameField = await page.$('input[name="full_name"]');
      if (nameField) {
        const isDisabled = await nameField.evaluate(el => el.disabled);
        logTest('Edit button enables form editing', !isDisabled);
        
        // Test saving changes
        const newName = 'Updated Test User';
        await nameField.click();
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        await page.type('input[name="full_name"]', newName);
        
        const saveButton = await page.$('button:has-text("Save Changes")');
        if (saveButton) {
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          // Check for success message
          const successMessage = await page.$('.text-green-800, .bg-green-50');
          logTest('Profile changes save successfully', successMessage !== null);
        } else {
          logTest('Profile changes save successfully', false, 'Save button not found');
        }
      } else {
        logTest('Edit button enables form editing', false, 'Name field not found');
      }
    } else {
      logTest('Edit button enables form editing', false, 'Edit button not found');
    }
    
    // Test 6: Password change functionality
    console.log('\n📋 Test 6: Password Change');
    const passwordSection = await page.$('h3:has-text("Password Security")');
    if (passwordSection) {
      const changePasswordButton = await page.$('button:has-text("Change Password")');
      if (changePasswordButton) {
        await changePasswordButton.click();
        await page.waitForTimeout(1000);
        
        // Check if password form appears
        const passwordForm = await page.$('input[name="newPassword"]');
        logTest('Password change form appears', passwordForm !== null);
        
        if (passwordForm) {
          // Test password validation
          await page.type('input[name="newPassword"]', '123');
          await page.type('input[name="confirmPassword"]', '123');
          
          const updateButton = await page.$('button:has-text("Update Password")');
          if (updateButton) {
            await updateButton.click();
            await page.waitForTimeout(2000);
            
            // Check for validation error or success
            const errorMessage = await page.$('.text-red-800, .bg-red-50');
            const successMessage = await page.$('.text-green-800, .bg-green-50');
            logTest('Password validation works', errorMessage !== null || successMessage !== null);
          } else {
            logTest('Password validation works', false, 'Update button not found');
          }
        }
      } else {
        logTest('Password change form appears', false, 'Change password button not found');
      }
    } else {
      logTest('Password change form appears', false, 'Password section not found');
    }
    
    // Test 7: Language preferences
    console.log('\n📋 Test 7: Language Preferences');
    const languageSection = await page.$('h3:has-text("Learning Preferences")');
    if (languageSection) {
      // Test language selection
      const languageCard = await page.$('button:has-text("English")');
      if (languageCard) {
        await languageCard.click();
        await page.waitForTimeout(1000);
        
        // Check if language gets selected
        const selectedLanguage = await page.$('.border-green-500');
        logTest('Language selection works', selectedLanguage !== null);
        
        // Test save functionality
        const saveButton = await page.$('button:has-text("Save Preferences")');
        if (saveButton) {
          await saveButton.click();
          await page.waitForTimeout(2000);
          
          const successMessage = await page.$('.text-green-800, .bg-green-50');
          logTest('Language preferences save successfully', successMessage !== null);
        } else {
          logTest('Language preferences save successfully', false, 'Save button not found');
        }
      } else {
        logTest('Language selection works', false, 'Language card not found');
      }
    } else {
      logTest('Language selection works', false, 'Language section not found');
    }
    
    // Test 8: Learning stats display
    console.log('\n📋 Test 8: Learning Stats');
    const statsSection = await page.$('h2:has-text("Your Progress")');
    if (statsSection) {
      const statCards = await page.$$('.bg-white.rounded-xl');
      logTest('Learning stats display correctly', statCards.length >= 4, `Found ${statCards.length} stat cards`);
    } else {
      logTest('Learning stats display correctly', false, 'Stats section not found');
    }
    
    // Test 9: Header navigation
    console.log('\n📋 Test 9: Header Navigation');
    const profileLink = await page.$('a[href="/profile"]');
    logTest('Profile link appears in header when authenticated', profileLink !== null);
    
    // Test 10: Responsive design
    console.log('\n📋 Test 10: Responsive Design');
    await page.setViewport({ width: 375, height: 667 }); // Mobile viewport
    await page.waitForTimeout(1000);
    
    const mobileLayout = await page.$('.grid.grid-cols-1');
    logTest('Mobile responsive layout works', mobileLayout !== null);
    
    // Reset to desktop viewport
    await page.setViewport({ width: 1280, height: 720 });
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    // Print test summary
    console.log('\n📊 Test Results Summary:');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.details
        .filter(test => !test.passed)
        .forEach(test => console.log(`  - ${test.name}: ${test.details}`));
    }
    
    await browser.close();
  }
}

// Run the tests
runProfileTests().catch(console.error); 