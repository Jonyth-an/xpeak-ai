import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

export interface ChatMessage {
  id: string
  lesson_id?: string
  conversation_id?: string
  sender_id: string
  sender_name: string
  message: string
  message_type: 'text' | 'system' | 'file'
  file_url?: string
  file_name?: string
  file_size?: number
  created_at: string
  updated_at: string
  sender_initials?: string
}

export interface ChatMessageInput {
  lesson_id?: string
  conversation_id?: string
  sender_id: string
  sender_name: string
  message: string
  message_type?: 'text' | 'system' | 'file'
  file_url?: string
  file_name?: string
  file_size?: number
}

export interface Conversation {
  id: string
  title?: string
  conversation_type: 'student_tutor' | 'tutor_tutor' | 'support' | 'general'
  created_by: string
  created_at: string
  updated_at: string
  participants?: ConversationParticipant[]
  last_message?: ChatMessage
  unread_count?: number
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  role: 'student' | 'tutor' | 'admin'
  joined_at: string
  user?: {
    id: string
    full_name?: string
    email?: string
    avatar_url?: string
  }
}

export interface CreateConversationInput {
  title?: string
  conversation_type: 'student_tutor' | 'tutor_tutor' | 'support' | 'general'
  participants: string[]
  participant_roles: ('student' | 'tutor' | 'admin')[]
}

class ChatService {
  private channels: Map<string, RealtimeChannel> = new Map()

