'use client'

import React from 'react'
import { notFound } from 'next/navigation'
import TutorProfile from '@/app/components/TutorProfile'

interface TutorProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default function StudentTutorProfilePage({ params }: TutorProfilePageProps) {
  const [tutorId, setTutorId] = React.useState<string | null>(null);
  const [tutor, setTutor] = React.useState<any>(null);

  React.useEffect(() => {
    const loadParams = async () => {
      const { id } = await params;
      setTutorId(id);
    };
    loadParams();
  }, [params]);

  React.useEffect(() => {
    if (!tutorId) return;
    
    const loadTutorData = async () => {
      try {
        const response = await fetch(`/api/tutors/${tutorId}/profile`);
        
        if (!response.ok) {
          notFound();
        }

        const tutorData = await response.json();
        setTutor(tutorData);
      } catch (error) {
        console.error('Error loading tutor profile:', error);
        notFound();
      }
    };

    loadTutorData();
  }, [tutorId]);

  if (!tutorId || !tutor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Student-specific breadcrumb navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <a 
              href="/student/dashboard" 
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Dashboard
            </a>
            <span>/</span>
            <a 
              href="/student/tutors" 
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Tutors
            </a>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {tutor.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Reuse the existing TutorProfile component */}
      <TutorProfile tutorId={tutorId} showSidebar={false} />
    </div>
  );
} 