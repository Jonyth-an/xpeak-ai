import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // 1. Get the access token from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Authorization header or Bearer token');
      return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    console.log('🔑 Received token:', token ? token.slice(0, 8) + '...' : 'none');

    // 2. Validate the token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.log('❌ Invalid token or user not found', userError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
    console.log('👤 Authenticated user:', user.email, user.id);

    // 3. Check if user is admin
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    if (rolesError) {
      console.log('❌ Error fetching user roles:', rolesError);
      return NextResponse.json({ error: 'Failed to fetch user roles' }, { status: 500 });
    }
    const isAdmin = roles?.some((r: any) => r.role === 'admin');
    if (!isAdmin) {
      console.log('❌ User is not admin:', user.email);
      return NextResponse.json({ error: 'Forbidden: Not admin' }, { status: 403 });
    }
    console.log('✅ User is admin:', user.email);

    // 4. Fetch all users (or single user if id param is present)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (userId) {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) {
        console.log('❌ Failed to fetch users:', usersError);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
      }
      const foundUser = users.users.find(u => u.id === userId);
      if (!foundUser) {
        console.log('❌ User not found:', userId);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      // Fetch subscription
      const { data: subscriptions } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_email', foundUser.email)
        .order('created_at', { ascending: false });
      const subscription = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;
      return NextResponse.json({ user: foundUser, subscription });
    }

    // Otherwise, return paginated/filterable list
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.log('❌ Failed to fetch users:', usersError);
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
    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('*')
      .in('user_email', userEmails);
    const enhancedUsers = paginatedUsers.map(user => ({
      ...user,
      subscription: subscriptions?.find(sub => sub.user_email === user.email) || null
    }));
    console.log('✅ Returning users:', enhancedUsers.length);
    return NextResponse.json({
      users: enhancedUsers,
      total: filteredUsers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredUsers.length / limit),
      generatedAt: new Date().toISOString(),
      generatedBy: user.email
    });
  } catch (err) {
    console.log('❌ Internal server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 