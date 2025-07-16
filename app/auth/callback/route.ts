import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const state = searchParams.get('state');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('🔐 Auth callback received:', {
    code: code ? 'present' : 'missing',
    error,
    errorDescription,
    state: state ? 'present' : 'missing',
    next,
    url: request.url,
    origin,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  // Check for OAuth errors first
  if (error) {
    console.error('❌ OAuth error received:', { error, errorDescription });
    return NextResponse.redirect(`${origin}/login?error=oauth_${error}`);
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
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        console.log('✅ Session exchange successful, redirecting to:', next);
        return NextResponse.redirect(`${origin}${next}`);
      } else {
        console.error('❌ Auth callback error:', error);
        return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
      }
    } catch (error) {
      console.error('❌ Auth callback exception:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
  }

  // return the user to login page with error if no code
  console.log('❌ No auth code received, redirecting to login');
  return NextResponse.redirect(`${origin}/login?error=no_auth_code`);
} 