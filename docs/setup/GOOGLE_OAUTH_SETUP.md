# Google OAuth Setup Guide

## Prerequisites

1. A Supabase project with authentication enabled
2. A Google Cloud Console project with OAuth 2.0 credentials

## Step 1: Configure Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
7. Note down the Client ID and Client Secret

## Step 2: Configure Google OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list and click "Edit"
4. Enable Google authentication
5. Enter your Google OAuth credentials:
   - Client ID: Your Google OAuth Client ID
   - Client Secret: Your Google OAuth Client Secret
6. Save the configuration

## Step 3: Environment Variables

Make sure you have these environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/login` or `/signup`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authentication, you should be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI" error**: Make sure the redirect URI in Google Cloud Console matches exactly with your callback URL
2. **"Client ID not found" error**: Verify that the Client ID and Secret are correctly entered in Supabase
3. **"OAuth consent screen not configured"**: Make sure you've configured the OAuth consent screen in Google Cloud Console

### Debug Steps:

1. Check browser console for any JavaScript errors
2. Check server logs for authentication errors
3. Verify that the `/auth/callback` route is working correctly
4. Ensure your Supabase project has the correct site URL configured

## Security Notes

- Never commit your `.env.local` file to version control
- Use different OAuth credentials for development and production
- Regularly rotate your OAuth secrets
- Monitor your OAuth usage in Google Cloud Console 