'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { Button, Input } from '@/app/components/ui'
import { 
  Send, 
  Paperclip, 
  Download,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive
} from 'lucide-react'
import Avatar from '@/app/components/ui/Avatar'

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

interface FullPageChatProps {
  conversationId: string
  tutorName: string
  tutorImage?: string
  onClose?: () => void
}

export function FullPageChat({ 
  conversationId, 
  tutorName, 
  tutorImage,
  onClose 
}: FullPageChatProps) {
  const { user, session } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const processedMessageIds = useRef<Set<string>>(new Set())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
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
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !session || !conversationId) return

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
      setIsSending(true)
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
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
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!user || !session || !conversationId) return

    // Add file message optimistically
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
      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversationId', conversationId)

      const response = await fetch('/api/conversations/upload-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload file')
      }

      const data = await response.json()
      console.log('File uploaded successfully:', data)

      // Replace optimistic message with real one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? data.message : msg
      ))
      processedMessageIds.current.delete(optimisticMessage.id)
      processedMessageIds.current.add(data.message.id)

    } catch (error) {
      console.error('Error uploading file:', error)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      processedMessageIds.current.delete(optimisticMessage.id)
      alert('Failed to upload file. Please try again.')
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset input
    event.target.value = ''
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <ImageIcon className="h-4 w-4" />
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv':
        return <Video className="h-4 w-4" />
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="h-4 w-4" />
      case 'zip':
      case 'rar':
      case '7z':
        return <Archive className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
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

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user || !session || !conversationId) return

    import('@/lib/supabaseClient').then(({ supabase }) => {
      const channel = supabase
        .channel(`conversation-${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'general_chat_messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const newMessage = payload.new as Message
            // Only add if we haven't processed this message before
            if (!processedMessageIds.current.has(newMessage.id)) {
              setMessages(prev => [...prev, newMessage])
              processedMessageIds.current.add(newMessage.id)
            }
          }
        )
        .subscribe()

      return () => {
        channel.unsubscribe()
      }
    })
  }, [user, session, conversationId])

  useEffect(() => {
    loadMessages()
  }, [conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={loadMessages} variant="outline" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          {tutorImage ? (
            <img
              src={tutorImage}
              alt={tutorName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {tutorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{tutorName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="tertiary"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === user?.id
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Show avatar for all messages */}
                <Avatar
                  src={isOwnMessage ? user?.user_metadata?.avatar_url : tutorImage}
                  alt={isOwnMessage ? user?.email || 'You' : tutorName}
                  className="h-8 w-8 flex-shrink-0"
                />
                
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-lg px-3 py-2 ${
                    isOwnMessage 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}>
                    {message.message_type === 'file' ? (
                      <div className="flex items-center space-x-2">
                        {getFileIcon(message.file_name || '')}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {message.file_name}
                          </p>
                          <p className="text-xs opacity-75">
                            {formatFileSize(message.file_size || 0)}
                          </p>
                        </div>
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleFileDownload(message.file_url || '', message.file_name || '')}
                          className="h-6 w-6 p-0"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-2">
          <label className="flex-shrink-0">
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            />
            <Button
              variant="tertiary"
              size="sm"
              className="h-10 w-10 p-0"
              asChild
            >
              <span>
                <Paperclip className="h-4 w-4" />
              </span>
            </Button>
          </label>
          
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send a message"
              className="min-h-[40px] max-h-32 resize-none"
              disabled={isSending}
            />
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            size="sm"
            className="h-10 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 