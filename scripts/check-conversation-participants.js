const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConversationParticipants() {
  const conversationId = '61f393a8-cbfb-4f11-9ed9-819439cddd77';
  
  console.log('🔍 Checking conversation participants for:', conversationId);
  
  const { data: participants, error } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('📊 Found participants:', participants);
  console.log('📊 Participant count:', participants?.length || 0);
  
  if (participants?.length === 1) {
    console.log('❌ ISSUE: Only one participant found! Should have 2 (student + tutor)');
    console.log('🔧 Need to add the missing tutor participant');
  } else if (participants?.length === 2) {
    console.log('✅ Correct: Two participants found');
  }
  
  // Also check the conversation details
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();
    
  if (!convError && conversation) {
    console.log('📊 Conversation details:', conversation);
  }
}

checkConversationParticipants(); 