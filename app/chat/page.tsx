'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { chatService, Conversation } from '@/lib/services/chatService'
import { useGeneralChat } from '@/lib/hooks/useGeneralChat'
import { ChatInterface } from '@/app/components/chat/ChatInterface'
import { ConversationList } from '@/app/components/chat/ConversationList'
import { Button } from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import { Plus, MessageCircle, Search } from 'lucide-react'

type ConversationType = 'student_tutor' | 'tutor_tutor' | 'support' | 'general'

export default function ChatPage() {
  console.log('🔍 ChatPage component loaded - checking for Messages text')
  
  const { user, session } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  // Check for conversation parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const conversationId = urlParams.get('conversation')
    if (conversationId) {
      setSelectedConversationId(conversationId)
      // Clear the URL parameter after setting the conversation
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('conversation')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [])
  const [newConversationData, setNewConversationData] = useState({
    title: '',
    conversation_type: 'general' as ConversationType,
    participants: [] as string[],
    participant_roles: [] as string[]
  })
  const [searchTerm, setSearchTerm] = useState('')

  console.log('✅ ChatPage state initialized - Messages UI should be visible')

  // Load conversations
  const loadConversations = async () => {
    if (!user) return
    
    try {
      const userConversations = await chatService.getConversations(user.id)
      setConversations(userConversations)
    } catch (error) {
      console.error('Failed to load conversations:', error)
    }
  }

  // Load conversations on mount and when user changes
  useEffect(() => {
    loadConversations()
  }, [user, session])

  // Get current conversation
  const currentConversation = conversations.find(c => c.id === selectedConversationId)

  // Use general chat hook for selected conversation
  const {
    messages,
    sendMessage,
    sendFileMessage,
    isLoading: isLoadingMessages,
    error,
    isConnected,
    isUploading,
    uploadProgress
  } = useGeneralChat({
    conversationId: selectedConversationId || '',
    userId: user?.id || '',
    userName: user?.email || 'User'
  })

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  // Handle create conversation
  const handleCreateConversation = async () => {
    if (!user || !session) return

    try {
      console.log('Creating message with data:', {
        title: newConversationData.title,
        conversation_type: newConversationData.conversation_type,
        participants: newConversationData.participants, // Don't include current user
        participant_roles: newConversationData.participant_roles
      })

      const newConversation = await chatService.createConversation({
        title: newConversationData.title,
        conversation_type: newConversationData.conversation_type,
        participants: newConversationData.participants, // Backend will add current user automatically
        participant_roles: newConversationData.participant_roles as ('student' | 'tutor' | 'admin')[]
      })

      if (newConversation) {
        console.log('Message created successfully:', newConversation)
        // Reload conversations and select the new one
        await loadConversations()
        setSelectedConversationId(newConversation.id)
        setShowCreateDialog(false)
        setNewConversationData({
          title: '',
          conversation_type: 'general',
          participants: [],
          participant_roles: []
        })
      } else {
        console.error('Failed to create message - chatService returned null')
        alert('Failed to create message. Please try again.')
      }
    } catch (error) {
      console.error('Failed to create message:', error)
      alert('Failed to create message. Please try again.')
    }
  }

  const filteredConversations = conversations.filter(conversation =>
    (conversation.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || !session) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please log in to access chat</h2>
            <p className="text-muted-foreground">You need to be authenticated to use the chat feature.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Debug Banner */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <strong>✅ DEBUG:</strong> Messages UI is loaded - changes applied successfully!
      </div>
      
      <div className="flex gap-6 h-[calc(100vh-120px)]">
        {/* Left Panel - Conversations */}
        <div className="w-1/3 border-r border-gray-200 bg-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
            
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Create Conversation Button */}
            <button
              onClick={() => setShowCreateDialog(true)}
              className="w-full mb-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Message
            </button>

            {/* Conversations List */}
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No messages yet
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversationId === conversation.id
                        ? 'bg-blue-100 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.title || 'Untitled Conversation'}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {conversation.conversation_type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1">
          {selectedConversationId ? (
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              onSendFile={sendFileMessage}
              isLoading={isLoadingMessages}
              isConnected={isConnected}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              title={currentConversation?.title || 'Chat'}
              placeholder="Type a message..."
              showFileUpload={true}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start chatting.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Conversation Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Message</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Title
                </label>
                <Input
                  type="text"
                  placeholder="Enter message title..."
                  value={newConversationData.title}
                  onChange={(e) => setNewConversationData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Type
                </label>
                <select
                  value={newConversationData.conversation_type}
                  onChange={(e) => setNewConversationData(prev => ({
                    ...prev,
                    conversation_type: e.target.value as 'general' | 'student_tutor' | 'support'
                  }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="student_tutor">Student-Tutor</option>
                  <option value="support">Support</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleCreateConversation}
                disabled={!newConversationData.title.trim()}
                className="flex-1"
              >
                Create Message
              </Button>
              <Button
                onClick={() => setShowCreateDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 