'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Text, Button } from '@/app/components/ui';

export default function TutorOnboardingVideoTest() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [audioTested, setAudioTested] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  useEffect(() => {
    // Request camera and mic access
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        setMediaError('Could not access camera or microphone. Please check your browser permissions.');
      });
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleAudioTest = () => {
    setAudioPlaying(true);
    const audio = new Audio('/audio/test-sound.mp3'); // Use a short test sound
    audio.play();
    audio.onended = () => {
      setAudioPlaying(false);
      setAudioTested(true);
    };
    audio.onerror = () => {
      setAudioPlaying(false);
      setAudioTested(false);
      setMediaError('Audio test failed.');
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-token-surface">
      <Card className="max-w-lg w-full p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Text variant="h2" className="text-token-primary mb-2">Video & Audio Test</Text>
          <Text variant="body" className="text-token-text-primary">
            Step 5 of 5: Please test your camera and microphone to ensure a smooth teaching experience.
          </Text>
          <div className="w-full bg-token-border h-2 rounded mt-4 mb-6">
            <div className="bg-token-primary h-2 rounded" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="mb-4">
          <Text variant="subtitle" className="mb-2">Camera Preview</Text>
          <div className="w-full flex justify-center mb-2">
            <video ref={videoRef} autoPlay playsInline muted className="rounded border border-token-border w-64 h-40 bg-black" />
          </div>
          {mediaError && <Text variant="caption" className="text-red-500 mb-2">{mediaError}</Text>}
        </div>
        <div className="mb-6">
          <Text variant="subtitle" className="mb-2">Audio Test</Text>
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="mb-2"
            onClick={handleAudioTest}
            disabled={audioPlaying}
          >
            {audioPlaying ? 'Playing...' : 'Play Test Sound'}
          </Button>
          {audioTested && <Text variant="caption" className="text-green-600">Audio test successful!</Text>}
        </div>
        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => router.push('/tutor/dashboard')}
          >
            Save & Finish
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => router.push('/tutor/dashboard')}
          >
            Skip for Now
          </Button>
        </div>
      </Card>
    </div>
  );
} 