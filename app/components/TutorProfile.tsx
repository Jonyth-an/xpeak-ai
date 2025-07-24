'use client'

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import MessageTutorButton from './MessageTutorButton';
import RealTimeCalendar from '../tutors/[id]/components/RealTimeCalendar';

interface TutorProfileProps {
  tutorId: string;
  showSidebar?: boolean;
  showBreadcrumbs?: boolean;
}

async function fetchTutor(id: string) {
  try {
    console.log('🔍 Client-side fetchTutor called with ID:', id);
    
    const response = await fetch(`/api/tutors/${id}/profile`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ API error:', errorData);
      return { error: errorData.error || 'Tutor not found', tutor: null };
    }

    const data = await response.json();
    console.log('✅ Found tutor via API:', data.tutor);
    
    return { tutor: data.tutor };
  } catch (error) {
    console.log('Error fetching tutor:', error);
    return { error: `Error fetching tutor: ${error instanceof Error ? error.message : String(error)}`, tutor: null };
  }
}

async function fetchTutorAvailability(id: string) {
  try {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    console.log('🔍 Client-side fetchTutorAvailability called with ID:', id, 'month:', month, 'year:', year);
    
    const response = await fetch(`/api/tutors/${id}/availability?month=${month}&year=${year}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ API error:', errorData);
      return { error: errorData.error || 'Failed to fetch availability', calendar: null };
    }

    const data = await response.json();
    console.log('✅ Found availability via API:', data);
    
    return data;
  } catch (error) {
    console.log('Error fetching tutor availability:', error);
    return { error: `Error fetching availability: ${error instanceof Error ? error.message : String(error)}`, calendar: null };
  }
}

export default function TutorProfile({ tutorId, showSidebar = true, showBreadcrumbs = false }: TutorProfileProps) {
  const { user } = useAuth();
  const [tutor, setTutor] = React.useState<any>(null);
  const [availability, setAvailability] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadTutorData = async () => {
      try {
        setLoading(true);
        const [tutorResult, availabilityResult] = await Promise.all([
          fetchTutor(tutorId),
          fetchTutorAvailability(tutorId)
        ]);

        if (tutorResult.error) {
          setError(tutorResult.error);
          return;
        }

        if (!tutorResult.tutor) {
          setError('Tutor data not found');
          return;
        }

        setTutor(tutorResult.tutor);
        setAvailability(availabilityResult);
      } catch (err) {
        setError('Failed to load tutor data');
        console.error('Error loading tutor data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTutorData();
  }, [tutorId]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-token-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-sm text-gray-500">(Check server logs for details.)</p>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-500 mb-4">Tutor data not found</p>
      </div>
    );
  }

  const { calendar, month, year } = availability || { calendar: [], month: 1, year: new Date().getFullYear() };
  const userEmail = user?.email;

  return (
    <div className="w-full">
      {/* Profile Header */}
      <div className="flex gap-6 mb-8">
        {/* Profile Image */}
        <div className="w-24 h-24 rounded-full overflow-hidden bg-token-gray-100 flex-shrink-0">
          <img
            src={tutor.profile_image_url}
            alt={tutor.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{tutor.name}</h2>
            <span className="text-lg">🇺🇸</span>
          </div>
          <div className="text-token-text-secondary mb-3">
            Native Language: English (American Accent)
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold">{tutor.average_rating || 5.0}</span>
              <span className="text-token-text-secondary text-sm">({tutor.review_count || 0} reviews)</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-token-accent">🌐</span>
            <span className="text-token-text-secondary text-sm">
              Also speaks: {tutor.languages_taught?.map((lang: any) => 
                `${lang.language} (${lang.fluency})`
              ).join(', ') || 'English (Fluent)'}
            </span>
          </div>
          
          {/* Message Tutor Button */}
          {user && (
            <div className="mt-4">
              <MessageTutorButton
                tutorId={tutor.id}
                tutorName={tutor.name}
                tutorImage={tutor.profile_image_url}
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
              />
            </div>
          )}
        </div>
      </div>

      {/* Profile Sections */}
      <div className="space-y-8">
        {/* Intro Video */}
        {tutor.intro_video_url && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Intro Video</h3>
            <video
              src={tutor.intro_video_url}
              controls
              className="w-full max-w-md rounded border border-token-border bg-black"
              style={{ minHeight: 180 }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* About Me */}
        {tutor.bio && (
          <div>
            <h3 className="text-xl font-semibold mb-3">About Me</h3>
            <p className="text-token-text-secondary leading-relaxed">
              {tutor.bio}
            </p>
          </div>
        )}

        {/* Teaching Style */}
        {tutor.teaching_style && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Teaching Style</h3>
            <p className="text-token-text-secondary leading-relaxed">
              {tutor.teaching_style}
            </p>
          </div>
        )}

        {/* Education */}
        {tutor.education && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Education</h3>
            <p className="text-token-text-secondary leading-relaxed">
              {tutor.education}
            </p>
          </div>
        )}

        {/* Teaching Certificates */}
        <div>
          <h3 className="text-xl font-semibold mb-3">Teaching Certificates</h3>
          {tutor.certificates && tutor.certificates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tutor.certificates.map((cert: string, i: number) => (
                <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {cert}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-token-text-secondary leading-relaxed">
              No certifications added yet.
            </p>
          )}
        </div>

        {/* Languages I Teach */}
        {tutor.languages_taught && tutor.languages_taught.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Languages I Teach</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.languages_taught.map((lang: any, i: number) => (
                <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {lang.language} ({lang.fluency})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Teaching Focus Areas */}
        {tutor.specializations && tutor.specializations.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Teaching Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.specializations.map((spec: string, i: number) => (
                <span key={i} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Real-time Calendar Section */}
      <div id="calendar-section">
        <RealTimeCalendar 
          tutorId={tutor.id}
          initialCalendar={calendar || []}
          initialMonth={month || 1}
          initialYear={year || new Date().getFullYear()}
        />
      </div>
    </div>
  );
} 