import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL('/login?error=auth_callback_failed', requestUrl.origin));
      }

      if (data.session) {
        console.log('OAuth callback successful for user:', data.user?.email);
        // Redirect to dashboard or home page after successful authentication
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      return NextResponse.redirect(new URL('/login?error=auth_callback_failed', requestUrl.origin));
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
} 