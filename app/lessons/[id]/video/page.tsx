"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"
import SystemCheck from "@/app/components/video/SystemCheck"
import VideoRoom from "@/app/components/video/VideoRoom"
import LessonInterface from "@/app/components/video/LessonInterface"

interface Lesson {
  id: string
  student_id: string
  tutor_id: string
  start_time: string
  end_time: string
  status: string
  subject: string
  description?: string
  tutor: {
    id: string
    user_id: string
    display_name: string
    profile_image_url?: string
  }
  student: {
    id: string
    email: string
    profile_image_url?: string
  }
}

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const [lessonId, setLessonId] = useState<string>("")
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [systemCheckPassed, setSystemCheckPassed] = useState(false)
  const [showVideoRoom, setShowVideoRoom] = useState(false)
  const [showLessonInterface, setShowLessonInterface] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const initPage = async () => {
      const { id } = await params
      setLessonId(id)
      await fetchLesson(id)
    }
    initPage()
  }, [params])

  const fetchLesson = async (id: string) => {
    try {
      // Get authentication token
      const { data: { session } } = await import('@/lib/supabaseClient').then(m => m.supabase.auth.getSession())
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/lessons/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch lesson')
      }
      const data = await response.json()
      setLesson(data)
    } catch (err) {
      setError('Failed to load lesson details')
      console.error('Error fetching lesson:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSystemCheckComplete = (passed: boolean) => {
    setSystemCheckPassed(passed)
    if (passed) {
      setShowVideoRoom(true)
    }
  }

  const handleJoinVideoCall = () => {
    setShowVideoRoom(false)
    setShowLessonInterface(true)
  }

  const handleEndLesson = () => {
    // Navigate back to dashboard or lesson details
    router.push('/dashboard/lessons')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Lesson</h2>
          <p className="text-gray-600 mb-4">{error || 'Lesson not found'}</p>
          <button
            onClick={() => router.push('/dashboard/lessons')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    )
  }

  // Check if user is authorized to join this lesson
  const isStudent = user?.id === lesson.student_id
  const isTutor = user?.id === lesson.tutor?.user_id

  if (!isStudent && !isTutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You are not authorized to join this lesson.</p>
          <button
            onClick={() => router.push('/dashboard/lessons')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    )
  }

  // Show lesson interface if user has passed system check and joined video call
  if (showLessonInterface) {
    return (
      <LessonInterface
        onEndLesson={handleEndLesson}
        lesson={lesson}
        user={user}
      />
    )
  }

  // Show video room if system check passed
  if (showVideoRoom) {
    return (
      <VideoRoom
        lessonId={lessonId}
        onJoinLesson={handleJoinVideoCall}
        onBack={() => setShowVideoRoom(false)}
      />
    )
  }

  // Show system check by default
  return (
    <SystemCheck
      onComplete={handleSystemCheckComplete}
      onBack={() => router.push(`/lessons/${lessonId}`)}
    />
  )
} 