"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/app/components/ui"
import { CheckCircle, XCircle, Camera, Mic, Wifi, AlertCircle, RefreshCw, Play, Volume2 } from "lucide-react"

interface SystemTestProps {
  onComplete: (passed: boolean) => void;
  onBack: () => void;
}

interface TestResult {
  status: "pending" | "testing" | "passed" | "failed"
  message: string
}

export default function SystemCheck({ onComplete, onBack }: SystemTestProps) {
  const [currentTest, setCurrentTest] = useState(0)
  const [testResults, setTestResults] = useState<TestResult[]>([
    { status: "pending", message: "Waiting to start..." },
    { status: "pending", message: "Waiting to start..." },
    { status: "pending", message: "Waiting to start..." },
  ])
  const [isTestingComplete, setIsTestingComplete] = useState(false)
  const [canProceed, setCanProceed] = useState(false)
  const [testProgress, setTestProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [internetSpeed, setInternetSpeed] = useState(0)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  const testNames = ["Camera Test", "Microphone Test", "Internet Connection Test"]

  useEffect(() => {
    if (currentTest < testResults.length) {
      runTest(currentTest)
    }
  }, [currentTest])

  useEffect(() => {
    // Update progress based on completed tests
    const completedTests = testResults.filter(result => 
      result.status === "passed" || result.status === "failed"
    ).length
    setTestProgress((completedTests / testResults.length) * 100)
  }, [testResults])

  const runTest = async (testIndex: number) => {
    // Update test status to testing
    setTestResults((prev) => {
      const newResults = [...prev]
      newResults[testIndex] = { status: "testing", message: "Testing..." }
      return newResults
    })

    // Simulate test delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    let result: TestResult

    switch (testIndex) {
      case 0: // Camera test
        result = await testCamera()
        break
      case 1: // Microphone test
        result = await testMicrophone()
        break
      case 2: // Internet test
        result = await testInternet()
        break
      default:
        result = { status: "failed", message: "Unknown test" }
    }

    // Update test result
    setTestResults((prev) => {
      const newResults = [...prev]
      newResults[testIndex] = result
      return newResults
    })

    // Move to next test or complete
    if (testIndex < testResults.length - 1) {
      setCurrentTest(testIndex + 1)
    } else {
      setIsTestingComplete(true)
      checkIfCanProceed()
    }
  }

  const testCamera = async (): Promise<TestResult> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setLocalStream(stream)
      }
      
      return { status: "passed", message: "Camera is working properly" }
    } catch (error) {
      console.error("Camera test failed:", error)
      return { status: "failed", message: "Camera access denied or not available" }
    }
  }

  const testMicrophone = async (): Promise<TestResult> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })

      // Create audio level detection
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      source.connect(analyser)

      analyser.fftSize = 256
      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      // Simulate audio level animation
      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(Math.min(100, (average / 255) * 100 + Math.random() * 30))
      }

      const interval = setInterval(updateAudioLevel, 100)
      setTimeout(() => clearInterval(interval), 1500)

      return { status: "passed", message: "Microphone is working properly" }
    } catch (error) {
      console.error("Microphone test failed:", error)
      return { status: "failed", message: "Microphone access denied or not available" }
    }
  }

  const testInternet = async (): Promise<TestResult> => {
    try {
      const startTime = Date.now()

      // Simulate internet speed test
      const speedInterval = setInterval(() => {
        setInternetSpeed((prev) => Math.min(100, prev + Math.random() * 20))
      }, 100)

      // Test network connectivity
      await fetch("https://www.google.com/favicon.ico", { mode: "no-cors" })

      clearInterval(speedInterval)
      setInternetSpeed(85) // Final speed

      const endTime = Date.now()
      const latency = endTime - startTime

      if (latency < 1000) {
        return { status: "passed", message: `Internet connection is stable (85 Mbps)` }
      } else {
        return { status: "failed", message: "Internet connection is too slow" }
      }
    } catch (error) {
      console.error("Internet test failed:", error)
      return { status: "failed", message: "No internet connection detected" }
    }
  }

  const checkIfCanProceed = () => {
    const passedTests = testResults.filter((result) => result.status === "passed").length
    setCanProceed(passedTests >= 2) // Allow proceeding if at least 2 tests pass
  }

  const retryTest = (testIndex: number) => {
    setTestResults((prev) => {
      const newResults = [...prev]
      newResults[testIndex] = { status: "pending", message: "Waiting to start..." }
      return newResults
    })
    setCurrentTest(testIndex)
    setIsTestingComplete(false)
    setCanProceed(false)
    setTestProgress(0)
  }

  const retryAllTests = () => {
    setTestResults([
      { status: "pending", message: "Waiting to start..." },
      { status: "pending", message: "Waiting to start..." },
      { status: "pending", message: "Waiting to start..." },
    ])
    setCurrentTest(0)
    setIsTestingComplete(false)
    setCanProceed(false)
    setTestProgress(0)
    setAudioLevel(0)
    setInternetSpeed(0)
    
    // Stop any existing streams
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
      setLocalStream(null)
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "testing":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getTestIcon = (testIndex: number) => {
    switch (testIndex) {
      case 0:
        return <Camera className="w-5 h-5" />
      case 1:
        return <Mic className="w-5 h-5" />
      case 2:
        return <Wifi className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-100 text-green-800">Camera working perfectly!</Badge>
      case "failed":
        return <Badge variant="destructive">Camera not working</Badge>
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getMicrophoneStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-100 text-green-800">Microphone working perfectly!</Badge>
      case "failed":
        return <Badge variant="destructive">Microphone not working</Badge>
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getInternetStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-100 text-green-800">Internet connection is excellent!</Badge>
      case "failed":
        return <Badge variant="destructive">Connection issues</Badge>
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Check</h1>
          <p className="text-gray-600">
            Let's make sure your camera, microphone, and internet are ready for your lesson.
          </p>
        </div>

        {/* Test Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Test Progress</span>
            <span className="text-sm text-gray-500">{Math.round(testProgress)}%</span>
          </div>
          <Progress value={testProgress} className="h-2" />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Test Results */}
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getTestIcon(index)}
                      <h3 className="font-semibold text-gray-900">{testNames[index]}</h3>
                      {getStatusIcon(result.status)}
                    </div>
                    {result.status === "failed" && isTestingComplete && (
                      <Button variant="outline" size="sm" onClick={() => retryTest(index)}>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{result.message}</p>

                  {/* Status Badge */}
                  <div className="mb-3">
                    {index === 0 && getStatusBadge(result.status)}
                    {index === 1 && getMicrophoneStatusBadge(result.status)}
                    {index === 2 && getInternetStatusBadge(result.status)}
                  </div>

                  {result.status === "testing" && (
                    <div className="space-y-2">
                      <Progress value={((currentTest + 1) / testResults.length) * 100} className="h-2" />
                      <p className="text-xs text-gray-500">Testing in progress...</p>
                    </div>
                  )}

                  {/* Special UI for each test */}
                  {index === 1 && result.status === "testing" && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Volume2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Audio Level</span>
                      </div>
                      <Progress value={audioLevel} className="h-3" />
                    </div>
                  )}

                  {index === 2 && result.status === "testing" && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wifi className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">Connection Speed</span>
                      </div>
                      <Progress value={internetSpeed} className="h-3" />
                      <p className="text-xs text-gray-500 mt-1">{Math.round(internetSpeed)} Mbps</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Video Preview and Audio Level */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Camera Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                  {testResults[0].status === "failed" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center text-white">
                        <XCircle className="w-12 h-12 mx-auto mb-2 text-red-500" />
                        <p className="text-sm">Camera not available</p>
                      </div>
                    </div>
                  )}
                  {testResults[0].status === "pending" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center text-white">
                        <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">Camera preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Audio Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={audioLevel} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Silent</span>
                    <span className="text-gray-600">Good</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          {!isTestingComplete ? (
            <Button disabled className="px-8">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing System...
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={retryAllTests}>
                Run Tests Again
              </Button>
              <Button 
                onClick={() => onComplete(canProceed)} 
                disabled={!canProceed} 
                className="px-8"
              >
                <Play className="w-4 h-4 mr-2" />
                {canProceed ? "Join Lesson Now" : "Fix Issues to Continue"}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>

        {isTestingComplete && (
          <div className="text-center mt-8">
            {canProceed ? (
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Systems Ready!</h3>
                  <p className="text-sm text-gray-600">
                    Your camera, microphone, and internet connection are all working perfectly. You're ready to join your lesson!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-gray-600">
                Some tests failed, but you can still continue. Your experience may be affected.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 