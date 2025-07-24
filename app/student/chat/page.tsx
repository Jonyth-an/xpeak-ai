'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import RequireEmailVerification from '@/app/components/RequireEmailVerification'
import DashboardSidebar from '@/app/student/dashboard/components/DashboardSidebar'
import { ChatWindow } from '@/app/components/ChatWindow'
import { Button, Input, Badge, Text } from '@/app/components/ui'
import { 
  Search, 
  MessageSquare, 
  User, 
  ArrowLeft, 
  RefreshCw 
} from 'lucide-react'

interface Conversation {
  id: string
  title: string
  conversation_type: string
  created_at: string
  updated_at: string
  unread_count: number
  last_read_at: string
  tutor: {
    id: string
    name: string
    email: string
    profile_image_url?: string
  }
  latest_message?: {
    sender_id: string
    sender_name: string
    message: string
    created_at: string
  }
}

export default function StudentChatPage() {
  const router = useRouter()
  const { user, session } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation =>
    conversation.tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.tutor.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Fetch conversations from API
  const fetchConversations = async () => {
    if (!user || !session) return

    try {
      setIsRefreshing(true)
      setError(null)

      const response = await fetch('/api/student/conversations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const data = await response.json()
      setConversations(data.conversations || [])
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
      const response = await fetch(`/api/student/conversations/${conversationId}/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        // Update the conversation in the list
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
    if (conversation.unread_count > 0) {
      markConversationAsRead(conversation.id)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    fetchConversations()
  }

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [user, session])

  // Set up real-time subscriptions for new messages and conversation updates
  useEffect(() => {
    if (!user || !session) return

    // Import supabase client
    import('@/lib/supabaseClient').then(({ supabase }) => {
      // Subscribe to new messages
      const messagesSubscription = supabase
        .channel('student-conversations-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'general_chat_messages',
            filter: `conversation_id=in.(${conversations.map(c => c.id).join(',')})`
          },
          (payload) => {
            console.log('New message received:', payload)
            // Refresh conversations to get updated latest message and unread count
            fetchConversations()
          }
        )
        .subscribe()

      // Subscribe to conversation updates (unread count, etc.)
      const conversationsSubscription = supabase
        .channel('student-conversations-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `id=in.(${conversations.map(c => c.id).join(',')})`
          },
          (payload) => {
            console.log('Conversation updated:', payload)
            // Refresh conversations to get updated data
            fetchConversations()
          }
        )
        .subscribe()

      return () => {
        messagesSubscription.unsubscribe()
        conversationsSubscription.unsubscribe()
      }
    })
  }, [user, session, conversations.map(c => c.id).join(',')])

  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent min-h-screen">
            <div className="max-w-7xl mx-auto">
              {/* Main Content with Sidebar - Use flex for large screens */}
              <div className="relative lg:flex lg:min-h-[600px]">
                {/* Sidebar */}
                <div className="hidden lg:block lg:w-72 lg:shrink-0">
                  <div className="sticky top-24">
                    <DashboardSidebar userEmail={user?.email} />
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="lg:ml-8 flex-1">
                  <div className="flex h-[calc(100vh-12rem)] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">Chat with your tutors</p>
                      </div>

                      {/* Search */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search conversations by tutor..."
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
                              {searchQuery ? 'Try adjusting your search' : 'When you message tutors, your conversations will appear here'}
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
                                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                                    <User className="h-5 w-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <Text className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {conversation.tutor.name}
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
                                    {selectedConversation.tutor.name}
                                  </Text>
                                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                                    {selectedConversation.tutor.email}
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
                              tutorId={selectedConversation.tutor.id}
                              tutorName={selectedConversation.tutor.name}
                              tutorImage={selectedConversation.tutor.profile_image_url}
                              conversationId={selectedConversation.id}
                              isStudentView={true}
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
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  )
} 