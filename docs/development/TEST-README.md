# Profile Page Functionality Tests

This automated test script uses Puppeteer to test the profile page functionality in your Xpeak AI application.

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Your development server running (usually on `http://localhost:3001`)
- Puppeteer installed (`npm install --save-dev puppeteer`)

### Running the Tests

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Run the automated tests:**
   ```bash
   npm run test:profile
   ```

## 📋 What the Tests Cover

### 1. **Authentication & Access**
- ✅ Protected route access (redirects unauthenticated users)
- ✅ User registration process
- ✅ Profile page access after authentication

### 2. **Profile Form Functionality**
- ✅ Profile data loading from Supabase
- ✅ Edit mode activation
- ✅ Form field editing
- ✅ Data saving and success feedback

### 3. **Password Management**
- ✅ Password change form display
- ✅ Password validation (strength, confirmation)
- ✅ Password update functionality

### 4. **Language Preferences**
- ✅ Language selection interface
- ✅ Visual feedback for selections
- ✅ Preferences saving to Supabase

### 5. **Learning Stats**
- ✅ Stats cards display
- ✅ Data visualization
- ✅ Responsive layout

### 6. **Navigation & UX**
- ✅ Header navigation (Profile link)
- ✅ Responsive design (mobile/desktop)
- ✅ Loading states and feedback

## ⚙️ Configuration

You can modify the test configuration in `test-profile-functionality.js`:

```javascript
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001', // Update to match your dev server
  testUser: {
    email: 'test@example.com',
    password: 'testpassword123',
    fullName: 'Test User'
  },
  timeout: 10000
};
```

## 🎯 Test Results

The script provides detailed feedback:

```
🚀 Starting Profile Page Functionality Tests...

📋 Test 1: Protected Route Access
✅ Profile page redirects unauthenticated users

📋 Test 2: User Registration
✅ User registration works

📊 Test Results Summary:
Total Tests: 10
Passed: 10
Failed: 0
Success Rate: 100.0%
```

## 🔧 Troubleshooting

### Common Issues:

1. **Port Mismatch**: Update `baseUrl` in the test config to match your dev server port
2. **Slow Loading**: Increase `timeout` values for slower connections
3. **Element Not Found**: Check if your HTML structure matches the selectors used in tests

### Debug Mode:
Set `headless: false` in the Puppeteer launch options to see the browser in action:

```javascript
const browser = await puppeteer.launch({ 
  headless: false, // Shows browser window
  slowMo: 100 // Slows down actions for visibility
});
```

## 📝 Adding New Tests

To add new test cases:

1. Add a new test section in the `runProfileTests()` function
2. Use the `logTest()` helper function to record results
3. Use `waitForElement()` and `elementExists()` helpers for reliable element detection

Example:
```javascript
// Test 11: New Feature
console.log('\n📋 Test 11: New Feature');
const newElement = await page.$('selector');
logTest('New feature works', newElement !== null);
```

## 🎉 Success Criteria

A successful test run should show:
- ✅ All 10 tests passing
- ✅ 100% success rate
- ✅ No failed assertions
- ✅ Proper error handling

This automated testing helps ensure your profile page functionality remains stable as you continue development! 