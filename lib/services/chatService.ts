import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../supabaseClient'

export interface ChatMessage {
  id: string
  lesson_id: string
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
  lesson_id: string
  sender_id: string
  sender_name: string
  message: string
  message_type?: 'text' | 'system' | 'file'
  file_url?: string
  file_name?: string
  file_size?: number
}

export interface FileUploadResponse {
  success: boolean
  file?: {
    url: string
    name: string
    size: number
    type: string
  }
  error?: string
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
   * Unsubscribe from lesson chat
   */
  unsubscribeFromLessonChat(lessonId: string): void {
    const channel = this.channels.get(lessonId)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(lessonId)
      console.log(`Unsubscribed from lesson chat: ${lessonId}`)
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
      
      const { data, error } = await supabase
        .from('lesson_chat_messages')
        .insert([messageData])
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        throw error
      }

      console.log('Message sent successfully:', data)
      return data
    } catch (error) {
      console.error('Failed to send message:', error)
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
   * Update a chat message
   */
  async updateMessage(messageId: string, message: string): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('lesson_chat_messages')
        .update({ message })
        .eq('id', messageId)
        .select()
        .single()

      if (error) {
        console.error('Error updating message:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to update message:', error)
      return null
    }
  }

  /**
   * Delete a chat message
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('lesson_chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) {
        console.error('Error deleting message:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Failed to delete message:', error)
      return false
    }
  }

  /**
   * Upload a file and return file information
   */
  async uploadFile(file: File, lessonId: string): Promise<FileUploadResponse> {
    try {
      console.log('Uploading file:', file.name, 'to lesson:', lessonId)
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('lessonId', lessonId)

      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      
      console.log('Auth token available:', !!token)

      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Upload response status:', response.status)

      const result = await response.json()
      console.log('Upload response body:', result)

      if (!response.ok) {
        console.error('Upload failed with status:', response.status, 'error:', result.error)
        return {
          success: false,
          error: result.error || 'Upload failed'
        }
      }

      return result
    } catch (error) {
      console.error('File upload error:', error)
      return {
        success: false,
        error: 'Upload failed'
      }
    }
  }

  /**
   * Send a file message
   */
  async sendFileMessage(
    lessonId: string,
    senderId: string,
    senderName: string,
    file: File
  ): Promise<ChatMessage | null> {
    try {
      console.log('Starting file upload for:', file.name, 'size:', file.size)
      
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
   * Get user profile information for a message sender
   */
  async getSenderProfile(senderId: string): Promise<{ name: string; initials: string } | null> {
    try {
      // Try to get tutor profile first
      const { data: tutorData } = await supabase
        .from('tutor_profiles')
        .select('display_name')
        .eq('user_id', senderId)
        .single()

      if (tutorData) {
        const name = tutorData.display_name || 'Tutor'
        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        return { name, initials }
      }

      // If not a tutor, get user profile
      const { data: userData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', senderId)
        .single()

      if (userData) {
        const name = userData.full_name || userData.email?.split('@')[0] || 'User'
        const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        return { name, initials }
      }

      return null
    } catch (error) {
      console.error('Error fetching sender profile:', error)
      return null
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    this.channels.forEach((channel, lessonId) => {
      this.unsubscribeFromLessonChat(lessonId)
    })
  }
}

export const chatService = new ChatService() 