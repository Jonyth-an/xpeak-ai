'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { Card, Text, Button, Input, Badge } from '@/app/components/ui'
import { Search, MessageSquare, Clock, User, Send, ArrowLeft, RefreshCw } from 'lucide-react'
import { ChatWindow } from '@/app/components/ChatWindow'
import { supabase } from '@/lib/supabaseClient'
import TutorLayout from '../TutorLayout'

interface Conversation {
  id: string
  title: string
  conversation_type: string
  created_at: string
  updated_at: string
  unread_count: number
  last_read_at: string
  student: {
    id: string
    name: string
    email: string
    profile_image_url?: string
  }
  latest_message?: {
    id: string
    message: string
    created_at: string
    sender_name: string
  }
}

export default function TutorChatPage() {
  const { user, session } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user || !session) return

    try {
      setError(null)
      const response = await fetch('/api/tutor/conversations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setConversations(data.conversations)
      } else {
        throw new Error(data.error || 'Failed to fetch conversations')
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    if (!user || !session) return

    try {
      const response = await fetch(`/api/tutor/conversations/${conversationId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        // Update local state to reflect read status
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0, last_read_at: new Date().toISOString() }
            : conv
        ))
      }
    } catch (err) {
      console.error('Error marking conversation as read:', err)
    }
  }

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    // Mark as read when selected
    if (conversation.unread_count > 0) {
      markConversationAsRead(conversation.id)
    }
  }

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!user || !session) return

    // Initial fetch
    fetchConversations()

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('tutor-conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'general_chat_messages'
        },
        (payload) => {
          console.log('New message received:', payload)
          // Refresh conversations to get updated unread counts and latest messages
          fetchConversations()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation updated:', payload)
          // Refresh conversations to get updated data
          fetchConversations()
        }
      )
      .subscribe()

    // Set up periodic refresh as backup
    refreshIntervalRef.current = setInterval(() => {
      fetchConversations()
    }, 30000) // Refresh every 30 seconds

    return () => {
      channel.unsubscribe()
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [user, session])

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchConversations()
  }

  if (!user || !session) {
    return (
      <TutorLayout>
        <div className="flex items-center justify-center h-64">
          <Text>Please log in to access chat.</Text>
        </div>
      </TutorLayout>
    )
  }

  return (
    <TutorLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
        {/* Left Sidebar - Conversation List */}
        <div className={`w-full lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Messages</h2>
              <Button
                variant="tertiary"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Chat with your students</p>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations by student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <Text className="text-red-500 mb-2">{error}</Text>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <Text className="text-gray-500 mb-2">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </Text>
                <Text className="text-sm text-gray-400">
                  {searchQuery ? 'Try adjusting your search' : 'When students message you, their conversations will appear here'}
                </Text>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <Text className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {conversation.student.name}
                          </Text>
                          <div className="flex items-center space-x-2">
                                                          {conversation.unread_count > 0 && (
                                <Badge variant="error" className="text-xs">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTimestamp(conversation.updated_at)}
                            </Text>
                          </div>
                        </div>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {conversation.latest_message ? (
                            <>
                              <span className="font-medium">{conversation.latest_message.sender_name}:</span>{' '}
                              {conversation.latest_message.message}
                            </>
                          ) : (
                            'No messages yet'
                          )}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Window */}
        <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="tertiary"
                      size="sm"
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <Text className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedConversation.student.name}
                      </Text>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedConversation.student.email}
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedConversation.unread_count > 0 && (
                      <Badge variant="error">
                        {selectedConversation.unread_count} unread
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  isOpen={true}
                  onClose={() => setSelectedConversation(null)}
                  tutorId={selectedConversation.student.id}
                  tutorName={selectedConversation.student.name}
                  tutorImage={selectedConversation.student.profile_image_url}
                  conversationId={selectedConversation.id}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <Text className="text-gray-500 mb-2">Select a conversation</Text>
                <Text className="text-sm text-gray-400">
                  Choose a conversation from the list to start chatting
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>
    </TutorLayout>
  )
} 