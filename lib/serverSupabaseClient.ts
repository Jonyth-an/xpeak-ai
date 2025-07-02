import { createClient } from '@supabase/supabase-js';

/**
 * Shared Server-Side Supabase Client
 * 
 * This client is configured for server-side operations with:
 * - Service role key for full database access
 * - No session persistence (not needed on server)
 * - No auto token refresh (handled manually)
 * 
 * IMPORTANT: This should ONLY be used in:
 * - API routes (/app/api/**)
 * - Server components
 * - Server-side utilities
 * 
 * NEVER use this in client-side code or components!
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

export const serverSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Helper function to validate user tokens on the server side
 */
export async function validateUserToken(token: string) {
  try {
    const { data: { user }, error } = await serverSupabase.auth.getUser(token);
    
    if (error) {
      console.error('Token validation error:', error);
      return { user: null, error };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Unexpected error during token validation:', error);
    return { user: null, error };
  }
}

/**
 * Helper function to get user from Authorization header
 */
export async function getUserFromAuthHeader(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return await validateUserToken(token);
}

/**
 * Helper function to check if user is admin
 */
export async function isUserAdmin(userId: string) {
  try {
    const { data, error } = await serverSupabase.auth.admin.getUserById(userId);
    const user = data?.user;
    if (error || !user) {
      return false;
    }
    // Check if user has admin role in user_metadata
    return user.user_metadata?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Export the client as default for backward compatibility
export default serverSupabase; 