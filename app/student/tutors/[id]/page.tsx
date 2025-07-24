'use client'

import React from 'react'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import RequireEmailVerification from '@/app/components/RequireEmailVerification'
import DashboardSidebar from '@/app/student/dashboard/components/DashboardSidebar'
import TutorProfile from '@/app/components/TutorProfile'
import { useAuth } from '@/lib/AuthContext'

interface TutorProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default function StudentTutorProfilePage({ params }: TutorProfilePageProps) {
  const { user } = useAuth()
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
                        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Layout>
        </RequireEmailVerification>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-token-surface-accent-light via-token-surface to-token-surface-accent min-h-screen">
            <div className="max-w-7xl mx-auto">
              {/* Main Content with Sidebar - Use flex for large screens */}
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
                    {/* Breadcrumb navigation */}
                    <div className="mb-6">
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

                    {/* Tutor Profile Content */}
                    <TutorProfile tutorId={tutorId} showSidebar={false} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  );
} 