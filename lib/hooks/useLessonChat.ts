import { useState, useCallback, useEffect, useRef } from 'react'
import { chatService, ChatMessage, ChatMessageInput } from '../services/chatService'
import { useAuth } from '../AuthContext'

interface UseLessonChatProps {
  lessonId: string
  userId: string
  userType: 'student' | 'tutor'
  userName: string
}

interface UseLessonChatReturn {
  messages: ChatMessage[]
  sendMessage: (message: string) => Promise<void>
  sendFileMessage: (file: File) => Promise<void>
  isLoading: boolean
  error: string | null
  isConnected: boolean
  isUploading: boolean
  uploadProgress: number
}

export function useLessonChat({ lessonId, userId, userType, userName }: UseLessonChatProps): UseLessonChatReturn {
  const { user, session, loading: authLoading } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const channelRef = useRef<any>(null)

  // Load chat history
  const loadChatHistory = useCallback(async () => {
    // Don't load chat history if user is not authenticated
    if (!user || !session) {
      console.log('User not authenticated, skipping chat history load')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Loading chat history for authenticated user:', user.email)
      
      const history = await chatService.getChatHistory(lessonId, 100)
      
      // Enrich messages with sender information
      const enrichedMessages = await Promise.all(
        history.map(async (message) => {
          const profile = await chatService.getSenderProfile(message.sender_id)
          return {
            ...message,
            sender_name: profile?.name || 'User',
            sender_initials: profile?.initials || 'U'
          }
        })
      )
      
      setMessages(enrichedMessages)
    } catch (err) {
      console.error('Failed to load chat history:', err)
      setError('Failed to load chat history')
    } finally {
      setIsLoading(false)
    }
  }, [lessonId, user, session])

  // Subscribe to real-time updates
  const subscribeToChat = useCallback(async () => {
    // Don't subscribe if user is not authenticated
    if (!user || !session) {
      console.log('User not authenticated, skipping chat subscription')
      return
    }

    try {
      console.log('Subscribing to chat for authenticated user:', user.email)
      
      const channel = await chatService.subscribeToLessonChat(
        lessonId,
        async (newMessage) => {
          // Enrich the new message with sender information
          const profile = await chatService.getSenderProfile(newMessage.sender_id)
          const enrichedMessage = {
            ...newMessage,
            sender_name: profile?.name || 'User',
            sender_initials: profile?.initials || 'U'
          }
          
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => msg.id === enrichedMessage.id)
            if (exists) {
              return prev
            }
            return [...prev, enrichedMessage]
          })
        },
        (err) => {
          console.error('Chat subscription error:', err)
          setError('Lost connection to chat')
          setIsConnected(false)
        }
      )
      
      channelRef.current = channel
      setIsConnected(true)
      setError(null)
    } catch (err) {
      console.error('Failed to subscribe to chat:', err)
      setError('Failed to connect to chat')
      setIsConnected(false)
    }
  }, [lessonId, user, session])

  // Send a message
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return

    // Don't send message if user is not authenticated
    if (!user || !session) {
      console.error('Cannot send message: user not authenticated')
      setError('You must be logged in to send messages')
      return
    }

    try {
      const messageData: ChatMessageInput = {
        lesson_id: lessonId,
        sender_id: userId,
        sender_name: userName,
        message: messageText.trim(),
        message_type: 'text'
      }

      const sentMessage = await chatService.sendMessage(messageData)
      
      if (!sentMessage) {
        throw new Error('Failed to send message')
      }

      // The message will be added to the list via the real-time subscription
      // so we don't need to manually add it here
    } catch (err) {
      console.error('Failed to send message:', err)
      setError('Failed to send message')
    }
  }, [lessonId, userId, userName, user, session])

  // Send a file message
  const sendFileMessage = useCallback(async (file: File) => {
    // Don't send file if user is not authenticated
    if (!user || !session) {
      console.error('Cannot send file: user not authenticated')
      setError('You must be logged in to send files')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setError(null)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const sentMessage = await chatService.sendFileMessage(lessonId, userId, userName, file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (!sentMessage) {
        throw new Error('Failed to send file message')
      }

      // The message will be added to the list via the real-time subscription
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)

    } catch (err) {
      console.error('Failed to send file message:', err)
      setError('Failed to send file message')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [lessonId, userId, userName, user, session])

  // Initialize chat when user is authenticated
  useEffect(() => {
    if (authLoading) {
      // Still loading auth, wait
      return
    }

    if (user && session) {
      // User is authenticated, initialize chat
      loadChatHistory()
      subscribeToChat()
    } else {
      // User is not authenticated, set loading to false
      setIsLoading(false)
      setError('You must be logged in to access chat')
    }

    return () => {
      // Cleanup subscription
      if (channelRef.current) {
        chatService.unsubscribeFromLessonChat(lessonId)
        channelRef.current = null
      }
    }
  }, [lessonId, loadChatHistory, subscribeToChat, user, session, authLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        chatService.unsubscribeFromLessonChat(lessonId)
        channelRef.current = null
      }
    }
  }, [lessonId])

  return {
    messages,
    sendMessage,
    sendFileMessage,
    isLoading: authLoading || isLoading,
    error,
    isConnected,
    isUploading,
    uploadProgress
  }
} 