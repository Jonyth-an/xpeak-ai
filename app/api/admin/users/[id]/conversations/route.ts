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

    const { id: userId } = await params;
    // Fetch all conversations where the user is a participant (as student or tutor)
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        conversation_type,
        created_at,
        updated_at,
        unread_count,
        last_read_at,
        conversation_participants(
          user_id,
          role
        )
      `)
      .eq('conversation_type', 'student_tutor') // Filter for student-tutor conversations only
      .order('updated_at', { ascending: false });

    // Filter conversations where the user is a participant
    const userConversations = conversations?.filter(conversation => 
      conversation.conversation_participants?.some(p => p.user_id === userId)
    ) || [];

    console.log('🔍 [API] Total conversations found:', conversations?.length || 0);
    console.log('🔍 [API] User conversations after filter:', userConversations?.length || 0);
    if (userConversations?.[0]) {
      console.log('🔍 [API] First conversation participants:', userConversations[0].conversation_participants);
    }

    // Process conversations to get the other participant's info
    const processedConversations = await Promise.all(userConversations.map(async (conversation) => {
      const participants = conversation.conversation_participants;
      const otherParticipant = participants.find(p => p.user_id !== userId);
      let otherParticipantProfile = null;
      let otherParticipantImage = null;
      if (otherParticipant) {
        // Get basic profile info
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', otherParticipant.user_id)
          .single();
        otherParticipantProfile = profile;
        
        // If the other participant is a tutor, also get tutor profile image
        if (otherParticipant.role === 'tutor') {
          const { data: tutorProfile } = await supabase
            .from('tutor_profiles')
            .select('profile_image_url')
            .eq('user_id', otherParticipant.user_id)
            .single();
          otherParticipantImage = tutorProfile?.profile_image_url;
        }
        

      }
      
      return {
        id: conversation.id,
        type: conversation.conversation_type,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        last_message_at: conversation.updated_at, // Use updated_at as last_message_at
        unread_count: conversation.unread_count,
        last_read_at: conversation.last_read_at,
        other_participant: otherParticipant ? {
          id: otherParticipant.user_id,
          name: otherParticipantProfile?.full_name || 'Unknown User',
          avatar_url: otherParticipantImage || otherParticipantProfile?.avatar_url,
          role: otherParticipant.role
        } : null,
        user_role: participants.find(p => p.user_id === userId)?.role
      };
    }));

    // Fetch last message for each conversation
    const conversationsWithMessages = await Promise.all(
      processedConversations.map(async (conversation) => {
        const { data: lastMessage } = await supabase
          .from('general_chat_messages')
          .select('message, created_at, sender_id')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...conversation,
          last_message: lastMessage ? {
            message: lastMessage.message,
            created_at: lastMessage.created_at,
            sender_id: lastMessage.sender_id
          } : null
        };
      })
    );

    console.log('🔍 Admin conversations API - Final processed conversations:', conversationsWithMessages?.length || 0);
    console.log('🔍 Admin conversations API - Sample conversation data:', conversationsWithMessages?.[0]);
    return NextResponse.json({ conversations: conversationsWithMessages });

  } catch (error) {
    console.error('Error in admin conversations API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 