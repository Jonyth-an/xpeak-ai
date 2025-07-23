'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Card from '@/app/components/ui/Card'
import Avatar from '@/app/components/ui/Avatar'
import Badge from '@/app/components/ui/Badge'
import { Plus, Search, MessageCircle, Users } from 'lucide-react'
import { Conversation } from '@/lib/services/chatService'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId?: string
  onSelectConversation: (conversationId: string) => void
  onCreateConversation?: () => void
  isLoading?: boolean
  className?: string
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  isLoading = false,
  className = ''
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(conv =>
        conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.participants?.some(p => 
          p.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredConversations(filtered)
    }
  }, [conversations, searchTerm])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getConversationTypeIcon = (type: string) => {
    switch (type) {
      case 'student_tutor':
        return <MessageCircle className="w-4 h-4" />
      case 'tutor_tutor':
        return <Users className="w-4 h-4" />
      case 'support':
        return <MessageCircle className="w-4 h-4" />
      case 'general':
        return <MessageCircle className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const getConversationTypeLabel = (type: string) => {
    switch (type) {
      case 'student_tutor':
        return 'Student-Tutor'
      case 'tutor_tutor':
        return 'Tutor-Tutor'
      case 'support':
        return 'Support'
      case 'general':
        return 'General'
      default:
        return 'Chat'
    }
  }

  return (
    <Card className={`w-full ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Conversations</h3>
          {onCreateConversation && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateConversation}
              className="h-8 w-8"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="p-0">
        <div className="h-[500px] w-full overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Loading conversations...</div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversationId === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Conversation Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getConversationTypeIcon(conversation.conversation_type)}
                      </div>
                    </div>
                    
                    {/* Conversation Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">
                          {conversation.title || getConversationTypeLabel(conversation.conversation_type)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {getConversationTypeLabel(conversation.conversation_type)}
                        </Badge>
                      </div>
                      
                      {/* Participants */}
                      {conversation.participants && conversation.participants.length > 0 && (
                        <div className="flex items-center gap-1 mb-1">
                          <div className="flex -space-x-2">
                            {conversation.participants.slice(0, 3).map((participant, index) => (
                              <Avatar key={participant.id} className="w-6 h-6 border-2 border-background">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                                  {participant.user?.full_name?.charAt(0) || 'U'}
                                </div>
                              </Avatar>
                            ))}
                          </div>
                          {conversation.participants.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{conversation.participants.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Last Message */}
                      {conversation.last_message ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground truncate">
                            {conversation.last_message.message}
                          </span>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatTime(conversation.last_message.created_at)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            No messages yet
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.created_at)}
                          </span>
                        </div>
                      )}
                      
                      {/* Unread Count */}
                      {conversation.unread_count && conversation.unread_count > 0 && (
                        <div className="flex justify-end mt-1">
                          <Badge variant="error" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
} 