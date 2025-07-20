"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Send,
  Phone,
  Settings,
  Maximize2,
  Minimize2,
  Users,
  FileText,
  X,
  Wifi,
  WifiOff,
  AlertCircle,
  Paperclip,
  Upload,
} from "lucide-react"
import { useLessonChat } from "@/lib/hooks/useLessonChat"
import FileUpload from "./FileUpload"
import FileMessage from "./FileMessage"

interface LessonInterfaceProps {
  onEndLesson: () => void
  lesson?: any
  user?: any
}

export default function LessonInterface({ onEndLesson, lesson, user }: LessonInterfaceProps) {
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isContentMaximized, setIsContentMaximized] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [isContentVisible, setIsContentVisible] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showFileUpload, setShowFileUpload] = useState(false)

  // Mobile-specific state management
  const [isMobile, setIsMobile] = useState(false)
  const [mobileActivePanel, setMobileActivePanel] = useState<'content' | 'chat' | null>(null)

  // Determine user type and ID
  const isTutor = lesson?.tutor_id === user?.id
  const userType = isTutor ? 'tutor' : 'student'
  const userId = user?.id
  const userName = user?.full_name || user?.email?.split('@')[0] || 'User'

  console.log('LessonInterface - User data:', {
    user,
    lesson,
    isTutor,
    userType,
    userId,
    userName
  })

  // Use real-time chat hook
  const {
    messages: chatMessages,
    sendMessage,
    sendFileMessage,
    isLoading: chatLoading,
    error: chatError,
    isConnected: chatConnected,
    isUploading,
    uploadProgress
  } = useLessonChat({
    lessonId: lesson?.id || '',
    userId: userId || '',
    userType,
    userName
  })

  console.log('LessonInterface - Chat hook state:', {
    chatLoading,
    chatError,
    chatConnected,
    isUploading,
    uploadProgress
  })

  const [lessonTime, setLessonTime] = useState(0)
  const studentVideoRef = useRef<HTMLVideoElement>(null)
  const tutorVideoRef = useRef<HTMLVideoElement>(null)

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile panel management
  useEffect(() => {
    if (isMobile) {
      // On mobile, only one panel can be active at a time
      if (isContentVisible && isChatOpen) {
        // If both are open, prioritize content (lesson materials)
        setIsChatOpen(false)
        setMobileActivePanel('content')
      } else if (isContentVisible) {
        setMobileActivePanel('content')
      } else if (isChatOpen) {
        setMobileActivePanel('chat')
      } else {
        setMobileActivePanel(null)
      }
    } else {
      // On desktop, both panels can be open
      setMobileActivePanel(null)
    }
  }, [isMobile, isContentVisible, isChatOpen])

  // Timer for lesson duration
  useEffect(() => {
    const timer = setInterval(() => {
      setLessonTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSendMessage = async () => {
    if (chatMessage.trim()) {
      await sendMessage(chatMessage)
      setChatMessage("")
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setShowFileUpload(false)
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
  }

  const handleSendFile = async () => {
    if (selectedFile) {
      console.log('LessonInterface - Sending file:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        lessonId: lesson?.id,
        userId,
        userName
      })
      
      try {
        await sendFileMessage(selectedFile)
        console.log('LessonInterface - File sent successfully')
        setSelectedFile(null)
      } catch (error) {
        console.error('LessonInterface - Error sending file:', error)
      }
    }
  }

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
  }

  // Mobile panel handlers
  const handleMobileContentToggle = () => {
    if (isMobile) {
      if (mobileActivePanel === 'content') {
        setIsContentVisible(false)
        setMobileActivePanel(null)
      } else {
        setIsContentVisible(true)
        setIsChatOpen(false)
        setMobileActivePanel('content')
      }
    } else {
      setIsContentVisible(!isContentVisible)
    }
  }

  const handleMobileChatToggle = () => {
    if (isMobile) {
      if (mobileActivePanel === 'chat') {
        setIsChatOpen(false)
        setMobileActivePanel(null)
      } else {
        setIsChatOpen(true)
        setIsContentVisible(false)
        setMobileActivePanel('chat')
      }
    } else {
      setIsChatOpen(!isChatOpen)
    }
  }

  // Get tutor and student information
  const tutorName = lesson?.tutor?.name || "Tutor"
  const tutorInitials = tutorName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
  const studentName = user?.full_name || "Student"
  const studentInitials = studentName.split(" ").map((n: string) => n[0]).join("").toUpperCase()

  return (
    <div className="h-screen bg-surface flex flex-col">
      {/* Top Bar */}
      <div className="bg-surface-subtle backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-error rounded-full animate-pulse"></div>
              <span className="text-text font-medium">Live Lesson</span>
            </div>
            <Badge className="bg-primary text-text-inverse border-primary">{formatTime(lessonTime)}</Badge>
            <div className="flex items-center gap-2 text-text">
              <Users className="w-4 h-4" />
              <span className="text-sm">{tutorName}</span>
            </div>
            {/* Chat Connection Status */}
            <div className="flex items-center gap-2">
              {chatConnected ? (
                <div className="flex items-center gap-1 text-success">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs text-text">Chat Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-error">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs text-text">Chat Disconnected</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isContentVisible && (
              <Button
                variant="ghost"
                size="sm"
                className="text-text hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={handleMobileContentToggle}
              >
                <FileText className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-text hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={handleMobileChatToggle}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-text hover:bg-accent hover:text-accent-foreground transition-colors">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={onEndLesson} className="bg-error hover:bg-error/90 transition-colors">
              <Phone className="w-4 h-4 mr-2" />
              End Lesson
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content Area */}
        <div className={`flex-1 flex ${isChatOpen && !isMobile ? "mr-50" : ""} transition-all duration-300`}>
          {isContentVisible ? (
            <>
              {/* Video Streams - With Content */}
              <div
                className={`${
                  isMobile 
                    ? "w-full h-1/2 flex flex-row gap-2 p-2" 
                    : `${isContentMaximized ? "w-1/4" : "w-1/3"} flex flex-col gap-3 p-3`
                } transition-all duration-300 flex-shrink-0`}
              >
                {/* Tutor Video */}
                <Card className={`bg-surface-subtle border-border ${isMobile ? "flex-1" : "flex-1"}`}>
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full bg-surface-muted rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`${
                          isMobile ? "w-12 h-12 text-lg" : "w-20 h-20 text-2xl"
                                                 } bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-text-inverse font-bold`}>
                          {tutorInitials}
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className={`bg-primary text-text-inverse border-primary ${
                          isMobile ? "text-xs px-2 py-1" : ""
                        }`}>{tutorName} (Tutor)</Badge>
                      </div>
                      <div className={`absolute bottom-2 right-2 flex gap-1 ${isMobile ? "gap-1" : "gap-2"}`}>
                        <div className={`${
                          isMobile ? "w-6 h-6" : "w-8 h-8"
                        } bg-success rounded-full flex items-center justify-center`}>
                          <Mic className={`text-text-inverse ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                        </div>
                        <div className={`${
                          isMobile ? "w-6 h-6" : "w-8 h-8"
                        } bg-success rounded-full flex items-center justify-center`}>
                          <Video className={`text-text-inverse ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Student Video */}
                <Card className={`bg-surface-subtle border-border ${isMobile ? "flex-1" : "flex-1"}`}>
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full bg-surface-muted rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`${
                          isMobile ? "w-12 h-12 text-lg" : "w-20 h-20 text-2xl"
                                                 } bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center text-text-inverse font-bold`}>
                          {studentInitials}
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className={`bg-secondary text-text-inverse border-secondary ${
                          isMobile ? "text-xs px-2 py-1" : ""
                        }`}>You (Student)</Badge>
                      </div>
                      <div className={`absolute bottom-2 right-2 flex gap-1 ${isMobile ? "gap-1" : "gap-2"}`}>
                        <div
                          className={`${
                            isMobile ? "w-6 h-6" : "w-8 h-8"
                          } rounded-full flex items-center justify-center ${isMicOn ? "bg-success" : "bg-error"}`}
                        >
                          {isMicOn ? (
                            <Mic className={`text-text ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                          ) : (
                            <MicOff className={`text-text ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                          )}
                        </div>
                        <div
                          className={`${
                            isMobile ? "w-6 h-6" : "w-8 h-8"
                          } rounded-full flex items-center justify-center ${isCameraOn ? "bg-success" : "bg-error"}`}
                        >
                          {isCameraOn ? (
                            <Video className={`text-text-inverse ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                          ) : (
                            <VideoOff className={`text-text-inverse ${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lesson Content Area */}
              <div className={`${
                isMobile 
                  ? "w-full h-1/2" 
                  : "flex-1"
              } flex flex-col ${isMobile ? "p-2" : "p-2 min-w-0 h-full"}`}>
                <Card className="flex-1 bg-surface-subtle border-border rounded-lg h-full">
                  <CardContent className="p-0 h-full">
                    <div className="h-full flex flex-col">
                      {/* Content Header */}
                      <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-text">Lesson Materials</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isMobile && (
                            <Button variant="ghost" size="sm" onClick={() => setIsContentMaximized(!isContentMaximized)}>
                              {isContentMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={handleMobileContentToggle}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Content Display */}
                      <div className="flex-1 p-3 lg:p-6 bg-gradient-to-br from-surface-accent-light to-surface-accent rounded-b-lg">
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center w-full max-w-5xl">
                            <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-surface-accent to-surface-accent-light rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6">
                              <FileText className="w-12 h-12 lg:w-16 lg:h-16 text-primary" />
                            </div>
                            <h3 className="text-xl lg:text-2xl font-bold text-text mb-3 lg:mb-4">Conversation Practice</h3>
                            <p className="text-text-secondary mb-4 lg:mb-6 max-w-3xl mx-auto text-sm lg:text-base">
                              Today we'll practice everyday conversations. Let's start with introductions and move on to
                              talking about hobbies and interests.
                            </p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 max-w-4xl mx-auto">
                              <div className="p-3 lg:p-4 bg-surface-muted rounded-lg shadow-sm border border-border">
                                <h4 className="font-semibold text-text mb-2 text-sm lg:text-base">Topic 1: Introductions</h4>
                                <p className="text-text-secondary text-xs lg:text-sm">
                                  Practice introducing yourself and asking about others
                                </p>
                              </div>
                              <div className="p-3 lg:p-4 bg-surface-muted rounded-lg shadow-sm border border-border">
                                <h4 className="font-semibold text-text mb-2 text-sm lg:text-base">Topic 2: Hobbies & Interests</h4>
                                <p className="text-text-secondary text-xs lg:text-sm">Discuss what you like to do in your free time</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Screen Share Indicator */}
                      {isScreenSharing && (
                        <div className="p-3 bg-primary text-text-inverse text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Monitor className="w-4 h-4" />
                            <span className="text-sm font-medium">You are sharing your screen</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            /* Full Video Chat Mode - No Content */
            <div className="flex-1 relative p-4">
              {/* Main Tutor Video - Full Screen */}
              <Card className="h-full bg-surface-subtle border-border">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full bg-surface-muted rounded-lg overflow-hidden">
                    {/* Video Content Area - Leave space at bottom for transcript */}
                    <div className="h-[calc(100%-80px)] flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-text-inverse font-bold text-4xl">
                        {tutorInitials}
                      </div>
                    </div>

                    {/* Tutor Info */}
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-primary text-text-inverse border-primary text-lg px-4 py-2">{tutorName} (Tutor)</Badge>
                    </div>

                    {/* Tutor Status Icons */}
                    <div className="absolute top-6 right-6 flex gap-3">
                      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                        <Mic className="w-5 h-5 text-text-inverse" />
                      </div>
                      <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-text-inverse" />
                      </div>
                    </div>

                    {/* Screen Share Indicator */}
                    {isScreenSharing && (
                      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                        <div className="bg-primary text-text-inverse px-4 py-2 rounded-lg flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          <span className="text-sm font-medium">Screen sharing active</span>
                        </div>
                      </div>
                    )}

                    {/* Reserved Space for Future Transcript */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-bg-overlay backdrop-blur-sm border-t border-border">
                      <div className="h-full flex items-center justify-center text-text-muted text-sm">
                        {/* This space is reserved for real-time audio transcript */}
                        <span className="italic">Transcript will appear here...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Video - Picture in Picture Style */}
              <div className="absolute bottom-8 right-8 w-64 h-48">
                <Card className="h-full bg-surface-subtle border-border shadow-2xl">
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full bg-surface-muted rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center text-text-inverse font-bold text-xl">
                          {studentInitials}
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-secondary text-text-inverse border-secondary text-xs">You</Badge>
                      </div>
                      <div className="absolute bottom-3 right-3 flex gap-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${isMicOn ? "bg-success" : "bg-error"}`}
                        >
                          {isMicOn ? <Mic className="w-3 h-3 text-text-inverse" /> : <MicOff className="w-3 h-3 text-text-inverse" />}
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${isCameraOn ? "bg-success" : "bg-error"}`}
                        >
                          {isCameraOn ? (
                            <Video className="w-3 h-3 text-text-inverse" />
                          ) : (
                            <VideoOff className="w-3 h-3 text-text-inverse" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar - Desktop Only */}
        {isChatOpen && !isMobile && (
          <div className="w-80 bg-surface-subtle border-l border-border flex flex-col rounded-l-lg">
            {/* Chat Header */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text">Chat</h3>
                  {chatConnected ? (
                    <div className="flex items-center gap-1 text-success">
                      <Wifi className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-error">
                      <WifiOff className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
              {chatError && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-error/50 border border-error/200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-error" />
                  <span className="text-xs text-error">{chatError}</span>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-3">
              {chatLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-text-secondary text-sm">Loading messages...</div>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-text-secondary text-sm text-center">
                    No messages yet.<br />
                    Start the conversation!
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg) => {
                    const isOwnMessage = msg.sender_id === userId
                    const timestamp = new Date(msg.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                    
                    return (
                      <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            isOwnMessage 
                              ? "bg-primary text-text-inverse" 
                              : "bg-surface-muted text-text"
                          }`}
                        >
                          {!isOwnMessage && msg.sender_name && (
                            <p className="text-xs mb-1 font-medium text-text-secondary">
                              {msg.sender_name}
                            </p>
                          )}
                          {msg.message_type === 'file' && msg.file_url && msg.file_name ? (
                            <FileMessage
                              fileName={msg.file_name}
                              fileUrl={msg.file_url}
                              fileSize={msg.file_size || 0}
                              fileType={msg.message}
                              senderName={msg.sender_name || 'Unknown'}
                              timestamp={timestamp}
                              isOwnMessage={isOwnMessage}
                            />
                          ) : (
                            <p className="text-sm">{msg.message}</p>
                          )}
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? "text-text-inverse/60" : "text-text-secondary"
                          }`}>
                            {timestamp}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-3 border-t border-border">
              {/* File Upload Area */}
              {showFileUpload && (
                <div className="mb-3">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    selectedFile={selectedFile}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    error={chatError || undefined}
                  />
                </div>
              )}

              {/* Selected File Display */}
              {selectedFile && !showFileUpload && (
                <div className="mb-3 p-3 bg-primary/50 border border-primary/200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-text">{selectedFile.name}</span>
                      <Badge variant="secondary" className="text-xs text-text">
                        {formatFileSize(selectedFile.size)}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleFileRemove}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="flex-shrink-0"
                  disabled={!chatConnected}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <Input
                  value={chatMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatMessage(e.target.value)}
                  placeholder={chatConnected ? "Type a message..." : "Connecting to chat..."}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                  disabled={!chatConnected}
                />
                
                <Button 
                  onClick={selectedFile ? handleSendFile : handleSendMessage} 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={!chatConnected || (!chatMessage.trim() && !selectedFile)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Chat Panel */}
        {isMobile && mobileActivePanel === 'chat' && (
          <div className="absolute inset-0 top-1/2 bg-surface-subtle border-t border-border flex flex-col rounded-t-lg z-10 transition-all duration-300 ease-in-out">
            {/* Chat Header */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text">Chat</h3>
                  {chatConnected ? (
                    <div className="flex items-center gap-1 text-success">
                      <Wifi className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-error">
                      <WifiOff className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleMobileChatToggle}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
              {chatError && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-error/50 border border-error/200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-error" />
                  <span className="text-xs text-error">{chatError}</span>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-3">
              {chatLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-text-secondary text-sm">Loading messages...</div>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-text-secondary text-sm text-center">
                    No messages yet.<br />
                    Start the conversation!
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg) => {
                    const isOwnMessage = msg.sender_id === userId
                    const timestamp = new Date(msg.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                    
                    return (
                      <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            isOwnMessage 
                              ? "bg-primary text-text-inverse" 
                              : "bg-surface-muted text-text"
                          }`}
                        >
                          {!isOwnMessage && msg.sender_name && (
                            <p className="text-xs mb-1 font-medium text-text-secondary">
                              {msg.sender_name}
                            </p>
                          )}
                          {msg.message_type === 'file' && msg.file_url && msg.file_name ? (
                            <FileMessage
                              fileName={msg.file_name}
                              fileUrl={msg.file_url}
                              fileSize={msg.file_size || 0}
                              fileType={msg.message}
                              senderName={msg.sender_name || 'Unknown'}
                              timestamp={timestamp}
                              isOwnMessage={isOwnMessage}
                            />
                          ) : (
                            <p className="text-sm">{msg.message}</p>
                          )}
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? "text-text-inverse/60" : "text-text-secondary"
                          }`}>
                            {timestamp}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-3 border-t border-border">
              {/* File Upload Area */}
              {showFileUpload && (
                <div className="mb-3">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    selectedFile={selectedFile}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    error={chatError || undefined}
                  />
                </div>
              )}

              {/* Selected File Display */}
              {selectedFile && !showFileUpload && (
                <div className="mb-3 p-3 bg-primary/50 border border-primary/200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-text">{selectedFile.name}</span>
                      <Badge variant="secondary" className="text-xs text-text">
                        {formatFileSize(selectedFile.size)}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleFileRemove}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                  className="flex-shrink-0"
                  disabled={!chatConnected}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                
                <Input
                  value={chatMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatMessage(e.target.value)}
                  placeholder={chatConnected ? "Type a message..." : "Connecting to chat..."}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                  disabled={!chatConnected}
                />
                
                <Button 
                  onClick={selectedFile ? handleSendFile : handleSendMessage} 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={!chatConnected || (!chatMessage.trim() && !selectedFile)}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-surface-subtle backdrop-blur-sm border-t border-border p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`w-12 h-12 rounded-full transition-all duration-200 ${
              isCameraOn 
                ? "bg-surface-muted hover:bg-surface-subtle text-text shadow-md hover:shadow-lg" 
                : "bg-error hover:bg-error/90 text-text-inverse shadow-md hover:shadow-lg"
            }`}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-12 h-12 rounded-full transition-all duration-200 ${
              isMicOn 
                ? "bg-surface-muted hover:bg-surface-subtle text-text shadow-md hover:shadow-lg" 
                : "bg-error hover:bg-error/90 text-text-inverse shadow-md hover:shadow-lg"
            }`}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full transition-all duration-200 ${
              isScreenSharing 
                ? "bg-primary hover:bg-primary/90 text-text-inverse shadow-md hover:shadow-lg" 
                : "bg-surface-muted hover:bg-surface-subtle text-text shadow-md hover:shadow-lg"
            }`}
          >
            <Monitor className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleMobileChatToggle}
            className={`w-12 h-12 rounded-full transition-all duration-200 ${
              (isChatOpen || mobileActivePanel === 'chat') 
                ? "bg-primary hover:bg-primary/90 text-text-inverse shadow-md hover:shadow-lg" 
                : "bg-surface-muted hover:bg-surface-subtle text-text shadow-md hover:shadow-lg"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>

          {/* Mobile Content Toggle Button */}
          {isMobile && (
            <Button
              onClick={handleMobileContentToggle}
              className={`w-12 h-12 rounded-full transition-all duration-200 ${
                mobileActivePanel === 'content' 
                  ? "bg-primary hover:bg-primary/90 text-text-inverse shadow-md hover:shadow-lg" 
                  : "bg-surface-muted hover:bg-surface-subtle text-text shadow-md hover:shadow-lg"
              }`}
            >
              <FileText className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 
