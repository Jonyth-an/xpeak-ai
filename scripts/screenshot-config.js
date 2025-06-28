module.exports = {
  // Base configuration
  baseUrl: process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000',
  outputDir: process.env.SCREENSHOT_OUTPUT_DIR || '../docs/screenshots',
  
  // Viewport configurations
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
    mobileLarge: { width: 414, height: 896 }
  },
  
  // Test user credentials (modify these for your test account)
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'testpassword123'
  },
  
  // Pages to capture
  pages: {
    public: [
      { path: '/home', name: 'home-page', fullPage: true },
      { path: '/login', name: 'login-page', fullPage: false },
      { path: '/signup', name: 'signup-page', fullPage: false },
      { path: '/pricing', name: 'pricing-page', fullPage: true },
      { path: '/tutors', name: 'tutors-page', fullPage: true },
      { path: '/ai-topics', name: 'ai-topics-page', fullPage: true },
      { path: '/word-maze', name: 'word-maze-page', fullPage: true },
      { path: '/become-a-tutor', name: 'become-tutor-page', fullPage: true }
    ],
    authenticated: [
      { path: '/profile', name: 'profile-page', fullPage: true },
      { path: '/home', name: 'home-page-authenticated', fullPage: true }
    ]
  },
  
  // Interactive states to capture
  interactiveStates: [
    {
      page: '/login',
      actions: [
        { type: 'type', selector: 'input[type="email"]', value: 'user@example.com' },
        { type: 'type', selector: 'input[type="password"]', value: 'password123' }
      ],
      name: 'login-page-filled-form'
    },
    {
      page: '/signup',
      actions: [
        { type: 'type', selector: 'input[name="name"]', value: 'John Doe' },
        { type: 'type', selector: 'input[type="email"]', value: 'john@example.com' },
        { type: 'type', selector: 'input[type="password"]', value: 'password123' }
      ],
      name: 'signup-page-filled-form'
    }
  ],
  
  // Browser options
  browserOptions: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  },
  
  // Screenshot options
  screenshotOptions: {
    quality: 90,
    type: 'png'
  },
  
  // Wait times (in milliseconds)
  waitTimes: {
    pageLoad: 2000,
    animation: 1000,
    interaction: 500
  }
}; 