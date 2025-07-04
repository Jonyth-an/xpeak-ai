# Automated Screenshot Generator

This guide explains how to use the automated screenshot generator for the Xpeak AI project.

## Quick Start

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Generate screenshots:**
   ```bash
   npm run screenshots
   ```

3. **View results:**
   Check the `docs/screenshots/` directory for generated images and the report.

## What It Captures

### Public Pages
- Home page (full page)
- Login page
- Signup page
- Pricing page (full page)
- Tutors page (full page)
- AI Topics page (full page)
- Word Maze page (full page)
- Become a Tutor page (full page)

### Authenticated Pages
- Profile page (full page)
- Home page after login (full page)
- Avatar upload modal (if available)

### Mobile Views
- Mobile versions of key pages
- iPhone SE viewport (375x667)

### Interactive States
- Login form with filled fields
- Signup form with filled fields
- Hover states on pricing buttons

## Configuration

### Environment Variables
You can customize the screenshot generation using environment variables:

```bash
# Set custom base URL (default: http://localhost:3000)
export SCREENSHOT_BASE_URL="http://localhost:3001"

# Set custom output directory (default: docs/screenshots)
export SCREENSHOT_OUTPUT_DIR="custom/screenshots"

# Set test user credentials
export TEST_USER_EMAIL="your-test-email@example.com"
export TEST_USER_PASSWORD="your-test-password"
```

### Configuration File
Edit `scripts/screenshot-config.js` to:
- Add/remove pages to capture
- Change viewport sizes
- Modify wait times
- Add custom interactive states

## Use Cases

### For Documentation
- Include screenshots in README files
- Create feature documentation
- Show UI changes in pull requests

### For Marketing
- Generate consistent product screenshots
- Create promotional materials
- Build presentation slides

### For Development
- Track UI changes over time
- Compare different versions
- Document bugs with visual context

### For Testing
- Visual regression testing
- Cross-browser compatibility checks
- Mobile responsiveness verification

## Customization Examples

### Add a New Page
Edit `scripts/screenshot-config.js`:

```javascript
pages: {
  public: [
    // ... existing pages
    { path: '/new-feature', name: 'new-feature-page', fullPage: true }
  ]
}
```

### Capture Custom Interactive State
```javascript
interactiveStates: [
  {
    page: '/profile',
    actions: [
      { type: 'click', selector: '.edit-button' },
      { type: 'wait', time: 1000 }
    ],
    name: 'profile-edit-mode'
  }
]
```

### Change Viewport
```javascript
viewports: {
  custom: { width: 1440, height: 900 }
}
```

## Troubleshooting

### Common Issues

1. **"Connection refused" error:**
   - Make sure your dev server is running on the correct port
   - Check the `baseUrl` in the config

2. **Authentication fails:**
   - Update test credentials in the config file
   - Ensure the test account exists and works

3. **Screenshots are empty:**
   - Increase wait times in the config
   - Check if pages are loading correctly

4. **Missing elements:**
   - Verify CSS selectors in the config
   - Check if elements are conditionally rendered

### Debug Mode
To see what's happening, modify the browser options:

```javascript
browserOptions: {
  headless: false, // Show browser window
  slowMo: 1000     // Slow down actions
}
```

## Integration with CI/CD

You can integrate screenshot generation into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Generate Screenshots
  run: |
    npm run dev &
    sleep 30
    npm run screenshots
  env:
    SCREENSHOT_BASE_URL: ${{ secrets.SCREENSHOT_BASE_URL }}
```

## Best Practices

1. **Keep screenshots up to date:** Run regularly to reflect current UI
2. **Use consistent naming:** Follow the established naming convention
3. **Version control:** Commit screenshots to track UI evolution
4. **Optimize for size:** Use appropriate quality settings for your needs
5. **Document changes:** Update this guide when adding new features

## File Structure

```
docs/
├── screenshots/
│   ├── home-page-2024-01-15T10-30-00.png
│   ├── login-page-2024-01-15T10-30-00.png
│   ├── screenshot-report.md
│   └── ...
└── screenshot-guide.md

scripts/
├── screenshot-generator.js
└── screenshot-config.js
```

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your development server is running
3. Review the configuration file
4. Check the troubleshooting section above 