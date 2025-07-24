'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import RequireEmailVerification from '@/app/components/RequireEmailVerification'
import DashboardSidebar from '@/app/student/dashboard/components/DashboardSidebar'
import { ChatWindow } from '@/app/components/ChatWindow'
import { Button } from '@/app/components/ui'
import { ArrowLeft, User } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  conversation_type: string
  participants: Array<{
    user_id: string
    role: string
    user?: {
      id: string
      full_name?: string
      email?: string
      profile_image_url?: string
    }
  }>
}

export default function StudentChatPage() {
  const { id: conversationId } = useParams()
  const router = useRouter()
  const { user, session } = useAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !session || !conversationId) return

    const loadConversation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get conversation details
        const response = await fetch(`/api/conversations/${conversationId}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load conversation')
        }

        const data = await response.json()
        setConversation(data.conversation)
      } catch (err) {
        console.error('Error loading conversation:', err)
        setError(err instanceof Error ? err.message : 'Failed to load conversation')
      } finally {
        setIsLoading(false)
      }
    }

    loadConversation()
  }, [user, session, conversationId])

  // Find the tutor in the conversation
  const tutor = conversation?.participants?.find(p => p.role === 'tutor')
  const tutorName = tutor?.user?.full_name || tutor?.user?.email || 'Tutor'
  const tutorImage = tutor?.user?.profile_image_url

  if (!user || !session) {
    return (
      <ProtectedRoute>
        <RequireEmailVerification>
          <Layout>
            <div className="flex items-center justify-center h-64">
              <p>Please log in to access chat.</p>
            </div>
          </Layout>
        </RequireEmailVerification>
      </ProtectedRoute>
    )
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <RequireEmailVerification>
          <Layout>
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent min-h-screen">
              <div className="max-w-7xl mx-auto">
                <div className="relative lg:flex lg:min-h-[600px]">
                  {/* Sidebar */}
                  <div className="hidden lg:block lg:w-72 lg:shrink-0">
                    <div className="sticky top-24">
                      <DashboardSidebar userEmail={user?.email} />
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="lg:ml-8 flex-1">
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-token-primary mx-auto mb-4"></div>
                        <h1 className="text-2xl font-bold mb-4">Loading conversation...</h1>
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

  if (error) {
    return (
      <ProtectedRoute>
        <RequireEmailVerification>
          <Layout>
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent min-h-screen">
              <div className="max-w-7xl mx-auto">
                <div className="relative lg:flex lg:min-h-[600px]">
                  {/* Sidebar */}
                  <div className="hidden lg:block lg:w-72 lg:shrink-0">
                    <div className="sticky top-24">
                      <DashboardSidebar userEmail={user?.email} />
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="lg:ml-8 flex-1">
                    <div className="max-w-4xl mx-auto">
                      <div className="text-center py-16">
                        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                        <p className="text-token-text-secondary mb-4">{error}</p>
                        <Button onClick={() => router.back()}>
                          Go Back
                        </Button>
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

  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent min-h-screen">
            <div className="max-w-7xl mx-auto">
              <div className="relative lg:flex lg:min-h-[600px]">
                {/* Sidebar */}
                <div className="hidden lg:block lg:w-72 lg:shrink-0">
                  <div className="sticky top-24">
                    <DashboardSidebar userEmail={user?.email} />
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="lg:ml-8 flex-1">
                  <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.back()}
                          className="lg:hidden"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h1 className="text-xl font-semibold">{tutorName}</h1>
                          <p className="text-sm text-token-text-secondary">
                            {conversation?.title || 'Chat conversation'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chat Window */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <ChatWindow
                        isOpen={true}
                        onClose={() => router.back()}
                        tutorId={tutor?.user_id || ''}
                        tutorName={tutorName}
                        tutorImage={tutorImage}
                        conversationId={conversationId as string}
                        isStudentView={true}
                      />
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