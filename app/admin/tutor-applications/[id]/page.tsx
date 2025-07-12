'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '../../AdminLayout';
import { useAuth } from '@/lib/AuthContext';
import { useRoles } from '@/lib/RolesContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, Button, Text, Textarea, Select } from '@/app/components/ui';
import { StatusBadge } from '@/app/components/StatusBadge';
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
  Download,
  ExternalLink,
  PlayCircle,
  FileCheck,
  Users,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

interface AdminAction {
  action_type: string;
  old_status?: string;
  new_status?: string;
  reviewer_email?: string;
  timestamp: string;
  old_review_notes?: string;
  new_review_notes?: string;
  old_rejection_reason?: string;
  new_rejection_reason?: string;
  old_waitlist_reason?: string;
  new_waitlist_reason?: string;
}

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
  certificates: (string | { url?: string; path?: string; name?: string })[];
  certificate_other: string;
  certificate_files: (string | { url?: string; path?: string; name?: string })[];
  teaching_screenshot: string;
  demo_video: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'waitlist';
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewer_notes?: string;
  rejection_reason?: string;
  waitlist_reason?: string;
  reviewer_id?: string;
  reviewer_email?: string;
  reviewed_at?: string;
  admin_action_history?: AdminAction[];
  avatar_url?: string;
}

// Video Player Component
function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [proxyUrl, setProxyUrl] = useState<string>('');

  useEffect(() => {
    const getProxyUrl = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (token) {
          const url = `/api/admin/video-proxy?url=${encodeURIComponent(videoUrl)}&token=${encodeURIComponent(token)}`;
          setProxyUrl(url);
        }
      } catch (error) {
        console.error('Error getting proxy URL:', error);
      }
    };
    getProxyUrl();
  }, [videoUrl]);

  if (!proxyUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-token-surface-subtle">
        <div className="text-center">
          <Video className="w-12 h-12 text-token-text-muted mx-auto mb-2" />
          <Text variant="small" className="text-token-text-secondary">Loading video...</Text>
        </div>
      </div>
    );
  }

  return (
    <video
      src={proxyUrl}
      controls
      className="w-full h-full object-cover"
      style={{ background: '#000' }}
    >
      Your browser does not support the video tag.
    </video>
  );
}

