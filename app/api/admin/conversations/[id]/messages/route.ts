import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: conversationId } = await params;

    // Fetch all messages for the conversation
    const { data: messages, error } = await supabase
      .from('general_chat_messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        message,
        message_type,
        file_url,
        file_name,
        file_size,
        created_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Fetch sender profiles for all messages
    const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', senderIds);

    // Fetch tutor profile images for sender IDs
    const { data: tutorProfiles } = await supabase
      .from('tutor_profiles')
      .select('user_id, profile_image_url')
      .in('user_id', senderIds);

    // Create maps for profiles and tutor images
    const profileMap = new Map();
    const tutorImageMap = new Map();
    
    profiles?.forEach(profile => {
      profileMap.set(profile.id, profile);
    });
    
    tutorProfiles?.forEach(tutorProfile => {
      tutorImageMap.set(tutorProfile.user_id, tutorProfile.profile_image_url);
    });

    // Attach sender info to messages
    const messagesWithSenders = messages.map(message => {
      const senderProfile = profileMap.get(message.sender_id);
      const tutorImage = tutorImageMap.get(message.sender_id);
      
      return {
        ...message,
        sender_name: senderProfile?.full_name || 'Unknown User',
        sender_avatar: tutorImage || senderProfile?.avatar_url
      };
    });

    return NextResponse.json({ messages: messagesWithSenders });

  } catch (error) {
    console.error('Error in admin messages API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 