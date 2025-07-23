import { useState, useCallback, useEffect, useRef } from 'react'
import { chatService, ChatMessage, ChatMessageInput } from '../services/chatService'
import { useAuth } from '../AuthContext'

interface UseGeneralChatProps {
  conversationId: string
  userId: string
  userName: string
}

interface UseGeneralChatReturn {
  messages: ChatMessage[]
  sendMessage: (messageText: string) => Promise<void>
  sendFileMessage: (file: File) => Promise<void>
  isLoading: boolean
  error: string | null
  isConnected: boolean
  isUploading: boolean
  uploadProgress: number
}

export function useGeneralChat({ conversationId, userId, userName }: UseGeneralChatProps): UseGeneralChatReturn {
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
      
      console.log('Loading general chat history for authenticated user:', user.email)
      
      const history = await chatService.getGeneralChatHistory(conversationId, 100)
      
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
      console.error('Failed to load general chat history:', err)
      setError('Failed to load chat history')
    } finally {
      setIsLoading(false)
    }
  }, [conversationId, user, session])

  // Subscribe to real-time updates
  const subscribeToChat = useCallback(async () => {
    // Don't subscribe if user is not authenticated
    if (!user || !session) {
      console.log('User not authenticated, skipping chat subscription')
      return
    }

    try {
      console.log('Subscribing to general chat for authenticated user:', user.email)
      
      const channel = await chatService.subscribeToGeneralChat(
        conversationId,
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
          console.error('General chat subscription error:', err)
          setError('Lost connection to chat')
          setIsConnected(false)
        }
      )
      
      channelRef.current = channel
      setIsConnected(true)
      setError(null)
    } catch (err) {
      console.error('Failed to subscribe to general chat:', err)
      setError('Failed to connect to chat')
      setIsConnected(false)
    }
  }, [conversationId, user, session])

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
        conversation_id: conversationId,
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
  }, [conversationId, userId, userName, user, session])

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

      const sentMessage = await chatService.sendGeneralFileMessage(conversationId, userId, userName, file)
      
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
  }, [conversationId, userId, userName, user, session])

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
        chatService.unsubscribeFromGeneralChat(conversationId)
        channelRef.current = null
      }
    }
  }, [conversationId, loadChatHistory, subscribeToChat, user, session, authLoading])

  return {
    messages,
    sendMessage,
    sendFileMessage,
    isLoading,
    error,
    isConnected,
    isUploading,
    uploadProgress
  }
} 