  /**
   * Subscribe to real-time chat messages for a lesson
   */
  async subscribeToLessonChat(
    lessonId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void
  ): Promise<RealtimeChannel> {
    // Unsubscribe from existing channel if it exists
    this.unsubscribeFromLessonChat(lessonId)

    const channel = supabase
      .channel(`lesson-chat-${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lesson_chat_messages',
          filter: `lesson_id=eq.${lessonId}`
        },
        (payload) => {
          const message = payload.new as ChatMessage
          onMessage(message)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lesson_chat_messages',
          filter: `lesson_id=eq.${lessonId}`
        },
        (payload) => {
          const message = payload.new as ChatMessage
          onMessage(message)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'lesson_chat_messages',
          filter: `lesson_id=eq.${lessonId}`
        },
        (payload) => {
          // Handle message deletion if needed
          console.log('Message deleted:', payload.old)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to lesson chat: ${lessonId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to lesson chat: ${lessonId}`)
          onError?.(new Error('Failed to subscribe to chat'))
        }
      })

    this.channels.set(lessonId, channel)
    return channel
  }

  /**
   * Subscribe to real-time chat messages for a general conversation
   */
  async subscribeToGeneralChat(
    conversationId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: any) => void
  ): Promise<RealtimeChannel> {
    // Unsubscribe from existing channel if it exists
    this.unsubscribeFromGeneralChat(conversationId)

    const channel = supabase
      .channel(`general-chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'general_chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const message = payload.new as ChatMessage
          onMessage(message)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'general_chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const message = payload.new as ChatMessage
          onMessage(message)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'general_chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Handle message deletion if needed
          console.log('Message deleted:', payload.old)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to general chat: ${conversationId}`)
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to general chat: ${conversationId}`)
          onError?.(new Error('Failed to subscribe to chat'))
        }
      })

    this.channels.set(`general-${conversationId}`, channel)
    return channel
  }

  /**
   * Unsubscribe from lesson chat
   */
  unsubscribeFromLessonChat(lessonId: string) {
    const channel = this.channels.get(lessonId)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(lessonId)
    }
  }

  /**
   * Unsubscribe from general chat
   */
  unsubscribeFromGeneralChat(conversationId: string) {
    const channel = this.channels.get(`general-${conversationId}`)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(`general-${conversationId}`)
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(messageData: ChatMessageInput): Promise<ChatMessage | null> {
    try {
      console.log('Sending message with data:', messageData)
      
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication error')
      }
      
      if (!session) {
        console.error('No active session')
        throw new Error('User not authenticated')
      }
      
      console.log('User authenticated, sending message...')
      
      // Determine which table to insert into
      const table = messageData.lesson_id ? 'lesson_chat_messages' : 'general_chat_messages'
      
      // Filter out sender_name for general_chat_messages table since it doesn't have this column
      const insertData = table === 'general_chat_messages' 
        ? { ...messageData, sender_name: undefined }
        : messageData
      
      const { data, error } = await supabase
        .from(table)
        .insert([insertData])
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log('Message sent successfully:', data)
      return data
    } catch (error) {
      console.error('Failed to send message:', error)
      console.error('Error type:', typeof error)
      console.error('Error stringified:', JSON.stringify(error, null, 2))
      return null
    }
  }

  /**
   * Get chat history for a lesson
   */
  async getChatHistory(lessonId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      console.log('Fetching chat history for lesson:', lessonId)
      
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication error')
      }
      
      if (!session) {
        console.error('No active session')
        throw new Error('User not authenticated')
      }
      
      console.log('User authenticated, fetching chat history...')
      
      const { data, error } = await supabase
        .from('lesson_chat_messages')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching chat history:', error)
        throw error
      }

      console.log('Chat history fetched successfully:', data?.length, 'messages')
      return data || []
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
      return []
    }
  }

  /**
   * Get chat history for a general conversation
   */
  async getGeneralChatHistory(conversationId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      console.log('Fetching general chat history for conversation:', conversationId)
      
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication error')
      }
      
      if (!session) {
        console.error('No active session')
        throw new Error('User not authenticated')
      }
      
      console.log('User authenticated, fetching general chat history...')
      
      const { data, error } = await supabase
        .from('general_chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Error fetching general chat history:', error)
        throw error
      }

      console.log('General chat history fetched successfully:', data?.length, 'messages')
      return data || []
    } catch (error) {
      console.error('Failed to fetch general chat history:', error)
      return []
    }
  }

  /**
   * Find existing conversation between two users
   */
  async findExistingConversation(userId1: string, userId2: string, conversationType: string = 'student_tutor'): Promise<Conversation | null> {
    try {
      console.log('🔍 Finding existing conversation between users:', userId1, userId2, 'type:', conversationType)
      
      // Get all conversations where user1 is a participant
      const { data: user1Conversations, error: user1Error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          conversation_type,
          created_by,
          created_at,
          updated_at,
          participants:conversation_participants(
            id,
            conversation_id,
            user_id,
            role,
            joined_at
          )
        `)
        .eq('conversation_type', conversationType)
        .eq('conversation_participants.user_id', userId1)

      if (user1Error) {
        console.error('❌ Error fetching user1 conversations:', user1Error)
        return null
      }

      console.log('📊 Found conversations for user1:', user1Conversations?.length || 0)
      if (user1Conversations && user1Conversations.length > 0) {
        console.log('📋 User1 conversations:', user1Conversations.map(c => ({
          id: c.id,
          title: c.title,
          participants: c.participants?.map(p => ({ user_id: p.user_id, role: p.role }))
        })))
      }

      // Find conversation that also has user2 as participant
      const existingConversation = user1Conversations?.find(conv => 
        conv.participants?.some(p => p.user_id === userId2)
      )

      if (existingConversation) {
        console.log('✅ Found existing conversation:', existingConversation.id)
        return existingConversation
      }

      // Also check from user2's perspective to be thorough
      const { data: user2Conversations, error: user2Error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          conversation_type,
          created_by,
          created_at,
          updated_at,
          participants:conversation_participants(
            id,
            conversation_id,
            user_id,
            role,
            joined_at
          )
        `)
        .eq('conversation_type', conversationType)
        .eq('conversation_participants.user_id', userId2)

      if (user2Error) {
        console.error('❌ Error fetching user2 conversations:', user2Error)
        return null
      }

      console.log('📊 Found conversations for user2:', user2Conversations?.length || 0)
      if (user2Conversations && user2Conversations.length > 0) {
        console.log('📋 User2 conversations:', user2Conversations.map(c => ({
          id: c.id,
          title: c.title,
          participants: c.participants?.map(p => ({ user_id: p.user_id, role: p.role }))
        })))
      }

      // Find conversation that also has user1 as participant
      const existingConversationFromUser2 = user2Conversations?.find(conv => 
        conv.participants?.some(p => p.user_id === userId1)
      )

      if (existingConversationFromUser2) {
        console.log('✅ Found existing conversation from user2 perspective:', existingConversationFromUser2.id)
        return existingConversationFromUser2
      }

      console.log('❌ No existing conversation found')
      return null
    } catch (error) {
      console.error('❌ Error finding existing conversation:', error)
      return null
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(input: CreateConversationInput, supabaseClient?: any): Promise<Conversation | null> {
    try {
      console.log('Creating conversation with input:', input)
      
      // Use provided client or fall back to default
      const client = supabaseClient || supabase
      
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await client.auth.getSession()
      
      if (sessionError || !session) {
        console.error('Authentication error:', sessionError)
        throw new Error('User not authenticated')
      }
      
      console.log('User authenticated, creating conversation...')
      
      // Start a transaction
      const { data: conversation, error: conversationError } = await client
        .from('conversations')
        .insert([{
          title: input.title,
          conversation_type: input.conversation_type,
          created_by: session.user.id
        }])
        .select()
        .single()

      if (conversationError) {
        console.error('Error creating conversation:', conversationError)
        throw conversationError
      }

      console.log('Conversation created, adding participants...')

      // Prepare participants list - filter out current user from input to avoid duplicates
      const otherParticipants = input.participants.filter(userId => userId !== session.user.id)
      
      const allParticipants = [
        {
          conversation_id: conversation.id,
          user_id: session.user.id,
          role: 'student' as const // Default role for conversation creator
        },
        ...otherParticipants.map((userId, index) => ({
          conversation_id: conversation.id,
          user_id: userId,
          role: input.participant_roles[index] || 'student'
        }))
      ]

      console.log('Adding participants:', allParticipants)

      const { error: participantsError } = await client
        .from('conversation_participants')
        .insert(allParticipants)

      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        // Check for specific constraint violations
        // @ts-ignore
        if (participantsError.code === 'P0001' && participantsError.message.includes('Student-tutor conversations must have exactly')) {
          const err = new Error('Cannot create conversation: Student and tutor must be different users')
          // @ts-ignore
          err.code = 'STUDENT_TUTOR_CONSTRAINT'
          throw err
        }
        // @ts-ignore
        if (participantsError.code) {
          const err = new Error(participantsError.message || 'Failed to add participants')
          // @ts-ignore
          err.code = participantsError.code
          throw err
        }
        throw new Error(participantsError.message || 'Failed to add participants')
      }

      console.log('Conversation created successfully:', conversation)
      return conversation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      // Always throw, never return null
      if (error instanceof Error) throw error
      throw new Error('Failed to create conversation: Unknown error')
    }
  }

  /**
   * Create a new conversation with a specific user
   */
  async createConversationWithUser(input: CreateConversationInput & { userId: string }, supabaseClient?: any): Promise<Conversation | null> {
    try {
      console.log('Creating conversation with user ID:', input.userId)
      
      // Use provided client or fall back to default
      const client = supabaseClient || supabase
      
      console.log('Creating conversation...')
      
      // Start a transaction
      const { data: conversation, error: conversationError } = await client
        .from('conversations')
        .insert([{
          title: input.title,
          conversation_type: input.conversation_type,
          created_by: input.userId
        }])
        .select()
        .single()

      if (conversationError) {
        console.error('Error creating conversation:', conversationError)
        throw conversationError
      }

      console.log('Conversation created, adding participants...')

      // Prepare participants list for student-tutor conversations
      let allParticipants
      
      if (input.conversation_type === 'student_tutor') {
        // For student-tutor conversations, ensure we have exactly one student and one tutor
        const studentId = input.userId
        const tutorId = input.participants[0] // The tutor should be the first (and only) participant
        
        allParticipants = [
          {
            conversation_id: conversation.id,
            user_id: studentId,
            role: 'student' as const
          },
          {
            conversation_id: conversation.id,
            user_id: tutorId,
            role: 'tutor' as const
          }
        ]
      } else {
        // For other conversation types, use the original logic
        const otherParticipants = input.participants.filter(userId => userId !== input.userId)
        
        allParticipants = [
          {
            conversation_id: conversation.id,
            user_id: input.userId,
            role: 'student' as const // Default role for conversation creator
          },
          ...otherParticipants.map((userId, index) => ({
            conversation_id: conversation.id,
            user_id: userId,
            role: input.participant_roles[index] || 'student'
          }))
        ]
      }

      console.log('Adding participants:', allParticipants)

      const { error: participantsError } = await client
        .from('conversation_participants')
        .insert(allParticipants)

      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        
        // Check for specific constraint violations
        // @ts-ignore
        if (participantsError.code === 'P0001' && participantsError.message.includes('Student-tutor conversations must have exactly')) {
          throw new Error('Cannot create conversation: Student and tutor must be different users')
        }
        
        throw participantsError
      }

      console.log('Conversation created successfully:', conversation)
      return conversation
    } catch (error) {
      console.error('Failed to create conversation:', error)
      
      // Return a more specific error instead of null
      if (error instanceof Error) {
        throw error
      }
      
      throw new Error('Failed to create conversation: Unknown error')
    }
  }

  /**
   * Get conversations for a user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log('Fetching conversations for user:', userId)
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(
            *,
            user:user_id(
              id,
              full_name,
              email,
              avatar_url
            )
          ),
          last_message:general_chat_messages(
            id,
            message,
            created_at,
            sender_id
          )
        `)
        .eq('conversation_participants.user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching conversations:', error)
        if (error.details || error.message || error.code) {
          console.error('Error details:', {
            details: error.details,
            message: error.message,
            code: error.code
          })
        }
        return []
      }

      console.log('Conversations fetched successfully:', data?.length, 'conversations')
      return data || []
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      return []
    }
  }

  /**
   * Join a conversation
   */
  async joinConversation(conversationId: string, userId: string, role: 'student' | 'tutor' | 'admin'): Promise<boolean> {
    try {
      console.log('Joining conversation:', conversationId, 'user:', userId, 'role:', role)
      
      const { error } = await supabase
        .from('conversation_participants')
        .insert([{
          conversation_id: conversationId,
          user_id: userId,
          role
        }])

      if (error) {
        console.error('Error joining conversation:', error)
        return false
      }

      console.log('Successfully joined conversation')
      return true
    } catch (error) {
      console.error('Failed to join conversation:', error)
      return false
    }
  }

  /**
   * Leave a conversation
   */
  async leaveConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      console.log('Leaving conversation:', conversationId, 'user:', userId)
      
      const { error } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error leaving conversation:', error)
        return false
      }

      console.log('Successfully left conversation')
      return true
    } catch (error) {
      console.error('Failed to leave conversation:', error)
      return false
    }
  }

  /**
   * Get sender profile information
   */
  async getSenderProfile(senderId: string): Promise<{ name: string; initials: string } | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', senderId)
        .single()

      if (error || !data) {
        return null
      }

      const name = data.full_name || 'Unknown User'
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase()

      return {
        name,
        initials: initials.substring(0, 2)
      }
    } catch (error) {
      console.error('Error fetching sender profile:', error)
      return null
    }
  }

  /**
   * Upload a file for chat
   */
  private async uploadFile(file: File, contextId: string): Promise<{ success: boolean; file?: any; error?: string }> {
    try {
      const fileName = `${contextId}/${Date.now()}-${file.name}`
      
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('File upload error:', error)
        return { success: false, error: error.message }
      }

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName)

      return {
        success: true,
        file: {
          url: urlData.publicUrl,
          name: file.name,
          size: file.size
        }
      }
    } catch (error) {
      console.error('File upload failed:', error)
      return { success: false, error: 'File upload failed' }
    }
  }

  /**
   * Send a file message for lesson chat
   */
  async sendFileMessage(
    lessonId: string,
    senderId: string,
    senderName: string,
    file: File
  ): Promise<ChatMessage | null> {
    try {
      console.log('Starting file upload for lesson:', file.name, 'size:', file.size)
      
      // Upload the file first
      const uploadResult = await this.uploadFile(file, lessonId)
      
      console.log('Upload result:', uploadResult)
      
      if (!uploadResult.success || !uploadResult.file) {
        console.error('Upload failed:', uploadResult.error)
        throw new Error(uploadResult.error || 'File upload failed')
      }

      console.log('File uploaded successfully, sending message...')

      // Send the file message
      const messageData: ChatMessageInput = {
        lesson_id: lessonId,
        sender_id: senderId,
        sender_name: senderName,
        message: `Shared file: ${file.name}`,
        message_type: 'file',
        file_url: uploadResult.file.url,
        file_name: uploadResult.file.name,
        file_size: uploadResult.file.size
      }

      console.log('Message data to send:', messageData)

      const result = await this.sendMessage(messageData)
      
      console.log('Send message result:', result)
      
      return result
    } catch (error) {
      console.error('Failed to send file message:', error)
      return null
    }
  }

  /**
   * Send a file message for general chat
   */
  async sendGeneralFileMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    file: File
  ): Promise<ChatMessage | null> {
    try {
      console.log('Starting file upload for conversation:', file.name, 'size:', file.size)
      
      // Upload the file first
      const uploadResult = await this.uploadFile(file, conversationId)
      
      console.log('Upload result:', uploadResult)
      
      if (!uploadResult.success || !uploadResult.file) {
        console.error('Upload failed:', uploadResult.error)
        throw new Error(uploadResult.error || 'File upload failed')
      }

      console.log('File uploaded successfully, sending message...')

      // Send the file message
      const messageData: ChatMessageInput = {
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName,
        message: `Shared file: ${file.name}`,
        message_type: 'file',
        file_url: uploadResult.file.url,
        file_name: uploadResult.file.name,
        file_size: uploadResult.file.size
      }

      console.log('Message data to send:', messageData)

      const result = await this.sendMessage(messageData)
      
      console.log('Send message result:', result)
      
      return result
    } catch (error) {
      console.error('Failed to send general file message:', error)
      return null
    }
  }
}

export const chatService = new ChatService() 