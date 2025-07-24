'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Send, Paperclip, ChevronDown, File, Download, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Avatar from '@/app/components/ui/Avatar'
import { chatService, ChatMessage } from '@/lib/services/chatService'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabaseClient'

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  tutorId: string
  tutorName: string
  tutorImage?: string
  conversationId?: string
  isStudentView?: boolean // Add this to distinguish student vs tutor view
}

interface Message {
  id: string
  sender_id: string
  message: string
  created_at: string
  sender_name: string
  message_type?: string
  file_url?: string
  file_name?: string
  file_size?: number
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed'
]

export function ChatWindow({ 
  isOpen, 
  onClose, 
  tutorId, 
  tutorName, 
  tutorImage,
  conversationId,
  isStudentView = false
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, session } = useAuth()
  const processedMessageIds = useRef<Set<string>>(new Set())

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversation and messages
  useEffect(() => {
    if (!user || !session || !isOpen) return

    console.log('=== LOAD CONVERSATION DEBUG START ===')
    console.log('User:', user?.id)
    console.log('Session:', !!session)
    console.log('Is Open:', isOpen)
    console.log('Current Conversation ID:', currentConversationId)
    console.log('Tutor ID:', tutorId)
    console.log('Conversation ID prop:', conversationId)

    const loadConversation = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // If we have a conversationId prop, use it directly
        if (conversationId) {
          console.log('Using provided conversation ID:', conversationId)
          setCurrentConversationId(conversationId)
          await loadMessages(conversationId)
          return
        }

        // If we don't have a conversation ID, create or find one
        if (!currentConversationId) {
          console.log('Creating/finding conversation for tutor:', tutorId)
          const requestBody = { tutorId }
          console.log('Direct conversation request body:', requestBody)
          
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
          
          let response
          try {
            response = await fetch('/api/conversations/direct', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`
              },
              body: JSON.stringify(requestBody),
              signal: controller.signal
            })
            clearTimeout(timeoutId)
          } catch (error) {
            clearTimeout(timeoutId)
            if (error instanceof Error && error.name === 'AbortError') {
              throw new Error('Request timeout - please try again')
            }
            throw error
          }

          if (!response.ok) {
            const errorText = await response.text()
            console.error('Failed to create/find conversation:', response.status, errorText)
            throw new Error(`Failed to create conversation: ${errorText}`)
          }

          const data = await response.json()
          console.log('Conversation created/found:', data)
          
          if (data.conversation?.id) {
            setCurrentConversationId(data.conversation.id)
            await loadMessages(data.conversation.id)
          } else {
            throw new Error('No conversation ID received')
          }
        } else {
          // We have a conversation ID, just load messages
          await loadMessages(currentConversationId)
        }
      } catch (err) {
        console.error('Error loading conversation or messages:', err)
        setError(err instanceof Error ? err.message : 'Failed to load chat history.')
      } finally {
        setIsLoading(false)
      }
    }

    loadConversation()
    // Clear processed message IDs when conversation changes
    processedMessageIds.current.clear()
    setMessages([]) // Clear messages when conversation changes
  }, [user, session, isOpen, conversationId, tutorId])

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!currentConversationId || !isOpen) return

            console.log('Setting up real-time subscription for conversation:', currentConversationId)
        console.log('🔄 User ID:', user?.id)
        console.log('🔄 Is Open:', isOpen)
        
        const subscription = supabase
      .channel(`chat-${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'general_chat_messages',
          filter: `conversation_id=eq.${currentConversationId}`
        },
                (payload) => {
          console.log('🔄 Real-time message received:', payload)
          console.log('🔄 Current user ID:', user?.id)
          console.log('🔄 Message sender ID:', payload.new?.sender_id)
          console.log('🔄 Conversation ID:', currentConversationId)
          const newMessage = payload.new as any
          
          // Add the new message to the messages list
          setMessages(prev => {
            // Check if we've already processed this message ID
            if (processedMessageIds.current.has(newMessage.id)) {
              console.log('Message ID already processed, skipping:', newMessage.id)
              return prev
            }
            
            // Check if message already exists in the current messages
            const exists = prev.some(msg => msg.id === newMessage.id)
            if (exists) {
              console.log('Message already exists in list, skipping:', newMessage.id)
              return prev
            }
            
            // For same-user scenarios, also check content and timestamp to prevent duplicates
            const duplicateContent = prev.some(msg => 
              msg.message === newMessage.message && 
              msg.sender_id === newMessage.sender_id &&
              Math.abs(new Date(msg.created_at).getTime() - new Date(newMessage.created_at).getTime()) < 2000 // Within 2 seconds
            )
            
            if (duplicateContent) {
              console.log('Duplicate content detected for same user, skipping:', newMessage.message)
              return prev
            }
            
            // Add to processed set and add to messages
            processedMessageIds.current.add(newMessage.id)
            console.log('Adding new message to chat:', newMessage)
            return [...prev, {
              id: newMessage.id,
              sender_id: newMessage.sender_id,
              message: newMessage.message,
              created_at: newMessage.created_at,
              sender_name: newMessage.sender_name || 'Unknown'
            }]
          })
        }
      )
      .subscribe()

    // Cleanup subscription on unmount or conversation change
    return () => {
      console.log('Cleaning up real-time subscription for conversation:', currentConversationId)
      subscription.unsubscribe()
      // Clear processed message IDs when conversation changes
      processedMessageIds.current.clear()
    }
  }, [currentConversationId, isOpen])

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    if (!user || !session) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages?limit=50`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load messages')
      }

      const data = await response.json()
      console.log('Loaded messages:', data.messages?.length || 0)
      
      // Debug: Log file messages
      const fileMessages = data.messages?.filter((msg: Message) => msg.message_type === 'file')
      console.log('File messages found:', fileMessages?.length || 0)
      if (fileMessages && fileMessages.length > 0) {
        console.log('File message details:', fileMessages.map((msg: Message) => ({
          id: msg.id,
          message_type: msg.message_type,
          file_url: msg.file_url,
          file_name: msg.file_name,
          file_size: msg.file_size
        })))
      }
      
      // Clear processed message IDs for new conversation
      processedMessageIds.current.clear()
      
      // Add all loaded message IDs to processed set
      data.messages?.forEach((msg: Message) => {
        processedMessageIds.current.add(msg.id)
      })
      
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Error loading messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !session || !currentConversationId) return

    const messageText = newMessage.trim()
    setNewMessage('')

    // Add message optimistically
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      message: messageText,
      created_at: new Date().toISOString(),
      sender_name: user.email || 'You'
    }

    setMessages(prev => [...prev, optimisticMessage])
    processedMessageIds.current.add(optimisticMessage.id)

    try {
      const response = await fetch(`/api/conversations/${currentConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: messageText
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      console.log('Message sent successfully:', data)

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? data.message : msg
      ))
      processedMessageIds.current.delete(optimisticMessage.id)
      processedMessageIds.current.add(data.message.id)

    } catch (error) {
      console.error('Error sending message:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      processedMessageIds.current.delete(optimisticMessage.id)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!user || !session || !currentConversationId) return

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
      return
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert('File type not allowed. Please upload images, PDFs, documents, or common file formats.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Add optimistic file message
    const optimisticMessage: Message = {
      id: `temp-file-${Date.now()}`,
      sender_id: user.id,
      message: `Uploading ${file.name}...`,
      created_at: new Date().toISOString(),
      sender_name: user.email || 'You',
      message_type: 'file',
      file_name: file.name,
      file_size: file.size
    }

    setMessages(prev => [...prev, optimisticMessage])
    processedMessageIds.current.add(optimisticMessage.id)

    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversationId', currentConversationId)

      const uploadResponse = await fetch('/api/chat/file-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'File upload failed')
      }

      const uploadData = await uploadResponse.json()
      console.log('File uploaded successfully:', uploadData)

      // Send file message
      const messageResponse = await fetch(`/api/conversations/${currentConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: `Shared file: ${file.name}`,
          message_type: 'file',
          file_url: uploadData.file.url,
          file_name: file.name,
          file_size: file.size
        })
      })

      if (!messageResponse.ok) {
        throw new Error('Failed to send file message')
      }

      const messageData = await messageResponse.json()
      console.log('File message sent successfully:', messageData)

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? messageData.message : msg
      ))
      processedMessageIds.current.delete(optimisticMessage.id)
      processedMessageIds.current.add(messageData.message.id)

    } catch (error) {
      console.error('Error uploading file:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      processedMessageIds.current.delete(optimisticMessage.id)
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset input
    if (event.target) {
      event.target.value = ''
    }
  }

  // Helper function to get file icon based on file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '')) {
      return <Image className="h-4 w-4" />
    }
    
    return <File className="h-4 w-4" />
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Handle file download
  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!isOpen) return null

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
      <Card className="w-full h-full flex flex-col bg-white dark:bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Avatar 
              src={tutorImage} 
              alt={tutorName} 
              size="md"
              className="h-10 w-10"
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {tutorName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {messages.length > 0 ? `${messages.length} message${messages.length === 1 ? '' : 's'}` : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* TODO: Minimize functionality */}}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!user || !session ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Please log in to start chatting</p>
                <Button 
                  onClick={() => window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)}
                  className="mt-2"
                >
                  Log In
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Start a conversation with {tutorName}</p>
                <p className="text-sm">Send a message to begin chatting</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              // Determine if this is the current user's message based on view context
              let isOwnMessage = false
              
              if (isStudentView) {
                // In student view: student messages (current user) on right, tutor messages on left
                isOwnMessage = message.sender_id === user?.id
              } else {
                // In tutor view: tutor messages (current user) on right, student messages on left
                isOwnMessage = message.sender_id === user?.id
              }
              
              return (
                <div
                  key={`${message.id}-${index}`}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {message.message_type === 'file' ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(message.file_name || '')}
                          <span className="text-sm font-medium">{message.file_name}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className={isOwnMessage ? 'text-primary-foreground/70' : 'text-gray-500 dark:text-gray-400'}>
                            {formatFileSize(message.file_size || 0)}
                          </span>
                          {message.file_url && (
                            <button
                              onClick={() => handleFileDownload(message.file_url!, message.file_name!)}
                              className={`flex items-center space-x-1 hover:underline ${
                                isOwnMessage ? 'text-primary-foreground/70 hover:text-primary-foreground' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                              }`}
                            >
                              <Download className="h-3 w-3" />
                              <span>Download</span>
                            </button>
                          )}
                        </div>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage
                            ? 'text-primary-foreground/70'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage
                            ? 'text-primary-foreground/70'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={!user || !session || isUploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={!user || !session ? "Please log in to send messages" : "Send a message"}
              className="flex-1"
              disabled={!user || !session || !currentConversationId}
            />
            <Button
              size="sm"
              onClick={sendMessage}
              disabled={!user || !session || !newMessage.trim() || !currentConversationId || isUploading}
              className="h-8 w-8 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isUploading && (
            <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-1"></div>
              Uploading... {uploadProgress}%
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
          />
        </div>
      </Card>
    </div>
  )
} 