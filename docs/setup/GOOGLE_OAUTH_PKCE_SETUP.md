# Google OAuth with PKCE Setup Guide

## Overview

This guide explains how to set up Google OAuth with Authorization Code Flow and PKCE (Proof Key for Code Exchange) for Supabase v2. This is the recommended and most secure approach for OAuth authentication.

## Prerequisites

1. A Supabase project with authentication enabled
2. A Google Cloud Console project with OAuth 2.0 credentials
3. Next.js application running locally at `http://localhost:3000`

## Step 1: Configure Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add authorized redirect URIs:
   - **Development**: `http://localhost:3000/auth/callback`
   - **Production**: `https://your-domain.com/auth/callback`
   - **Supabase**: `https://<your-project>.supabase.co/auth/v1/callback`
7. Note down the Client ID and Client Secret

## Step 2: Configure Google OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list and click "Edit"
4. Enable Google authentication
5. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
6. Save the configuration

## Step 3: Environment Variables

Make sure you have these environment variables in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 4: Implementation Details

### Login Button Implementation

The login button now uses the updated OAuth flow:

```typescript
const handleGoogleLogin = async () => {
  setIsGoogleLoading(true);
  setError(null);
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      setError(error.message || "Google sign-in failed");
      setIsGoogleLoading(false);
    }
    // User will be redirected to Google, then back to /auth/callback
  } catch (err: any) {
    setError(err.message || "Google sign-in failed");
    setIsGoogleLoading(false);
  }
};
```

### Auth Callback Handler

The `/auth/callback` route handles the OAuth response:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const accessToken = searchParams.get('access_token');
  
  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth_${error}`);
  }
  
  // Detect wrong flow (implicit instead of authorization code)
  if (accessToken && !code) {
    return NextResponse.redirect(`${origin}/login?error=wrong_flow`);
  }
  
  if (code) {
    const supabase = createServerClient(/* ... */);
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
      }
      
      if (data.session) {
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    } catch (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
  }
  
  return NextResponse.redirect(`${origin}/login?error=no_auth_code`);
}
```

## Step 5: Testing the Integration

1. Start your development server: `npm run dev`
2. Run the OAuth test: `node tests/integration/test-oauth-pkce-flow.js`
3. Go to `/login` or `/signup`
4. Click "Continue with Google"
5. You should be redirected to Google's OAuth consent screen
6. After authentication, you should be redirected back to your app at `/dashboard`

## Troubleshooting

### Common Issues

#### 1. "No authentication code received" Error

**Cause**: The OAuth flow is returning an access token instead of an authorization code.

**Solution**: 
- Ensure you're using the login button to initiate OAuth
- Verify Google Cloud Console redirect URIs are correct
- Check that Supabase is configured for Authorization Code Flow

#### 2. "Invalid redirect URI" Error

**Cause**: The redirect URI in Google Cloud Console doesn't match your callback URL.

**Solution**:
- Add `http://localhost:3000/auth/callback` to authorized redirect URIs
- Add `https://<your-project>.supabase.co/auth/v1/callback` to authorized redirect URIs

#### 3. "Client ID not found" Error

**Cause**: Incorrect Client ID or Secret in Supabase configuration.

**Solution**:
- Verify Client ID and Secret in Supabase dashboard
- Ensure Google OAuth is enabled in Supabase

#### 4. "PKCE verification failed" Error

**Cause**: PKCE parameters are missing or incorrect.

**Solution**:
- Ensure you're using the latest Supabase client
- Verify the OAuth URL includes `code_challenge` and `code_challenge_method` parameters

### Debug Steps

1. **Check Browser Console**: Look for OAuth-related logs and errors
2. **Check Server Logs**: Monitor the `/auth/callback` route logs
3. **Verify OAuth URL**: Use the test script to analyze the generated OAuth URL
4. **Check Network Tab**: Monitor the OAuth redirect flow in browser dev tools

### OAuth URL Analysis

The OAuth URL should include these parameters:
- `response_type=code` (Authorization Code Flow)
- `code_challenge=...` (PKCE challenge)
- `code_challenge_method=S256` (PKCE method)
- `redirect_uri=http://localhost:3000/auth/callback`

### Testing Checklist

- [ ] OAuth URL generation works
- [ ] PKCE parameters are present in OAuth URL
- [ ] Response type is "code" (not "token")
- [ ] Redirect URI is correct
- [ ] Google OAuth consent screen appears
- [ ] User is redirected back to `/auth/callback`
- [ ] Session is created successfully
- [ ] User is redirected to `/dashboard`
- [ ] Session persists across page refreshes

## Security Notes

- **PKCE**: Always use Authorization Code Flow with PKCE for web applications
- **HTTPS**: Use HTTPS in production for secure token transmission
- **Redirect URIs**: Only allow trusted redirect URIs in Google Cloud Console
- **Client Secrets**: Never expose client secrets in client-side code
- **Token Storage**: Supabase handles secure token storage automatically

## Migration from Implicit Flow

If you were previously using Implicit Flow (response_type=token), you need to:

1. Update your OAuth configuration to use Authorization Code Flow
2. Ensure your callback handler uses `exchangeCodeForSession()`
3. Test the complete flow to ensure compatibility

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run the test script: `node tests/integration/test-oauth-pkce-flow.js`
3. Review browser console and server logs
4. Verify all configuration steps are completed
5. Ensure you're using the latest Supabase client version 