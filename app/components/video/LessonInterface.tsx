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
} from "lucide-react"

interface LessonInterfaceProps {
  onEndLesson: () => void
  lesson?: any
  user?: any
}

interface ChatMessage {
  id: number
  sender: "student" | "tutor"
  message: string
  timestamp: string
}

export default function LessonInterface({ onEndLesson, lesson, user }: LessonInterfaceProps) {
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isContentMaximized, setIsContentMaximized] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "tutor",
      message: "Hello! Welcome to our lesson. How are you today?",
      timestamp: "2:30 PM",
    },
    {
      id: 2,
      sender: "student",
      message: "Hi! I'm doing well, thank you. Ready to learn!",
      timestamp: "2:31 PM",
    },
    {
      id: 3,
      sender: "tutor",
      message: "Great! Let's start with some conversation practice.",
      timestamp: "2:31 PM",
    },
  ])
  const [lessonTime, setLessonTime] = useState(0)
  const studentVideoRef = useRef<HTMLVideoElement>(null)
  const tutorVideoRef = useRef<HTMLVideoElement>(null)
  const [isContentVisible, setIsContentVisible] = useState(true)

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

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage: ChatMessage = {
        id: chatMessages.length + 1,
        sender: "student",
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setChatMessages([...chatMessages, newMessage])
      setChatMessage("")
    }
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        setIsScreenSharing(true)
        // In a real implementation, you would handle the screen share stream
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
        }
      } catch (error) {
        console.error("Error starting screen share:", error)
      }
    } else {
      setIsScreenSharing(false)
    }
  }

  // Get participant names
  const tutorName = lesson?.tutor?.display_name || "Tutor"
  const studentName = user?.email?.split('@')[0] || "Student"
  const tutorInitials = tutorName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
  const studentInitials = studentName.split(' ').map((n: string) => n[0]).join('').toUpperCase()

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Live Lesson</span>
            </div>
            <Badge className="bg-blue-600 text-white border-blue-500">{formatTime(lessonTime)}</Badge>
            <div className="flex items-center gap-2 text-white">
              <Users className="w-4 h-4" />
              <span className="text-sm">{tutorName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isContentVisible && (
                          <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => setIsContentVisible(true)}
            >
              <FileText className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={onEndLesson} className="bg-red-600 hover:bg-red-700">
            <Phone className="w-4 h-4 mr-2" />
            End Lesson
          </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content Area */}
        <div className={`flex-1 flex ${isChatOpen ? "mr-80" : ""} transition-all duration-300`}>
          {isContentVisible ? (
            <>
              {/* Video Streams - With Content */}
              <div
                className={`${isContentMaximized ? "w-1/4" : "w-1/3"} flex flex-col gap-4 p-4 transition-all duration-300`}
              >
                {/* Tutor Video */}
                <Card className="bg-gray-800 border-gray-700 flex-1">
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                          {tutorInitials}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-blue-600 text-white border-blue-500">{tutorName} (Tutor)</Badge>
                      </div>
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <Video className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Student Video */}
                <Card className="bg-gray-800 border-gray-700 flex-1">
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                          {studentInitials}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-green-600 text-white border-green-500">You (Student)</Badge>
                      </div>
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${isMicOn ? "bg-green-600" : "bg-red-600"}`}
                        >
                          {isMicOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
                        </div>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${isCameraOn ? "bg-green-600" : "bg-red-600"}`}
                        >
                          {isCameraOn ? (
                            <Video className="w-4 h-4 text-white" />
                          ) : (
                            <VideoOff className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lesson Content Area */}
              <div className={`${isContentMaximized ? "flex-1" : "flex-1"} flex flex-col p-4`}>
                <Card className="flex-1 bg-white border-gray-200">
                  <CardContent className="p-0 h-full">
                    <div className="h-full flex flex-col">
                      {/* Content Header */}
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">Lesson Materials</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setIsContentMaximized(!isContentMaximized)}>
                            {isContentMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setIsContentVisible(false)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Content Display */}
                      <div className="flex-1 p-8 bg-gradient-to-br from-blue-50 to-purple-50">
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                              <FileText className="w-16 h-16 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Conversation Practice</h3>
                            <p className="text-gray-600 mb-6 max-w-md">
                              Today we'll practice everyday conversations. Let's start with introductions and move on to
                              talking about hobbies and interests.
                            </p>
                            <div className="space-y-4">
                              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Topic 1: Introductions</h4>
                                <p className="text-gray-600 text-sm">
                                  Practice introducing yourself and asking about others
                                </p>
                              </div>
                              <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-2">Topic 2: Hobbies & Interests</h4>
                                <p className="text-gray-600 text-sm">Discuss what you like to do in your free time</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Screen Share Indicator */}
                      {isScreenSharing && (
                        <div className="p-3 bg-blue-600 text-white text-center">
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
              <Card className="h-full bg-gray-800 border-gray-700">
                <CardContent className="p-0 h-full">
                  <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
                    {/* Video Content Area - Leave space at bottom for transcript */}
                    <div className="h-[calc(100%-80px)] flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                        {tutorInitials}
                      </div>
                    </div>

                    {/* Tutor Info */}
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-blue-600 text-white border-blue-500 text-lg px-4 py-2">{tutorName} (Tutor)</Badge>
                    </div>

                    {/* Tutor Status Icons */}
                    <div className="absolute top-6 right-6 flex gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Screen Share Indicator */}
                    {isScreenSharing && (
                      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          <span className="text-sm font-medium">Screen sharing active</span>
                        </div>
                      </div>
                    )}

                    {/* Reserved Space for Future Transcript */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/20 backdrop-blur-sm border-t border-white/10">
                      <div className="h-full flex items-center justify-center text-white/60 text-sm">
                        {/* This space is reserved for real-time audio transcript */}
                        <span className="italic">Transcript will appear here...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Video - Picture in Picture Style */}
              <div className="absolute bottom-8 right-8 w-64 h-48">
                <Card className="h-full bg-gray-800 border-gray-700 shadow-2xl">
                  <CardContent className="p-0 h-full">
                    <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {studentInitials}
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-green-600 text-white border-green-500 text-xs">You</Badge>
                      </div>
                      <div className="absolute bottom-3 right-3 flex gap-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${isMicOn ? "bg-green-600" : "bg-red-600"}`}
                        >
                          {isMicOn ? <Mic className="w-3 h-3 text-white" /> : <MicOff className="w-3 h-3 text-white" />}
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${isCameraOn ? "bg-green-600" : "bg-red-600"}`}
                        >
                          {isCameraOn ? (
                            <Video className="w-3 h-3 text-white" />
                          ) : (
                            <VideoOff className="w-3 h-3 text-white" />
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

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Chat</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === "student" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "student" ? "text-blue-100" : "text-gray-500"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`w-12 h-12 rounded-full ${
              isCameraOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsMicOn(!isMicOn)}
            className={`w-12 h-12 rounded-full ${
              isMicOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full ${
              isScreenSharing ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-12 h-12 rounded-full ${
              isChatOpen ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
} 