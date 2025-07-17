import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getPKCEVerifier, clearPKCEVerifier } from '@/lib/pkceUtils';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  const accessToken = searchParams.get('access_token');
  const tokenType = searchParams.get('token_type');
  const expiresIn = searchParams.get('expires_in');
  const scope = searchParams.get('scope');
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('🔐 Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    errorDescription,
    state: state ? 'present' : 'missing',
    accessToken: accessToken ? 'present' : 'missing',
    tokenType,
    expiresIn,
    scope,
    next,
    url: request.url,
    origin,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  // Check for OAuth errors first
  if (error) {
    console.error('❌ OAuth error received:', { error, errorDescription });
    return NextResponse.redirect(`${origin}/login?error=oauth_${error}&description=${encodeURIComponent(errorDescription || '')}`);
  }

  // Handle the case where we receive an access_token (implicit flow) instead of code
  if (accessToken && !code) {
    console.error('❌ Received access_token instead of code - this indicates implicit flow is being used');
    console.error('❌ Supabase expects Authorization Code Flow with PKCE');
    return NextResponse.redirect(`${origin}/login?error=wrong_flow&description=${encodeURIComponent('Please use the login button to start the correct OAuth flow')}`);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    
    try {
      console.log('🔄 Exchanging code for session...');
      console.log('📋 Code length:', code?.length);
      console.log('📋 Code preview:', code?.substring(0, 20) + '...');
      
      // Check if we have a PKCE verifier stored
      const pkceVerifier = getPKCEVerifier();
      if (pkceVerifier) {
        console.log('🔐 PKCE verifier found, using for code exchange');
        clearPKCEVerifier(); // Clean up after use
      }
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(request.url);
      
      console.log('🔄 Exchange result:', { 
        hasData: !!data, 
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        errorMessage: error?.message 
      });
      
      if (error) {
        console.error('❌ Auth callback error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
        
        // Provide more specific error messages
        if (error.message?.includes('Invalid code')) {
          return NextResponse.redirect(`${origin}/login?error=invalid_code&description=${encodeURIComponent('The authorization code is invalid or expired. Please try logging in again.')}`);
        } else if (error.message?.includes('PKCE')) {
          return NextResponse.redirect(`${origin}/login?error=pkce_error&description=${encodeURIComponent('PKCE verification failed. Please try logging in again.')}`);
        } else {
          return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&description=${encodeURIComponent(error.message || 'Authentication failed')}`);
        }
      }
      
      if (data?.session) {
        console.log('✅ Session exchange successful');
        console.log('👤 User:', data.session.user.email);
        console.log('🕒 Session expires at:', data.session.expires_at ? new Date(data.session.expires_at * 1000) : 'unknown');
        console.log('🔄 Redirecting to:', next);
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        console.error('❌ No session returned after code exchange');
        console.error('❌ Data received:', data);
        return NextResponse.redirect(`${origin}/login?error=no_session&description=${encodeURIComponent('No session was created. Please try logging in again.')}`);
      }
    } catch (error) {
      console.error('❌ Auth callback exception:', error);
      console.error('❌ Exception details:', {
        message: (error as any)?.message,
        name: (error as any)?.name,
        stack: (error as any)?.stack
      });
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed&description=${encodeURIComponent('An unexpected error occurred during authentication')}`);
    }
  }

  // return the user to login page with error if no code
  console.log('❌ No auth code received, redirecting to login');
  return NextResponse.redirect(`${origin}/login?error=no_auth_code&description=${encodeURIComponent('No authentication code received. Please try logging in again.')}`);
} 