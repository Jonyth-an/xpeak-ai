'use client';

import React, { useState, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
import { Card, Text, Button, LoadingState, ErrorState, Input, Textarea } from '@/app/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { uploadProfilePhoto } from '@/lib/uploadToSupabase';
import { uploadDemoVideo, uploadCertificateFile } from '@/lib/uploadToSupabase';
import { 
  User, 
  Star, 
  Languages, 
  Camera, 
  Video, 
  Edit, 
  Eye,
  Globe,
  GraduationCap,
  Award,
  MapPin,
  Clock,
  Calendar,
  Settings,
  Upload,
  X
} from 'lucide-react';
import Image from 'next/image';

// Certificate options for selection
const certificateOptions = [
  'TEFL', 'CELTA', 'TESOL', 'DELTA', 'DELE', 'HSK', 'JLPT', 'DELF/DALF', 'Goethe Certificate', 'CILS', 'Other'
];

interface TutorProfileData {
  id: string;
  display_name: string;
  bio: string;
  teaching_style: string;
  education: string;
  languages_taught: Array<{ language: string; fluency: string }>;
  specializations: string[];
  certifications: string[];
  profile_image_url?: string;
  intro_video_url?: string;
  certificate_files?: string[];
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function TutorProfilePage() {
  const [profileData, setProfileData] = useState<TutorProfileData | null>(null);
  const [editingData, setEditingData] = useState<TutorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  
  // Certificate upload states
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [certificateUploading, setCertificateUploading] = useState(false);
  const [certificateUploadError, setCertificateUploadError] = useState<string | null>(null);
  
  // Certificate selection states
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [certificateOther, setCertificateOther] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/tutor/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const { profile } = await response.json();
        setProfileData(profile);
        setEditingData(profile); // Initialize editing data
        
        // Initialize selected certificates from profile data
        if (profile.certifications) {
          setSelectedCertificates(profile.certifications);
        }
      } else {
        setError('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setError('An error occurred while loading profile data');
    } finally {
      setLoading(false);
    }
  };



  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Canada': '🇨🇦',
      'Australia': '🇦🇺',
      'Unknown': '🌍'
    };
    return flags[country] || '🌍';
  };

  const handleSave = async () => {
    if (!editingData) return;
    
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let profileImageUrl = editingData.profile_image_url;

      // Upload profile image if a new one was selected
      if (profileImageFile) {
        try {
          profileImageUrl = await uploadProfilePhoto(profileImageFile, session.user.id);
        } catch (uploadError) {
          console.error('Error uploading profile image:', uploadError);
          setError('Failed to upload profile image. Please try again.');
          setSaving(false);
          return;
        }
      }

      const response = await fetch('/api/tutor/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          display_name: editingData.display_name,
          bio: editingData.bio,
          teaching_style: editingData.teaching_style,
          education: editingData.education,
          languages_taught: editingData.languages_taught,
          specializations: editingData.specializations,
          certifications: selectedCertificates,
          profile_image_url: profileImageUrl,
          intro_video_url: editingData.intro_video_url,
          certificate_files: editingData.certificate_files
        })
      });

      if (response.ok) {
        const { profile } = await response.json();
        setProfileData(profile);
        setEditingData(profile);
        setIsEditing(false);
        setProfileImageFile(null);
        setProfileImagePreview(null);
      } else {
        setError('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingData(profileData);
    setIsEditing(false);
    setProfileImageFile(null);
    setProfileImagePreview(null);
    
    // Reset certificate selection to original state
    if (profileData?.certifications) {
      setSelectedCertificates(profileData.certifications);
    } else {
      setSelectedCertificates([]);
    }
    setCertificateOther("");
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
    if (editingData) {
      setEditingData({ ...editingData, profile_image_url: undefined });
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setVideoUploadError(null);
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile || !editingData) return;
    setVideoUploading(true);
    setVideoUploadError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const url = await uploadDemoVideo(videoFile, session.user.id);
      setEditingData(prev => prev ? { ...prev, intro_video_url: url } : null);
      setVideoPreview(url);
      setVideoFile(null);
    } catch (err: any) {
      setVideoUploadError(err.message || 'Failed to upload video');
    } finally {
      setVideoUploading(false);
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCertificateFiles(prev => [...prev, ...files]);
    setCertificateUploadError(null);
  };

  const handleCertificateUpload = async () => {
    if (certificateFiles.length === 0 || !editingData) return;
    setCertificateUploading(true);
    setCertificateUploadError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      const uploadedUrls: string[] = [];
      for (const file of certificateFiles) {
        const url = await uploadCertificateFile(file, session.user.id);
        uploadedUrls.push(url);
      }
      
      const currentCertificates = editingData.certificate_files || [];
      setEditingData(prev => prev ? { 
        ...prev, 
        certificate_files: [...currentCertificates, ...uploadedUrls]
      } : null);
      
      setCertificateFiles([]);
    } catch (err: any) {
      setCertificateUploadError(err.message || 'Failed to upload certificates');
    } finally {
      setCertificateUploading(false);
    }
  };

  const removeCertificate = (index: number) => {
    if (!editingData) return;
    const updatedCertificates = [...(editingData.certificate_files || [])];
    updatedCertificates.splice(index, 1);
    setEditingData(prev => prev ? { 
      ...prev, 
      certificate_files: updatedCertificates 
    } : null);
  };

  // Loading state
  if (loading) {
    return (
      <TutorLayout>
        <LoadingState 
          message="Loading your profile..." 
          fullScreen 
        />
      </TutorLayout>
    );
  }

  // Error state
  if (error || !profileData) {
    return (
      <TutorLayout>
        <ErrorState 
          title="Unable to Load Profile"
          message={error || 'Please try refreshing the page'}
          onRetry={fetchProfileData}
          fullScreen
        />
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Text variant="h1" as="h1" className="mb-2">My Profile</Text>
            <Text variant="body" className="text-token-text-secondary">
              This is how students see your profile when browsing for tutors
            </Text>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/tutors/${profileData.id}`, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <Card className="p-8 mb-8 rounded-xl">
          <div className="flex items-start gap-8 mb-8">
            {/* Profile Image */}
            <div className="relative w-32 h-32 bg-token-gray-200 rounded-full overflow-hidden flex-shrink-0">
              {isEditing ? (
                <>
                  {/* Image Preview */}
                  {(profileImagePreview || profileData.profile_image_url) ? (
                    <Image
                      src={profileImagePreview || profileData.profile_image_url || ''}
                      alt={editingData?.display_name || profileData.display_name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-token-gray-400" />
                    </div>
                  )}
                  
                  {/* Edit Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer"
                        onClick={() => document.getElementById('profile-image')?.click()}
                      >
                        <Upload className="w-4 h-4 text-token-gray-700" />
                      </div>
                      {(profileImagePreview || profileData.profile_image_url) && (
                        <button
                          onClick={removeProfileImage}
                          className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Hidden File Input */}
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </>
              ) : (
                <>
                  {profileData.profile_image_url ? (
                    <Image
                      src={profileData.profile_image_url}
                      alt={profileData.display_name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-token-gray-400" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isEditing ? (
                  <Input
                    value={editingData?.display_name || ''}
                    onChange={(e) => setEditingData(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                    placeholder="Your display name"
                    className="text-2xl font-bold"
                  />
                ) : (
                  <Text variant="h2" as="h2">{profileData.display_name}</Text>
                )}
                <span className="text-lg">🇺🇸</span>
              </div>
              <Text variant="body" className="text-token-text-secondary mb-3">
                Native Language: English (American Accent)
              </Text>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <Text variant="body" className="font-semibold">4.8</Text>
                  <Text variant="small" className="text-token-text-secondary">(126 reviews)</Text>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Languages className="w-5 h-5 text-token-accent" />
                <Text variant="small" className="text-token-text-secondary">
                  Also speaks: {profileData.languages_taught.map(lang => 
                    `${lang.language} (${lang.fluency})`
                  ).join(', ')}
                </Text>
              </div>
            </div>
          </div>

          {/* Profile Sections */}
          <div className="space-y-8">
            {/* Intro Video */}
            <div>
              <Text variant="h3" as="h3" className="mb-3">Intro Video</Text>
              {isEditing ? (
                <div className="flex flex-col gap-4">
                  {videoPreview || editingData?.intro_video_url ? (
                    <video
                      src={videoPreview || editingData?.intro_video_url || ''}
                      controls
                      className="w-full max-w-md rounded border border-token-border bg-black"
                      style={{ minHeight: 180 }}
                    />
                  ) : (
                    <div className="w-full max-w-md h-40 flex items-center justify-center border-2 border-dashed border-token-border rounded bg-token-gray-50 text-token-text-secondary">
                      Upload your intro video (optional)
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    disabled={videoUploading}
                    className="hidden"
                    id="video-upload"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('video-upload')?.click()}
                      disabled={videoUploading}
                    >
                      Choose Video
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleVideoUpload}
                      disabled={!videoFile || videoUploading}
                    >
                      {videoUploading ? 'Uploading...' : 'Upload Video'}
                    </Button>
                  </div>
                  {videoUploadError && <Text variant="caption" className="text-red-500">{videoUploadError}</Text>}
                </div>
              ) : (
                editingData?.intro_video_url ? (
                  <video
                    src={editingData.intro_video_url}
                    controls
                    className="w-full max-w-md rounded border border-token-border bg-black"
                    style={{ minHeight: 180 }}
                  />
                ) : (
                  <Text variant="body" className="text-token-text-secondary leading-relaxed">
                    No intro video uploaded yet.
                  </Text>
                )
              )}
            </div>

            {/* About Me */}
            <div>
              <Text variant="h3" as="h3" className="mb-3">About Me</Text>
              {isEditing ? (
                <Textarea
                  value={editingData?.bio || ''}
                  onChange={(e) => setEditingData(prev => prev ? { ...prev, bio: e.target.value } : null)}
                  placeholder="Tell students about yourself, your teaching experience, and what makes you unique..."
                  className="min-h-[120px]"
                />
              ) : (
                <Text variant="body" className="text-token-text-secondary leading-relaxed">
                  {profileData.bio || 'No bio provided yet.'}
                </Text>
              )}
            </div>

            {/* Teaching Style */}
            <div>
              <Text variant="h3" as="h3" className="mb-3">Teaching Style</Text>
              {isEditing ? (
                <Textarea
                  value={editingData?.teaching_style || ''}
                  onChange={(e) => setEditingData(prev => prev ? { ...prev, teaching_style: e.target.value } : null)}
                  placeholder="Describe your teaching approach, methods, and how you help students learn..."
                  className="min-h-[120px]"
                />
              ) : (
                <Text variant="body" className="text-token-text-secondary leading-relaxed">
                  {profileData.teaching_style || 'No teaching style information provided yet.'}
                </Text>
              )}
            </div>

            {/* Education */}
            <div>
              <Text variant="h3" as="h3" className="mb-3">Education</Text>
              {isEditing ? (
                <Textarea
                  value={editingData?.education || ''}
                  onChange={(e) => setEditingData(prev => prev ? { ...prev, education: e.target.value } : null)}
                  placeholder="Share your academic background, degrees, and institutions..."
                  className="min-h-[120px]"
                />
              ) : (
                <Text variant="body" className="text-token-text-secondary leading-relaxed">
                  {profileData.education || 'No education information provided yet.'}
                </Text>
              )}
            </div>

            {/* Teaching Certificates */}
            <div>
              <Text variant="h3" as="h3" className="mb-3">Teaching Certificates</Text>
              
              {isEditing ? (
                <div className="space-y-6">
                  <Text variant="body" className="text-gray-600 mb-6">
                    Do you have any teaching certifications? Select from a list (e.g., TEFL, CELTA, DELE, HSK) and upload proof. (Required if selected.) Not listed? Choose Other and explain briefly.
                  </Text>
                  
                  {/* Certificate Type Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {certificateOptions.map(option => (
                      <label key={option} className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-all ${selectedCertificates.includes(option) ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-[var(--color-accent)]"
                          checked={selectedCertificates.includes(option)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedCertificates(prev => [...prev, option]);
                            } else {
                              setSelectedCertificates(prev => prev.filter(c => c !== option));
                            }
                          }}
                        />
                        <span className="font-semibold text-gray-800">{option}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Other Certificate Input */}
                  {selectedCertificates.includes('Other') && (
                    <div className="mb-6">
                      <Text variant="body" className="font-medium mb-2">Other Certificate (please explain)</Text>
                      <Input
                        value={certificateOther}
                        onChange={e => setCertificateOther(e.target.value)}
                        placeholder="Please specify your certificate and a brief explanation"
                      />
                    </div>
                  )}

                  {/* Certificate File Upload */}
                  <div>
                    <Text variant="body" className="font-medium mb-2">Upload Certificate Files:</Text>
                    <div className="border-2 border-dashed border-token-border rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-token-text-secondary mx-auto mb-2" />
                      <Text variant="small" className="text-token-text-secondary mb-3">
                        Upload your teaching certificates (PDF, JPG, PNG)
                      </Text>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={handleCertificateChange}
                        disabled={certificateUploading}
                        className="hidden"
                        id="certificate-upload"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={certificateUploading}
                        className="cursor-pointer"
                        onClick={() => document.getElementById('certificate-upload')?.click()}
                      >
                        {certificateUploading ? 'Uploading...' : 'Choose Files'}
                      </Button>
                    </div>
                    
                    {certificateFiles.length > 0 && (
                      <div className="mt-3">
                        <Text variant="small" className="font-medium mb-2">Selected Files:</Text>
                        <div className="space-y-2">
                          {certificateFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-token-gray-50 rounded">
                              <Text variant="small" className="text-token-text-secondary">
                                {file.name}
                              </Text>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCertificateFiles(prev => prev.filter((_, i) => i !== index))}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleCertificateUpload}
                          disabled={certificateUploading}
                          className="mt-2"
                        >
                          {certificateUploading ? 'Uploading...' : 'Upload Certificates'}
                        </Button>
                      </div>
                    )}
                    
                    {certificateUploadError && (
                      <Text variant="small" className="text-red-500 mt-2">{certificateUploadError}</Text>
                    )}
                  </div>

                  {/* Existing Certificate Files */}
                  {editingData?.certificate_files && editingData.certificate_files.length > 0 && (
                    <div>
                      <Text variant="body" className="font-medium mb-2">Uploaded Certificates:</Text>
                      <div className="space-y-2">
                        {editingData.certificate_files.map((fileUrl, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-token-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Award className="w-5 h-5 text-token-accent" />
                              <Text variant="small" className="text-token-text-secondary">
                                Certificate {index + 1}
                              </Text>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(fileUrl, '_blank')}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCertificate(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Certificate Types */}
                  {profileData.specializations && profileData.specializations.length > 0 && (
                    <div className="mb-4">
                      <Text variant="body" className="font-medium mb-2">Certifications:</Text>
                      <div className="flex flex-wrap gap-3">
                        {profileData.specializations.map((cert, index) => (
                          <span
                            key={index}
                            className="bg-token-secondary-100 text-token-secondary-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certificate Files */}
                  {profileData.certificate_files && profileData.certificate_files.length > 0 ? (
                    <div>
                      <Text variant="body" className="font-medium mb-2">Certificate Files:</Text>
                      <div className="space-y-2">
                        {profileData.certificate_files.map((fileUrl, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-token-gray-50 rounded-lg">
                            <Award className="w-5 h-5 text-token-accent" />
                            <Text variant="small" className="text-token-text-secondary flex-1">
                              Certificate {index + 1}
                            </Text>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(fileUrl, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Text variant="body" className="text-token-text-secondary leading-relaxed">
                      No teaching certificates provided yet.
                    </Text>
                  )}
                </>
              )}
            </div>

            {/* Languages I Speak */}
            <div>
              <Text variant="h3" as="h3" className="mb-3">Languages I Speak</Text>
              <div className="flex flex-wrap gap-3">
                <span className="bg-token-accent-100 text-token-accent-800 px-3 py-1 rounded-full text-sm font-medium">
                  English (Native)
                </span>
                {profileData.languages_taught.map((lang, index) => (
                  <span
                    key={index}
                    className="bg-token-success-100 text-token-success-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {lang.language} ({lang.fluency})
                  </span>
                ))}
              </div>
            </div>

            {/* Profile Status */}
            <div className="border-t border-token-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${profileData.is_active ? 'bg-token-success' : 'bg-token-error'}`}></div>
                  <Text variant="small" className="text-token-text-secondary">
                    Profile Status: {profileData.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </div>
                <Text variant="small" className="text-token-text-secondary">
                  Last updated: {new Date(profileData.updated_at).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-token-accent" />
              <Text variant="h4" as="h4">Manage Availability</Text>
            </div>
            <Text variant="body" className="text-token-text-secondary mb-4">
              Update your teaching schedule and time slots
            </Text>
            <Button variant="outline" onClick={() => window.location.href = '/tutor/calendar'}>
              Go to Calendar
            </Button>
          </Card>

          <Card className="p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-token-accent" />
              <Text variant="h4" as="h4">Profile Settings</Text>
            </div>
            <Text variant="body" className="text-token-text-secondary mb-4">
              Edit your profile information and preferences
            </Text>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
} 