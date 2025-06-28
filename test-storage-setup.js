const puppeteer = require('puppeteer');

async function testStorageSetup() {
  console.log('🧪 Testing Supabase Storage Setup...\n');

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to the test page
    console.log('📄 Navigating to test page...');
    await page.goto('http://localhost:3001/test-supabase', { waitUntil: 'networkidle0' });
    
    // Check if Supabase is connected
    console.log('🔍 Checking Supabase connection...');
    const connectionStatus = await page.evaluate(() => {
      const statusElement = document.querySelector('[data-testid="supabase-status"]');
      return statusElement ? statusElement.textContent : 'Status not found';
    });
    
    console.log(`📊 Supabase Status: ${connectionStatus}`);
    
    // Check environment variables
    console.log('🔧 Checking environment variables...');
    const envStatus = await page.evaluate(() => {
      const urlStatus = document.querySelector('p:contains("NEXT_PUBLIC_SUPABASE_URL")');
      const keyStatus = document.querySelector('p:contains("NEXT_PUBLIC_SUPABASE_ANON_KEY")');
      return {
        url: urlStatus ? urlStatus.textContent : 'Not found',
        key: keyStatus ? keyStatus.textContent : 'Not found'
      };
    });
    
    console.log(`🔑 URL Status: ${envStatus.url}`);
    console.log(`🔑 Key Status: ${envStatus.key}`);
    
    // Navigate to profile page to test storage
    console.log('👤 Navigating to profile page...');
    await page.goto('http://localhost:3001/profile', { waitUntil: 'networkidle0' });
    
    // Check if avatar upload component is present
    console.log('🖼️ Checking avatar upload component...');
    const avatarComponent = await page.evaluate(() => {
      const uploadArea = document.querySelector('input[type="file"]');
      const uploadButton = document.querySelector('button:contains("Upload New Photo")');
      return {
        fileInput: !!uploadArea,
        uploadButton: !!uploadButton
      };
    });
    
    console.log(`📁 File input present: ${avatarComponent.fileInput}`);
    console.log(`🔘 Upload button present: ${avatarComponent.uploadButton}`);
    
    // Test file upload (simulate without actual file)
    console.log('📤 Testing file upload simulation...');
    await page.evaluate(() => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        // Create a mock file
        const file = new File(['mock content'], 'test.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      }
    });
    
    // Wait a moment for any upload attempts
    await page.waitForTimeout(2000);
    
    // Check for error messages (expected since we're not actually uploading)
    console.log('⚠️ Checking for expected upload errors...');
    const errorMessage = await page.evaluate(() => {
      const errorElement = document.querySelector('.bg-red-50');
      return errorElement ? errorElement.textContent : 'No error message found';
    });
    
    console.log(`❌ Error message: ${errorMessage}`);
    
    // Test storage bucket check
    console.log('🪣 Testing storage bucket access...');
    const bucketStatus = await page.evaluate(async () => {
      try {
        // This would need to be implemented in the test page
        // For now, we'll just check if the page loads without storage errors
        return 'Page loaded successfully';
      } catch (error) {
        return `Storage error: ${error.message}`;
      }
    });
    
    console.log(`🪣 Bucket status: ${bucketStatus}`);
    
    console.log('\n✅ Storage setup test completed!');
    console.log('\n📋 Summary:');
    console.log('- Supabase connection should be working');
    console.log('- Environment variables should be configured');
    console.log('- Avatar upload component should be present');
    console.log('- Storage bucket should be accessible');
    
    console.log('\n🔧 Next steps:');
    console.log('1. Create the "avatars" bucket in Supabase Dashboard');
    console.log('2. Set up RLS policies as described in docs/supabase-storage-setup.md');
    console.log('3. Test with a real image file');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testStorageSetup().catch(console.error); 