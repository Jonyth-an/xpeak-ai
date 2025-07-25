'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'
import { MessageCircle, AlertCircle } from 'lucide-react'
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
  const [error, setError] = useState<string | null>(null)

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

    // Check if user is trying to message themselves
    try {
      const response = await fetch('/api/tutors/' + tutorId + '/profile')
      if (response.ok) {
        const tutorData = await response.json()
        // This is a simplified check - in a real app, you'd want to check the tutor's user_id
        // For now, we'll let the backend handle this validation
      }
    } catch (err) {
      console.error('Error checking tutor profile:', err)
    }

    // Clear any previous errors
    setError(null)
    
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
        onClose={() => {
          setIsChatOpen(false)
          setError(null)
        }}
        tutorId={tutorId}
        tutorName={tutorName}
        tutorImage={tutorImage}
        isStudentView={true}
      />
    </>
  )
} 