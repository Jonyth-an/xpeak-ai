'use client';

import { useEffect, useState, useRef } from 'react';
import { Button, Card, Text } from '@/app/components/ui';
import { Video, Mic, MicOff, Phone, AlertCircle, ArrowLeft } from 'lucide-react';

interface VideoRoomProps {
  lessonId: string;
  onJoinLesson: () => void;
  onBack: () => void;
}

export default function VideoRoom({ lessonId, onJoinLesson, onBack }: VideoRoomProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinAttempts, setJoinAttempts] = useState(0);
  const maxJoinAttempts = 3;

  const joinVideoCall = async () => {
    if (isJoining || joinAttempts >= maxJoinAttempts) return;
    
    setIsJoining(true);
    setError(null);

    try {
      console.log('🎥 Joining video call for lesson:', lessonId);
      
      // Get authentication token
      const { data: { session } } = await import('@/lib/supabaseClient').then(m => m.supabase.auth.getSession());
      if (!session) {
        throw new Error('No authentication session found');
      }
      
      // Create a consistent channel name for all users in the same lesson
      const lessonShortId = lessonId.replace(/-/g, '').substring(0, 8);
      const channelName = `lesson_${lessonShortId}`;
      
      console.log('📡 Generated channel name:', channelName, 'Length:', channelName.length);

      const response = await fetch(`/api/lessons/${lessonId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to join lesson: ${response.statusText}`);
      }

      const joinData = await response.json();
      console.log('✅ Successfully joined lesson:', joinData);

      // Call the onJoinLesson callback to proceed to the lesson interface
      onJoinLesson();

    } catch (err) {
      console.error('❌ Error joining video call:', err);
      setError(err instanceof Error ? err.message : 'Failed to join video call');
      setJoinAttempts(prev => prev + 1);
    } finally {
      setIsJoining(false);
    }
  };

  const retryJoin = () => {
    setError(null);
    setJoinAttempts(0);
    joinVideoCall();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="tertiary"
              size="sm"
              onClick={onBack}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">Join Video Call</h2>
              <p className="text-gray-400 text-sm">Connect to your lesson</p>
            </div>
          </div>

          {/* Content */}
          <div className="text-center">
            {error ? (
              <div className="mb-6">
                <div className="text-red-400 mb-4">
                  <AlertCircle className="w-12 h-12 mx-auto" />
                </div>
                <Text className="text-red-400 mb-4">{error}</Text>
                {joinAttempts < maxJoinAttempts && (
                  <Button onClick={retryJoin} className="w-full mb-3">
                    Try Again
                  </Button>
                )}
                <Button variant="outline" onClick={onBack} className="w-full">
                  Go Back
                </Button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="text-blue-400 mb-4">
                  <Video className="w-12 h-12 mx-auto" />
                </div>
                <Text className="text-white mb-4">
                  Ready to join your video lesson?
                </Text>
                <Text className="text-gray-400 text-sm mb-6">
                  Make sure your camera and microphone are working properly.
                </Text>
                <Button 
                  onClick={joinVideoCall} 
                  disabled={isJoining}
                  className="w-full"
                >
                  {isJoining ? 'Joining...' : 'Join Lesson'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 