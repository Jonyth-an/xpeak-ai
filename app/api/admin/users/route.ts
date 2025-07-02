import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/adminAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const authResult = await requireAdminAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const adminUser = authResult.user;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    // If id param is present, return single user and their subscription
    if (userId) {
      // Fetch user from Supabase Auth
      const { data: users, error: usersError } = await serverSupabase.auth.admin.listUsers();
      if (usersError) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }
      const user = users.users.find(u => u.id === userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      // Fetch subscription
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });
      const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
      return NextResponse.json({ user, subscription });
    }

    // Otherwise, return paginated/filterable list
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: users, error: usersError } = await serverSupabase.auth.admin.listUsers();
    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
    let filteredUsers = users.users;
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status !== 'all') {
      switch (status) {
        case 'verified':
          filteredUsers = filteredUsers.filter(user => user.email_confirmed_at);
          break;
        case 'unverified':
          filteredUsers = filteredUsers.filter(user => !user.email_confirmed_at);
          break;
        case 'active':
          filteredUsers = filteredUsers.filter(user => user.last_sign_in_at);
          break;
        case 'inactive':
          filteredUsers = filteredUsers.filter(user => !user.last_sign_in_at);
          break;
      }
    }
    const paginatedUsers = filteredUsers.slice(from, to + 1);
    const userEmails = paginatedUsers.map(user => user.email).filter(Boolean);
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .in('user_email', userEmails);
    const enhancedUsers = paginatedUsers.map(user => ({
      ...user,
      subscription: subscriptions?.find(sub => sub.user_email === user.email) || null
    }));
    return NextResponse.json({
      users: enhancedUsers,
      total: filteredUsers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredUsers.length / limit),
      generatedAt: new Date().toISOString(),
      generatedBy: adminUser.email
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 