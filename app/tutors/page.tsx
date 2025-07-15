'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';
import { TutorApiService } from '@/lib/services/apiService';
import TutorCard from '../components/molecules/TutorCard';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';

export default function TutorsPage() {
  const { user } = useAuth();
  const { roles, loading: rolesLoading } = useRoles();
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log('TutorsPage - User:', user?.email);
    console.log('TutorsPage - Roles:', roles);
    console.log('TutorsPage - Roles loading:', rolesLoading);
  }, [user, roles, rolesLoading]);

  useEffect(() => {
    if (!rolesLoading && roles.includes('student')) {
      TutorApiService.getAllTutorsForStudents().then(res => {
        if (res.data && typeof res.data === 'object' && 'tutors' in res.data && Array.isArray((res.data as any).tutors)) {
          setTutors((res.data as any).tutors);
        } else {
          setError(res.error || 'Failed to load tutors');
        }
        setLoading(false);
      });
    } else if (!rolesLoading) {
      setLoading(false);
    }
  }, [roles, rolesLoading]);

  // Show loading while roles are being fetched
  if (rolesLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user roles...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Redirect non-students or show access denied
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view tutors</h1>
            <p className="text-gray-600">You need to be logged in to browse and book tutors.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!roles.includes('student')) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">This page is only available for students.</p>
            <p className="text-sm text-gray-500 mt-2">Your roles: {roles.join(', ') || 'none'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tutors...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Tutors</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-surface">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Book a Real Tutor
              </h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                Browse approved tutors and book a session. Click a card to view full profile and availability.
              </p>
            </div>
          </div>
        </div>

        {/* Tutor Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!tutors.length ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-4">No Tutors Available</h2>
              <p className="text-gray-600">Check back later for available tutors.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {tutors.map((tutor, idx) => (
                <TutorCard
                  key={tutor.id || idx}
                  avatar={tutor.profile_image_url}
                  name={tutor.name}
                  flag={tutor.accent}
                  tags={tutor.certificates}
                  rating={tutor.average_rating || 5.0}
                  reviews={tutor.review_count || 0}
                  buttonText="View Profile"
                  onButtonClick={() => router.push(`/tutors/${tutor.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 