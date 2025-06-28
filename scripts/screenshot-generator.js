const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '../docs/screenshots');
const VIEWPORT = { width: 1920, height: 1080 };

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test user credentials (you can modify these)
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

// Add delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name, options = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  
  await page.screenshot({
    path: filepath,
    fullPage: options.fullPage || false,
    ...options
  });
  
  console.log(`✅ Screenshot saved: ${filename}`);
  return filepath;
}

async function waitForPageLoad(page) {
  await page.waitForSelector('body', { timeout: 10000 });
  await delay(2000); // Additional wait for animations
}

async function capturePublicPages(browser) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  
  console.log('\n📸 Capturing public pages...');
  
  // Home page
  await page.goto(`${BASE_URL}/home`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'home-page', { fullPage: true });
  
  // Login page
  await page.goto(`${BASE_URL}/login`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'login-page');
  
  // Signup page
  await page.goto(`${BASE_URL}/signup`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'signup-page');
  
  // Pricing page
  await page.goto(`${BASE_URL}/pricing`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'pricing-page', { fullPage: true });
  
  // Tutors page
  await page.goto(`${BASE_URL}/tutors`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'tutors-page', { fullPage: true });
  
  // AI Topics page
  await page.goto(`${BASE_URL}/ai-topics`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'ai-topics-page', { fullPage: true });
  
  // Word Maze page
  await page.goto(`${BASE_URL}/word-maze`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'word-maze-page', { fullPage: true });
  
  // Become a Tutor page
  await page.goto(`${BASE_URL}/become-a-tutor`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'become-tutor-page', { fullPage: true });
  
  await page.close();
}

async function captureAuthenticatedPages(browser) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  
  console.log('\n🔐 Capturing authenticated pages...');
  
  try {
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad(page);
    
    // Fill login form
    await page.type('input[type="email"]', TEST_USER.email);
    await page.type('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForNavigation({ timeout: 10000 });
    await delay(3000);
    
    // Profile page
    await page.goto(`${BASE_URL}/profile`);
    await waitForPageLoad(page);
    await takeScreenshot(page, 'profile-page', { fullPage: true });
    
    // Profile page with avatar upload modal (if available)
    try {
      const uploadButton = await page.$('button:has-text("Upload Avatar")');
      if (uploadButton) {
        await uploadButton.click();
        await delay(1000);
        await takeScreenshot(page, 'profile-avatar-upload-modal');
      }
    } catch (e) {
      console.log('⚠️ Avatar upload modal not found');
    }
    
    // Dashboard/Home after login
    await page.goto(`${BASE_URL}/home`);
    await waitForPageLoad(page);
    await takeScreenshot(page, 'home-page-authenticated', { fullPage: true });
    
  } catch (error) {
    console.log('⚠️ Authentication failed, skipping authenticated pages');
    console.log('Error:', error.message);
  }
  
  await page.close();
}

async function captureMobileViews(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 }); // iPhone SE size
  
  console.log('\n📱 Capturing mobile views...');
  
  // Mobile home page
  await page.goto(`${BASE_URL}/home`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'home-page-mobile', { fullPage: true });
  
  // Mobile login page
  await page.goto(`${BASE_URL}/login`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'login-page-mobile');
  
  // Mobile profile page
  await page.goto(`${BASE_URL}/profile`);
  await waitForPageLoad(page);
  await takeScreenshot(page, 'profile-page-mobile', { fullPage: true });
  
  await page.close();
}

async function captureInteractiveStates(browser) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  
  console.log('\n🎯 Capturing interactive states...');
  
  // Login page with form filled
  await page.goto(`${BASE_URL}/login`);
  await waitForPageLoad(page);
  
  await page.type('input[type="email"]', 'user@example.com');
  await page.type('input[type="password"]', 'password123');
  await takeScreenshot(page, 'login-page-filled-form');
  
  // Signup page with form filled
  await page.goto(`${BASE_URL}/signup`);
  await waitForPageLoad(page);
  
  await page.type('input[name="name"]', 'John Doe');
  await page.type('input[type="email"]', 'john@example.com');
  await page.type('input[type="password"]', 'password123');
  await takeScreenshot(page, 'signup-page-filled-form');
  
  // Pricing page with plan selection
  await page.goto(`${BASE_URL}/pricing`);
  await waitForPageLoad(page);
  
  // Try to find and click a plan button
  try {
    const planButton = await page.$('button:has-text("Get Started")');
    if (planButton) {
      await planButton.hover();
      await delay(500);
      await takeScreenshot(page, 'pricing-page-hover-state');
    }
  } catch (e) {
    console.log('⚠️ Plan button not found');
  }
  
  await page.close();
}

async function generateScreenshotReport() {
  const screenshots = fs.readdirSync(SCREENSHOT_DIR)
    .filter(file => file.endsWith('.png'))
    .sort();
  
  const reportPath = path.join(SCREENSHOT_DIR, 'screenshot-report.md');
  const report = `# Screenshot Report

Generated on: ${new Date().toLocaleString()}

## Screenshots Captured (${screenshots.length} total)

${screenshots.map(file => `- \`${file}\``).join('\n')}

## Usage

These screenshots can be used for:
- Documentation
- UI/UX reviews
- Marketing materials
- Bug reports
- Feature demonstrations

## Regenerate Screenshots

To regenerate these screenshots, run:
\`\`\`bash
npm run screenshots
\`\`\`
`;
  
  fs.writeFileSync(reportPath, report);
  console.log(`📄 Report generated: ${reportPath}`);
}

async function main() {
  console.log('🚀 Starting automated screenshot generation...');
  console.log(`📁 Screenshots will be saved to: ${SCREENSHOT_DIR}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    await capturePublicPages(browser);
    await captureAuthenticatedPages(browser);
    await captureMobileViews(browser);
    await captureInteractiveStates(browser);
    
    await generateScreenshotReport();
    
    console.log('\n🎉 Screenshot generation completed successfully!');
    console.log(`📂 Check the screenshots in: ${SCREENSHOT_DIR}`);
    
  } catch (error) {
    console.error('❌ Error during screenshot generation:', error);
  } finally {
    await browser.close();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main }; 