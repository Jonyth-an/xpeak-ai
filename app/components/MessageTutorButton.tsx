'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'
import { MessageCircle } from 'lucide-react'
import { ChatWindow } from './ChatWindow'

interface MessageTutorButtonProps {
  tutorId: string
  tutorName: string
  tutorImage?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'feature' | 'tertiary' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}

export default function MessageTutorButton({ 
  tutorId, 
  tutorName, 
  tutorImage,
  className = '',
  variant = 'primary',
  size = 'md'
}: MessageTutorButtonProps) {
  const { user, session, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Debug authentication state
  React.useEffect(() => {
    console.log('MessageTutorButton - Auth state:', {
      user: user?.email,
      session: !!session,
      loading,
      userId: user?.id
    })
  }, [user, session, loading])

  const handleMessageTutor = async () => {
    if (!user || !session) {
      // Redirect to login if not authenticated
      console.log('User not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    // Open the chat window directly
    setIsChatOpen(true)
  }

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <Button
        disabled={true}
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        Loading...
      </Button>
    )
  }

  // Show login prompt if not authenticated
  if (!user || !session) {
    return (
      <Button
        onClick={() => router.push('/login')}
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        Login to Message
      </Button>
    )
  }

  return (
    <>
      <Button
        onClick={handleMessageTutor}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        <MessageCircle className="h-4 w-4" />
        {isLoading ? 'Starting...' : 'Message Tutor'}
      </Button>

      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        tutorId={tutorId}
        tutorName={tutorName}
        tutorImage={tutorImage}
      />
    </>
  )
} 