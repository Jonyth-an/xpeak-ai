'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Card from '@/app/components/ui/Card'
import Avatar from '@/app/components/ui/Avatar'
import Badge from '@/app/components/ui/Badge'
import { Paperclip, Send, FileText, Image } from 'lucide-react'
import { ChatMessage } from '@/lib/services/chatService'

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<void>
  onSendFile?: (file: File) => Promise<void>
  isLoading?: boolean
  isConnected?: boolean
  isUploading?: boolean
  uploadProgress?: number
  title?: string
  placeholder?: string
  maxHeight?: string
  showFileUpload?: boolean
  className?: string
}

export function ChatInterface({
  messages,
  onSendMessage,
  onSendFile,
  isLoading = false,
  isConnected = true,
  isUploading = false,
  uploadProgress = 0,
  title = 'Chat',
  placeholder = 'Type a message...',
  maxHeight = '400px',
  showFileUpload = true,
  className = ''
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      await onSendMessage(message.trim())
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onSendFile) return

    try {
      await onSendFile(file)
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card className={`w-full ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="success" className="bg-green-500">
                Connected
              </Badge>
            ) : (
              <Badge variant="error">Disconnected</Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-0">
        {/* Messages Area */}
        <div className="px-4 pb-4">
          <div className="h-[400px] w-full overflow-y-auto" style={{ maxHeight }}>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">Loading messages...</div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-sm text-muted-foreground">No messages yet</div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex gap-3 items-start">
                    <Avatar className="w-8 h-8">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                        {msg.sender_initials || msg.sender_name?.charAt(0) || 'U'}
                      </div>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {msg.sender_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(msg.created_at)}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        {msg.message_type === 'file' ? (
                          <div className="flex items-center gap-2 p-2 bg-muted rounded">
                            <FileText className="w-4 h-4" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {msg.file_name}
                              </div>
                            </div>
                            {msg.file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(msg.file_url, '_blank')}
                              >
                                Download
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{msg.message}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Uploading... {uploadProgress}%
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            {showFileUpload && onSendFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending || isUploading}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            )}
            
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isSending || isUploading || !isConnected}
              className="flex-1"
            />
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending || isUploading || !isConnected}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Hidden file input */}
          {showFileUpload && onSendFile && (
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          )}
        </div>
      </div>
    </Card>
  )
} 