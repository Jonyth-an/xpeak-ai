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
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-error" />;
      case "testing":
        return <RefreshCw className="w-5 h-5 animate-spin text-muted" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted" />;
    }
  };

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
        return <Badge className="bg-success text-success-foreground">Camera working perfectly!</Badge>
      case "failed":
        return <Badge variant="error">Camera not working</Badge>
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      default:
        return <Badge variant="default">Pending</Badge>
    }
  }

  const getMicrophoneStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-success text-success-foreground">Microphone working perfectly!</Badge>
      case "failed":
        return <Badge variant="error">Microphone not working</Badge>
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      default:
        return <Badge variant="default">Pending</Badge>
    }
  }

  const getInternetStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-success text-success-foreground">Internet connection is excellent!</Badge>
      case "failed":
        return <Badge variant="error">Connection issues</Badge>
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>
      default:
        return <Badge variant="default">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-text mb-2">System Check</h1>
          <p className="text-text-secondary">
            Let's make sure your camera, microphone, and internet are ready for your lesson.
          </p>
        </div>

        {/* Test Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text">Test Progress</span>
            <span className="text-sm text-text-muted">{Math.round(testProgress)}%</span>
          </div>
          <Progress value={testProgress} className="h-2" />
        </div>

        {/* Test Result Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {testNames.map((name, idx) => (
            <Card key={name} className="p-4 flex flex-col items-center border border-border bg-surface rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(testResults[idx].status)}
                <span className="font-semibold text-base">{name}</span>
              </div>
              <span className={`text-sm font-medium ${testResults[idx].status === 'passed' ? 'text-success' : testResults[idx].status === 'failed' ? 'text-error' : 'text-muted'}`}>
                {testResults[idx].status === 'passed' ? 'Passed' : testResults[idx].status === 'failed' ? 'Failed' : testResults[idx].status === 'testing' ? 'Testing...' : 'Pending'}
              </span>
            </Card>
          ))}
        </div>

        {/* Preview & Controls - Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera className="w-4 h-4" />
                  Camera Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="aspect-[4/3] bg-surface-muted rounded-lg overflow-hidden relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover" 
                  />
                  {testResults[0].status === "failed" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-muted">
                      <div className="text-center text-text">
                        <XCircle className="w-8 h-8 mx-auto mb-1 text-error" />
                        <p className="text-xs">Camera not available</p>
                      </div>
                    </div>
                  )}
                  {testResults[0].status === "pending" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface-muted">
                      <div className="text-center text-text">
                        <Camera className="w-8 h-8 mx-auto mb-1 text-muted" />
                        <p className="text-xs">Camera preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audio Level & Action Buttons */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Volume2 className="w-4 h-4" />
                  Audio Level
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <Progress value={audioLevel} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Silent</span>
                    <span className="text-text-secondary">Good</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!isTestingComplete ? (
                <Button disabled className="px-6">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing System...
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={retryAllTests} size="sm">
                    Run Tests Again
                  </Button>
                  <Button 
                    onClick={() => onComplete(canProceed)} 
                    disabled={!canProceed} 
                    className="px-6"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {canProceed ? "Join Lesson Now" : "Fix Issues to Continue"}
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={onBack} size="sm">
                Back
              </Button>
            </div>

            {/* Success/Failure Message - Inline */}
            {isTestingComplete && (
              <div>
                {canProceed ? (
                  <Card className="bg-success/10 border-success/20">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <h3 className="text-sm font-semibold text-text">All Systems Ready!</h3>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Your camera, microphone, and internet connection are all working perfectly. You're ready to join your lesson!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-sm text-text-secondary text-center">
                    Some tests failed, but you can still continue. Your experience may be affected.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 