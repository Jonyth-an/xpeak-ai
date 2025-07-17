// PKCE (Proof Key for Code Exchange) utilities
// This provides a fallback implementation if Supabase's built-in PKCE doesn't work

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

function base64URLEncode(buffer: Uint8Array): string {
  const bytes = Array.from(buffer);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function storePKCEVerifier(verifier: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('pkce_verifier', verifier);
  }
}

export function getPKCEVerifier(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('pkce_verifier');
  }
  return null;
}

export function clearPKCEVerifier(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('pkce_verifier');
  }
}

// Enhanced OAuth function with PKCE
export async function signInWithOAuthWithPKCE(
  supabase: any,
  provider: string,
  redirectTo: string
) {
  try {
    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store verifier for later use
    storePKCEVerifier(codeVerifier);
    
    // Call Supabase OAuth with PKCE parameters
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          response_type: 'code',
        },
      },
    });
    
    return { data, error };
  } catch (err) {
    console.error('PKCE OAuth error:', err);
    return { data: null, error: err };
  }
} 