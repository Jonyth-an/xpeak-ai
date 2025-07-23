'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Send, Paperclip, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Avatar from '@/app/components/ui/Avatar'
import { chatService, ChatMessage } from '@/lib/services/chatService'
import { useAuth } from '@/lib/AuthContext'

interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  tutorId: string
  tutorName: string
  tutorImage?: string
  conversationId?: string
}

interface Message {
  id: string
  sender_id: string
  message: string
  created_at: string
  sender_name: string
}

export function ChatWindow({ 
  isOpen, 
  onClose, 
  tutorId, 
  tutorName, 
  tutorImage,
  conversationId 
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user, session } = useAuth()

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversation and messages when chat window opens
  useEffect(() => {
    console.log('ChatWindow useEffect triggered:', {
      isOpen,
      user: !!user,
      session: !!session,
      sessionToken: session?.access_token ? 'present' : 'missing'
    })
    
    if (isOpen) {
      if (!user || !session) {
        console.log('User not authenticated, redirecting to login...')
        // Redirect to login page
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
        return
      }
      
      loadConversation()
    }
  }, [isOpen, user, tutorId])

  const loadConversation = async () => {
    console.log('=== LOAD CONVERSATION DEBUG START ===')
    console.log('loadConversation called with:', {
      user: !!user,
      session: !!session,
      sessionToken: session?.access_token ? 'present' : 'missing',
      sessionTokenLength: session?.access_token?.length || 0,
      currentConversationId,
      tutorId
    })

    if (!user) {
      console.log('loadConversation early return - no user')
      return
    }

    setIsLoading(true)
    try {
      // If we don't have a conversation ID, create or find one
      if (!currentConversationId) {
        console.log('Creating/finding conversation for tutor:', tutorId)
        const requestBody = { tutorId }
        console.log('Direct conversation request body:', requestBody)
        
        const response = await fetch('/api/conversations/direct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify(requestBody)
        })

        console.log('=== DIRECT CONVERSATION API RESPONSE ===')
        console.log('Response status:', response.status)
        console.log('Response status text:', response.statusText)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (response.ok) {
          const data = await response.json()
          console.log('Conversation created/found:', data)
          setCurrentConversationId(data.conversation.id)
          
          // Load messages for this conversation
          if (data.conversation.id) {
            await loadMessages(data.conversation.id)
          }
        } else {
          console.log('=== DIRECT CONVERSATION ERROR ===')
          try {
            const errorText = await response.text()
            console.log('Raw error response text:', errorText)
            
            let errorData
            try {
              errorData = JSON.parse(errorText)
              console.log('Parsed error data:', errorData)
            } catch (parseError) {
              console.log('Failed to parse error as JSON:', parseError)
              errorData = { rawText: errorText }
            }
            
            console.error('Failed to create/find conversation:', errorData)
          } catch (textError) {
            console.error('Failed to read error response text:', textError)
          }
        }
      } else {
        console.log('Loading messages for existing conversation:', currentConversationId)
        // Load messages for existing conversation
        await loadMessages(currentConversationId)
      }
    } catch (error) {
      console.log('=== LOAD CONVERSATION FETCH ERROR ===')
      console.error('Error loading conversation:', error)
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
    } finally {
      setIsLoading(false)
    }
    
    console.log('=== LOAD CONVERSATION DEBUG END ===')
  }

  const loadMessages = async (convId: string) => {
    if (!session) return
    
    try {
      const response = await fetch(`/api/conversations/${convId}/messages?limit=50`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages.map((msg: any) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          message: msg.message,
          created_at: msg.created_at,
          sender_name: msg.sender_name
        })))
      } else {
        console.error('Failed to load messages:', await response.json())
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!user || !session) {
      console.log('User not authenticated, redirecting to login...')
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    if (!newMessage.trim() || !currentConversationId) {
      console.log('sendMessage early return - missing message or conversation ID')
      return
    }

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      const response = await fetch(`/api/conversations/${currentConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: messageText,
          messageType: 'text'
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Message sent successfully:', data)
        const sentMessage = data.message
        
        setMessages(prev => [...prev, {
          id: sentMessage.id,
          sender_id: sentMessage.sender_id,
          message: sentMessage.message,
          created_at: sentMessage.created_at,
          sender_name: sentMessage.sender_name
        }])
      } else {
        console.log('=== ERROR RESPONSE DEBUG ===')
        console.log('Response not OK, attempting to read error data...')
        
        try {
          const errorText = await response.text()
          console.log('Raw error response text:', errorText)
          
          let errorData
          try {
            errorData = JSON.parse(errorText)
            console.log('Parsed error data:', errorData)
          } catch (parseError) {
            console.log('Failed to parse error as JSON:', parseError)
            errorData = { rawText: errorText }
          }
          
          console.error('Failed to send message:', errorData)
          console.error('Response status:', response.status)
          console.error('Response status text:', response.statusText)
        } catch (textError) {
          console.error('Failed to read response text:', textError)
        }
      }
    } catch (error) {
      console.log('=== FETCH ERROR DEBUG ===')
      console.error('Fetch error:', error)
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      console.error('Error type:', typeof error)
      console.error('Error stringified:', JSON.stringify(error, error instanceof Error ? Object.getOwnPropertyNames(error) : [], 2))
    }
    
    console.log('=== SEND MESSAGE DEBUG END ===')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md h-[600px] flex flex-col bg-white dark:bg-gray-900 shadow-xl">
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
                Online
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
              <div className="text-gray-500 dark:text-gray-400">Loading conversation...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>Start a conversation with {tutorName}</p>
                <p className="text-sm">Send a message to begin chatting</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === user?.id
                      ? 'text-primary-foreground/70'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
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
              onClick={() => {/* TODO: File attachment functionality */}}
              disabled={!user || !session}
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
              disabled={!user || !session || !newMessage.trim() || !currentConversationId}
              className="h-8 w-8 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 