import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

// Only use service role key on server side
const createServerSupabase = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Server-side only');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Admin email addresses - in production, this should be stored in the database
const ADMIN_EMAILS = [
  'clshou@gmail.com', // Your email
  // Add other admin emails here
];

export interface AdminUser extends User {
  isAdmin: boolean;
}

/**
 * Check if a user has admin privileges (server-side only)
 */
export async function checkAdminStatus(user: User | null): Promise<boolean> {
  if (!user || !user.email) {
    return false;
  }

  // Check against hardcoded admin emails
  if (ADMIN_EMAILS.includes(user.email)) {
    return true;
  }

  // In the future, you can check against a database table
  // const supabase = createServerSupabase();
  // const { data: adminUser } = await supabase
  //   .from('admin_users')
  //   .select('*')
  //   .eq('user_email', user.email)
  //   .single();
  
  // return !!adminUser;

  return false;
}

/**
 * Get admin user with admin status (server-side only)
 */
export async function getAdminUser(user: User | null): Promise<AdminUser | null> {
  if (!user) {
    return null;
  }

  const isAdmin = await checkAdminStatus(user);
  
  return {
    ...user,
    isAdmin,
  };
}

/**
 * Require admin authentication for API routes
 */
export async function requireAdminAuth(request: Request): Promise<{ user: AdminUser; error?: never } | { user?: never; error: Response }> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) };
    }

    const token = authHeader.substring(7);
    const supabase = createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return { error: new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 }) };
    }

    const adminUser = await getAdminUser(user);
    if (!adminUser?.isAdmin) {
      return { error: new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403 }) };
    }

    return { user: adminUser };
  } catch (error) {
    console.error('Admin auth error:', error);
    return { error: new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 }) };
  }
}

/**
 * Simple client-side admin check (for UI purposes only)
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
} 