// Video Download Button Component
function VideoDownloadButton({ videoUrl }: { videoUrl: string }) {
  const handleDownload = async () => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (token) {
        const url = `/api/admin/video-proxy?url=${encodeURIComponent(videoUrl)}&token=${encodeURIComponent(token)}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening video:', error);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <ExternalLink className="w-4 h-4 mr-2" />
      Open in New Tab
    </Button>
  );
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
  const [notesSaved, setNotesSaved] = useState(false);

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
      const response = await fetch(`/api/admin/tutor-applications/${applicationId}`, {
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
      } else {
        console.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!application) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/tutor-applications/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          notesOnly: true,
          reviewNotes
        })
      });

      if (response.ok) {
        await loadApplication();
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000); // Hide success message after 2 seconds
      }
    } catch (error) {
      console.error('Error saving review notes:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                    Back to List
                  </Button>
                </Link>
                <div>
                  <Text variant="h1" as="h1" className="mb-2 text-token-primary">
                    Application Review
                  </Text>
                  <Text variant="body" className="text-token-text-secondary">
                    ID: {application.id.slice(0, 8).toUpperCase()}
                  </Text>
                </div>
              </div>
              <StatusBadge status={application.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-token-primary mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Basic Information</Text>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Display Name</Text>
                    <Text variant="body" className="font-medium">{application.display_name}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Full Legal Name</Text>
                    <Text variant="body" className="font-medium">{application.full_name}</Text>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Native Language</Text>
                    <Text variant="body">{application.native_language}</Text>
                    {application.accent && (
                      <Text variant="small" className="text-token-text-secondary">
                        {application.accent}
                      </Text>
                    )}
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Location</Text>
                    <Text variant="body">{application.current_country}</Text>
                    <Text variant="small" className="text-token-text-secondary">{application.timezone}</Text>
                  </div>
                </div>
              </Card>

              {/* Profile Photos */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <Image className="w-5 h-5 text-token-success mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Profile Photos</Text>
                </div>
                {application.profile_photos && application.profile_photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {application.profile_photos.map((photo, index) => (
                      <div key={index} className="aspect-square bg-token-surface-subtle rounded-lg overflow-hidden">
                        <img 
                          src={photo} 
                          alt={`Profile photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-square bg-token-surface-subtle rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Image className="w-12 h-12 text-token-text-muted mx-auto mb-2" />
                      <Text variant="small" className="text-token-text-secondary">No photos uploaded</Text>
                    </div>
                  </div>
                )}
              </Card>

              {/* Language Skills */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <Globe className="w-5 h-5 text-token-info mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Language Skills</Text>
                </div>
                {application.languages_spoken && application.languages_spoken.length > 0 ? (
                  <div className="space-y-3">
                    {application.languages_spoken.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-token-surface-subtle rounded-lg">
                        <Text variant="body" className="font-medium">{lang.language}</Text>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          lang.fluency === 'Fluent' ? 'bg-token-success-light text-token-success' :
                          lang.fluency === 'Intermediate' ? 'bg-token-info-light text-token-info' :
                          'bg-token-warning-light text-token-warning'
                        }`}>
                          {lang.fluency}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text variant="body" className="text-token-text-secondary">No additional languages specified</Text>
                )}
              </Card>

              {/* Self-Introduction */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-token-accent mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Self-Introduction</Text>
                </div>
                <Text variant="body" className="leading-relaxed">
                  {application.introduction || 'No introduction provided'}
                </Text>
              </Card>

              {/* Education & Certifications */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <GraduationCap className="w-5 h-5 text-token-primary mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Education & Certifications</Text>
                </div>
                <div className="space-y-6">
                  {/* Educational Background */}
                  <div>
                    <Text variant="small" className="text-token-text-secondary font-medium mb-2">Educational Background</Text>
                    <Text variant="body" className="leading-relaxed">
                      {application.education || 'No education information provided'}
                    </Text>
                  </div>

                                     {/* Certifications */}
                   <div>
                     <Text variant="small" className="text-token-text-secondary font-medium mb-2">Certifications</Text>
                     {application.certificate_files && application.certificate_files.length > 0 ? (
                       <div className="flex flex-wrap gap-2 mb-3">
                         {application.certificate_files.map((cert, index) => {
                           // Check if this is a certification name (not a URL)
                           const certName = typeof cert === 'string' && !cert.includes('http') ? cert : 
                                           typeof cert === 'object' && cert?.name ? cert.name : null;
                           
                           if (certName) {
                             return (
                               <span key={index} className="px-3 py-1 bg-token-success-light text-token-success rounded-full text-sm font-medium">
                                 {certName}
                               </span>
                             );
                           }
                           return null;
                         })}
                         {application.certificate_other && (
                           <span className="px-3 py-1 bg-token-success-light text-token-success rounded-full text-sm font-medium">
                             {application.certificate_other}
                           </span>
                         )}
                       </div>
                     ) : (
                       <Text variant="body" className="text-token-text-secondary mb-3">No certifications specified</Text>
                     )}
                   </div>

                   {/* Certificate Files (Uploaded Documents) */}
                   {application.certificates && application.certificates.length > 0 && (
                     <div>
                       <Text variant="small" className="text-token-text-secondary font-medium mb-2">Certificate Files (Uploaded Documents)</Text>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {application.certificates.map((file, index) => {
                           // Check if this is a URL (certificate file)
                           const fileUrl = typeof file === 'string' && file.includes('http') ? file : 
                                          typeof file === 'object' && (file?.url || file?.path) ? (file.url || file.path) : '';
                           const fileName = typeof file === 'string' && file.includes('http') ? 
                             file.split('/').pop() : 
                             typeof file === 'object' && file?.name ? file.name : `Certificate ${index + 1}`;
                           
                           if (fileUrl) {
                             return (
                               <div key={index} className="bg-token-surface-subtle rounded-lg p-3 border border-token">
                                 {/* Image Preview */}
                                 <div className="aspect-[4/3] bg-token-surface rounded-lg overflow-hidden mb-3">
                                   <img 
                                     src={fileUrl} 
                                     alt={fileName || `Certificate ${index + 1}`}
                                     className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                     onClick={() => window.open(fileUrl, '_blank')}
                                   />
                                 </div>
                                 
                                 {/* File Info and Link */}
                                 <div className="space-y-2">
                                   <div className="flex items-center">
                                     <FileCheck className="w-4 h-4 text-token-success mr-2 flex-shrink-0" />
                                     <Text variant="small" className="text-token-text-primary font-medium truncate">
                                       {fileName || `Certificate ${index + 1}`}
                                     </Text>
                                   </div>
                                   
                                   <Link 
                                     href={fileUrl} 
                                     target="_blank" 
                                     className="inline-flex items-center text-token-primary hover:underline text-sm"
                                   >
                                     View Full Size
                                     <ExternalLink className="w-3 h-3 ml-1" />
                                   </Link>
                                 </div>
                               </div>
                             );
                           }
                           return null;
                         })}
                       </div>
                     </div>
                   )}

                  {/* Teaching Experience */}
                  <div>
                    <Text variant="small" className="text-token-text-secondary font-medium mb-2">Teaching Experience</Text>
                    <Text variant="body" className="leading-relaxed">
                      {application.teaching_experience || 'No teaching experience provided'}
                    </Text>
                  </div>

                  {/* Experience Screenshot */}
                  {application.teaching_screenshot && (
                    <div>
                      <Text variant="small" className="text-token-text-secondary font-medium mb-2">Experience Screenshot</Text>
                      <div className="bg-token-surface-subtle rounded-lg p-2">
                        <img 
                          src={application.teaching_screenshot} 
                          alt="Teaching experience screenshot"
                          className="w-full max-w-md rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

                             {/* Demo Video */}
               <Card className="p-6 bg-token-surface border border-token">
                 <div className="flex items-center mb-4">
                   <Video className="w-5 h-5 text-token-error mr-2" />
                   <Text variant="h3" as="h3" className="text-token-primary">Demo Video</Text>
                 </div>
                 {application.demo_video ? (
                   <div className="space-y-4">
                     {/* Video Preview */}
                     <div className="relative w-full max-w-xl aspect-video rounded-lg overflow-hidden border border-token bg-token-surface-subtle flex items-center justify-center">
                       <VideoPlayer videoUrl={application.demo_video} />
                     </div>
                     
                     {/* Video Info */}
                     <div className="flex items-center justify-between">
                       <div className="flex items-center">
                         <Video className="w-4 h-4 text-token-success mr-2" />
                         <Text variant="small" className="text-token-text-primary font-medium">
                           {application.demo_video.split('/').pop()?.split('?')[0] || 'Demo Video'}
                         </Text>
                       </div>
                       <VideoDownloadButton videoUrl={application.demo_video} />
                     </div>
                   </div>
                 ) : (
                   <div className="bg-token-surface-subtle rounded-lg p-8 text-center">
                     <Video className="w-12 h-12 text-token-text-muted mx-auto mb-2" />
                     <Text variant="small" className="text-token-text-secondary">No demo video uploaded</Text>
                   </div>
                 )}
               </Card>

              {/* Motivation Letter */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <Heart className="w-5 h-5 text-token-accent mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Motivation Letter</Text>
                </div>
                <Text variant="body" className="leading-relaxed">
                  {application.motivation || 'No motivation letter provided'}
                </Text>
              </Card>

              {/* Notes History */}
              <Card className="p-6 bg-token-surface border border-token">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-token-accent mr-2" />
                  <Text variant="h3" as="h3" className="text-token-primary">Notes History</Text>
                </div>
                {application.admin_action_history && application.admin_action_history.filter(action => action.action_type === 'notes_update' && action.new_review_notes).length > 0 ? (
                  <div className="space-y-4">
                    {application.admin_action_history
                      .filter(action => action.action_type === 'notes_update' && action.new_review_notes)
                      .reverse() // Show newest first
                      .map((action, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-4 py-3 bg-token-surface-subtle rounded-r-lg">
                          <div className="flex items-center justify-between mb-3">
                            <Text variant="body" className="text-token-text-primary font-medium">
                              {action.reviewer_email || 'Admin'}
                            </Text>
                            <Text variant="small" className="text-token-text-secondary">
                              {formatDate(action.timestamp)}
                            </Text>
                          </div>
                          <Text variant="body" className="text-token-text-primary leading-relaxed whitespace-pre-wrap">
                            {action.new_review_notes}
                          </Text>
                        </div>
                      ))}
                    
                    {/* Show current notes if they exist and are different from history */}
                    {application.reviewer_notes && application.reviewer_notes.trim() && 
                     !application.admin_action_history.some(action => 
                       action.action_type === 'notes_update' && 
                       action.new_review_notes === application.reviewer_notes
                     ) && (
                      <div className="border-l-4 border-green-200 pl-4 py-3 bg-token-surface-subtle rounded-r-lg">
                        <div className="flex items-center justify-between mb-3">
                          <Text variant="body" className="text-token-text-primary font-medium">
                            {application.reviewer_email || 'Admin'}
                          </Text>
                          <div className="flex items-center">
                            <span className="px-2 py-1 bg-token-success-light text-token-success rounded text-xs font-medium mr-2">
                              Current
                            </span>
                            <Text variant="small" className="text-token-text-secondary">
                              {application.reviewed_at ? formatDate(application.reviewed_at) : 'Latest'}
                            </Text>
                          </div>
                        </div>
                        <Text variant="body" className="text-token-text-primary leading-relaxed whitespace-pre-wrap">
                          {application.reviewer_notes}
                        </Text>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-token-text-muted mx-auto mb-3" />
                    <Text variant="body" className="text-token-text-secondary">No notes have been added yet.</Text>
                    <Text variant="small" className="text-token-text-muted mt-1">Notes will appear here as they are added by reviewers.</Text>
                  </div>
                )}
              </Card>

              {/* External Links */}
              <Card className="p-6 bg-token-surface border border-token">
                <Text variant="h3" as="h3" className="text-token-primary mb-4">External Links</Text>
                <div className="space-y-3">
                  {application.linkedin && (
                    <div>
                      <Text variant="small" className="text-token-text-secondary">LinkedIn</Text>
                      <Link 
                        href={application.linkedin} 
                        target="_blank" 
                        className="text-token-primary hover:underline flex items-center"
                      >
                        View Profile
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  )}
                  {application.social_media && (
                    <div>
                      <Text variant="small" className="text-token-text-secondary">Social Media</Text>
                      <Link 
                        href={application.social_media} 
                        target="_blank" 
                        className="text-token-primary hover:underline flex items-center"
                      >
                        View Profile
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  )}
                  {!application.linkedin && !application.social_media && (
                    <Text variant="small" className="text-token-text-secondary">No external links provided</Text>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Status */}
              <Card className="p-6 bg-token-surface border border-token">
                <Text variant="h3" as="h3" className="text-token-primary mb-4">Application Status</Text>
                <div className="space-y-4">
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Current Status</Text>
                    <div className="mt-1">
                      <StatusBadge status={application.status} />
                    </div>
                  </div>
                  <div>
                    <Text variant="small" className="text-token-text-secondary">Submitted</Text>
                    <Text variant="body" className="font-medium">
                      {formatDate(application.submitted_at || application.created_at)}
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Quick Info */}
              <Card className="p-6 bg-token-surface border border-token">
                <Text variant="h3" as="h3" className="text-token-primary mb-4">Quick Info</Text>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Text variant="small" className="text-token-text-secondary">Weekly Hours</Text>
                    <Text variant="body" className="font-medium">{application.weekly_hours || 'Not specified'}</Text>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text variant="small" className="text-token-text-secondary">Birth Country</Text>
                    <Text variant="body" className="font-medium">{application.birth_country}</Text>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text variant="small" className="text-token-text-secondary">Languages</Text>
                    <Text variant="body" className="font-medium">{application.languages_spoken?.length || 0}</Text>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text variant="small" className="text-token-text-secondary">Certifications</Text>
                    <Text variant="body" className="font-medium">{application.certificates?.length || 0}</Text>
                  </div>
                </div>
              </Card>

                                           {/* Review Actions */}
              <Card className="p-4 bg-token-surface border border-token">
                <Text variant="h3" as="h3" className="text-token-primary mb-4">Review Actions</Text>
                
                {/* Review Notes */}
                <div className="mb-4">
                  <Text variant="small" className="text-token-text-secondary mb-2">Review Notes</Text>
                  <Textarea
                    placeholder="Add your review notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="mb-2"
                    rows={3}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={`w-full ${notesSaved ? 'border-token-success text-token-success' : ''}`}
                    onClick={handleSaveNotes}
                    disabled={updating}
                  >
                    {updating ? 'Saving...' : notesSaved ? '✓ Saved!' : 'Save Notes'}
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-token-success border-token-success hover:bg-token-success hover:text-white transition-colors"
                      onClick={() => handleStatusChange('approved')}
                      disabled={updating}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-token-error border-token-error hover:bg-token-error hover:text-white transition-colors"
                      onClick={() => handleStatusChange('rejected')}
                      disabled={updating}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-token-info border-token-info hover:bg-token-info hover:text-white transition-colors"
                      onClick={() => handleStatusChange('reviewing')}
                      disabled={updating}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Review
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-token-accent border-token-accent hover:bg-token-accent hover:text-white transition-colors"
                      onClick={() => handleStatusChange('waitlist')}
                      disabled={updating}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Waitlist
                    </Button>
                  </div>
                </div>

                {/* Notes History Summary */}
                {application.admin_action_history && application.admin_action_history.filter(action => action.action_type === 'notes_update' && action.new_review_notes).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-token">
                    <Text variant="small" className="text-token-text-secondary">
                      Notes History ({application.admin_action_history.filter(action => action.action_type === 'notes_update' && action.new_review_notes).length} {application.admin_action_history.filter(action => action.action_type === 'notes_update' && action.new_review_notes).length === 1 ? 'entry' : 'entries'})
                    </Text>
                    <Text variant="small" className="text-token-text-muted mt-1">
                      View full history below in main content
                    </Text>
                  </div>
                )}

                {application.submitted_at && (
                  <div className="mt-4 pt-4 border-t border-token">
                    <Text variant="small" className="text-token-text-secondary">
                      Submitted: {formatDate(application.submitted_at)}
                    </Text>
                  </div>
                )}
              </Card>

              {/* External Links */}
              <Card className="p-6 bg-token-surface border border-token">
                <Text variant="h3" as="h3" className="text-token-primary mb-4">External Links</Text>
                <div className="space-y-3">
                  {application.linkedin && (
                    <div>
                      <Text variant="small" className="text-token-text-secondary">LinkedIn</Text>
                      <Link 
                        href={application.linkedin} 
                        target="_blank" 
                        className="text-token-primary hover:underline flex items-center"
                      >
                        View Profile
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  )}
                  {application.social_media && (
                    <div>
                      <Text variant="small" className="text-token-text-secondary">Social Media</Text>
                      <Link 
                        href={application.social_media} 
                        target="_blank" 
                        className="text-token-primary hover:underline flex items-center"
                      >
                        View Profile
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  )}
                  {!application.linkedin && !application.social_media && (
                    <Text variant="small" className="text-token-text-secondary">No external links provided</Text>
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