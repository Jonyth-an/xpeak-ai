'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '../../AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, Button, Text, Textarea, Select } from '@/app/components/ui';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  Calendar,
  Globe,
  FileText,
  Video,
  Image,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  Heart,
  Star,
  Eye,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface TutorApplication {
  id: string;
  user_email: string;
  full_name: string;
  display_name: string;
  native_language: string;
  accent: string;
  birth_country: string;
  current_country: string;
  timezone: string;
  introduction: string;
  education: string;
  teaching_experience: string;
  weekly_hours: string;
  motivation: string;
  linkedin: string;
  social_media: string;
  languages_spoken: { language: string; fluency: string }[];
  profile_photos: string[];
  certificates: string[];
  certificate_other: string;
  certificate_files: string[];
  teaching_screenshot: string;
  demo_video: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'waitlist';
  created_at: string;
  updated_at: string;
  reviewer_notes?: string;
  rejection_reason?: string;
  waitlist_reason?: string;
  reviewer_id?: string;
  reviewer_email?: string;
  reviewed_at?: string;
  avatar_url?: string;
}

export default function TutorApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { roles } = useRoles();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<TutorApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [waitlistReason, setWaitlistReason] = useState('');
  const [updating, setUpdating] = useState(false);

  const applicationId = params.id as string;

  useEffect(() => {
    checkAdminAccess();
  }, [user, roles]);

  useEffect(() => {
    if (isAdmin && applicationId) {
      loadApplication();
    }
  }, [isAdmin, applicationId]);

  const checkAdminAccess = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const adminStatus = roles.includes('admin');
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const loadApplication = async () => {
    try {
      const response = await fetch(`/api/admin/tutor-applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
        setReviewNotes(data.application.reviewer_notes || '');
        setRejectionReason(data.application.rejection_reason || '');
        setWaitlistReason(data.application.waitlist_reason || '');
      }
    } catch (error) {
      console.error('Error loading application:', error);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/tutor-applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes,
          rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined,
          waitlistReason: newStatus === 'waitlist' ? waitlistReason : undefined
        })
      });

      if (response.ok) {
        await loadApplication();
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-token-warning';
      case 'reviewing': return 'text-token-info';
      case 'approved': return 'text-token-success';
      case 'rejected': return 'text-token-error';
      case 'waitlist': return 'text-token-accent';
      default: return 'text-token-text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewing': return <Eye className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'waitlist': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-token-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-token-error">
              Access Denied
            </Text>
            <Text variant="body" className="text-token-text-secondary mb-6">
              You don&apos;t have permission to access this page.
            </Text>
            <Link href="/admin/dashboard">
              <Button variant="primary">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!application) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-token-surface-subtle flex items-center justify-center">
          <div className="text-center">
            <Text variant="h1" as="h1" className="mb-4 text-token-error">
              Application Not Found
            </Text>
            <Text variant="body" className="text-token-text-secondary mb-6">
              The requested application could not be found.
            </Text>
            <Link href="/admin/tutor-applications">
              <Button variant="primary">
                Back to Applications
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin/tutor-applications">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Applications
                  </Button>
                </Link>
                <div>
                  <Text variant="h1" as="h1" className="mb-2 text-token-primary">
                    {application.full_name}
                  </Text>
                  <Text variant="lead" className="text-token-text-secondary">
                    Tutor Application Review
                  </Text>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`flex items-center ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <Text variant="body" className={`ml-2 ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Text>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-token-primary mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Personal Information</Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Full Name</Text>
                    <Text variant="body">{application.full_name}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Display Name</Text>
                    <Text variant="body">{application.display_name}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Email</Text>
                    <Text variant="body">{application.user_email}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Timezone</Text>
                    <Text variant="body">{application.timezone}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Birth Country</Text>
                    <Text variant="body">{application.birth_country}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Current Country</Text>
                    <Text variant="body">{application.current_country}</Text>
                  </div>
                </div>
              </Card>

              {/* Language Information */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <Globe className="w-5 h-5 text-token-primary mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Language Information</Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Native Language</Text>
                    <Text variant="body">{application.native_language}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Accent</Text>
                    <Text variant="body">{application.accent}</Text>
                  </div>
                </div>
                
                {application.languages_spoken && application.languages_spoken.length > 0 && (
                  <div>
                    <Text variant="small" className="text-token-text-secondary mb-2">Languages Spoken</Text>
                    <div className="space-y-2">
                      {application.languages_spoken.map((lang, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-token-surface-subtle rounded">
                          <Text variant="body">{lang.language}</Text>
                          <Text variant="small" className="text-token-text-secondary">{lang.fluency}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Education & Experience */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <GraduationCap className="w-5 h-5 text-token-primary mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Education & Experience</Text>
                </div>
                <div className="space-y-4">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Education</Text>
                    <Text variant="body">{application.education}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Teaching Experience</Text>
                    <Text variant="body">{application.teaching_experience}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Weekly Hours Available</Text>
                    <Text variant="body">{application.weekly_hours}</Text>
                  </div>
                </div>
              </Card>

              {/* Motivation */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <Heart className="w-5 h-5 text-token-primary mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Motivation</Text>
                </div>
                <Text variant="body">{application.motivation}</Text>
              </Card>

              {/* Social Links */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <Star className="w-5 h-5 text-token-primary mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Social Links</Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">LinkedIn</Text>
                    <Text variant="body">{application.linkedin || 'Not provided'}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Social Media</Text>
                    <Text variant="body">{application.social_media || 'Not provided'}</Text>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-6 bg-token-surface border border-token">
                <Text variant="h3" as="h3" className="text-token-primary mb-4">Review Actions</Text>
                
                <div className="space-y-3">
                  {application.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStatusChange('reviewing')}
                        disabled={updating}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Start Review
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStatusChange('approved')}
                        disabled={updating}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStatusChange('rejected')}
                        disabled={updating}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {application.status === 'reviewing' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStatusChange('approved')}
                        disabled={updating}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStatusChange('rejected')}
                        disabled={updating}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStatusChange('waitlist')}
                        disabled={updating}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Waitlist
                      </Button>
                    </>
                  )}
                </div>
              </Card>

              {/* Review Notes */}
              <Card className="p-6 bg-token-surface border border-token">
                <Text variant="h3" as="h3" className="text-token-primary mb-4">Review Notes</Text>
                <Textarea
                  placeholder="Add review notes..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mb-4"
                  rows={4}
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleStatusChange(application.status)}
                  disabled={updating}
                >
                  Save Notes
                </Button>
              </Card>

              {/* Application Info */}
              <Card className="p-6 bg-token-surface border border-token">
                <Text variant="h3" as="h3" className="text-token-primary mb-4">Application Info</Text>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-token-text-muted mr-2" />
                    <div>
                      <Text variant="small" className="text-token-text-secondary">Created</Text>
                      <Text variant="body">{new Date(application.created_at).toLocaleDateString()}</Text>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-token-text-muted mr-2" />
                    <div>
                      <Text variant="small" className="text-token-text-secondary">Last Updated</Text>
                      <Text variant="body">{new Date(application.updated_at).toLocaleDateString()}</Text>
                    </div>
                  </div>
                  {application.reviewer_email && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-token-text-muted mr-2" />
                      <div>
                        <Text variant="small" className="text-token-text-secondary">Reviewed by</Text>
                        <Text variant="body">{application.reviewer_email}</Text>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 