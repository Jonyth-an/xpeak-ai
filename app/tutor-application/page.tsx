"use client"

import React, { useState, useEffect, useRef } from "react"
import Layout from "../../components/Layout"
import ProtectedRoute from "../../components/ProtectedRoute"
import RequireEmailVerification from "../components/RequireEmailVerification"
import { Button } from "@/app/components/ui/Button"
import { Card, Text, Input, Textarea, Select } from "@/app/components/ui"
import DashboardSidebar from "../dashboard/components/DashboardSidebar"
import FormField from "@/app/components/ui/FormField"
import AnimationWrapper from "@/app/components/ui/AnimationWrapper"
import LoadingSpinner from "@/app/components/ui/LoadingSpinner"
import Modal from "@/app/components/ui/Modal"
import ToastContainer, { useToast } from "@/app/components/ui/ToastContainer"
import ErrorBoundary from "@/app/components/ui/ErrorBoundary"
import {
  GraduationCap,
  Upload,
  Globe,
  Clock,
  User,
  Camera,
  FileText,
  Heart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Languages,
  Award,
  Video,
  Linkedin,
  Instagram,
  ArrowRight,
  Save,
  Eye,
  AlertTriangle,
  Info,
} from "lucide-react"
import { useAuth } from "@/lib/AuthContext"
import { useRouter } from "next/navigation"
import CustomSelect from '@/app/components/ui/CustomSelect';
import { supabaseClient } from "@/lib/supabaseClient";
import { uploadProfilePhoto, uploadCertificateFile, uploadTeachingScreenshot, uploadDemoVideo } from "@/lib/uploadToSupabase";

const languages = [
  "English",
  "Spanish",
  "Chinese (Mandarin)",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Polish",
  "Czech",
  "Hungarian",
  "Turkish",
  "Greek",
]

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Japan",
  "South Korea",
  "China",
  "Brazil",
  "Mexico",
  "Argentina",
  "Chile",
]

const weeklyHoursOptions = [
  { value: "1-5", label: "1-5 hours per week" },
  { value: "6-10", label: "6-10 hours per week" },
  { value: "11-20", label: "11-20 hours per week" },
  { value: "21-30", label: "21-30 hours per week" },
  { value: "30+", label: "30+ hours per week" },
]

interface FormData {
  nativeLanguage: string
  accent: string // <-- add accent
  fullName: string
  displayName: string
  birthCountry: string
  currentCountry: string
  timezone: string
  introduction: string
  education: string
  teachingExperience: string
  weeklyHours: string
  motivation: string
  linkedin: string
  socialMedia: string
}

interface FormErrors {
  [key: string]: string
}

const accentOptions: Record<string, { value: string; label: string }[]> = {
  English: [
    { value: 'American English', label: 'American English' },
    { value: 'British English', label: 'British English' },
    { value: 'Australian English', label: 'Australian English' },
    { value: 'Canadian English', label: 'Canadian English' },
    { value: 'South African English', label: 'South African English' },
    { value: 'Other / Mixed', label: 'Other / Mixed' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
  ],
  Spanish: [
    { value: 'Spain Spanish', label: 'Spain (Castilian)' },
    { value: 'Mexican Spanish', label: 'Mexican' },
    { value: 'Argentinian Spanish', label: 'Argentinian' },
    { value: 'Colombian Spanish', label: 'Colombian' },
    { value: 'Latin American Spanish', label: 'Latin America (other)' },
    { value: 'Other / Mixed', label: 'Other / Mixed' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
  ],
  'Chinese (Mandarin)': [
    { value: 'Mandarin (Mainland)', label: 'Mandarin (Mainland)' },
    { value: 'Mandarin (Taiwan)', label: 'Mandarin (Taiwan)' },
    { value: 'Cantonese (Hong Kong)', label: 'Cantonese (Hong Kong)' },
    { value: 'Cantonese (Guangzhou)', label: 'Cantonese (Guangzhou)' },
    { value: 'Other / Mixed', label: 'Other / Mixed' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
  ],
};

// Helper to map string[] to Option[]
const toOptions = (arr: string[], placeholder?: string) => [
  ...arr.map((v) => ({ value: v, label: v }))
];

const fluencyOptions = [
  { value: 'Basic', label: 'Basic' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Fluent', label: 'Fluent' },
  { value: 'Native', label: 'Native' },
];

// Add certificate options at the top
const certificateOptions = [
  'TEFL', 'CELTA', 'TESOL', 'DELTA', 'DELE', 'HSK', 'JLPT', 'DELF/DALF', 'Goethe Certificate', 'CILS', 'Other'
];

// Helper function to safely get file URL for display
export const getFileUrl = (file: File | string | null): string | null => {
  if (!file) return null;
  if (typeof file === 'string') {
    // If it's already a URL string, return it directly
    return file;
  }
  if (file instanceof File) {
    // If it's a File object, create object URL
    return URL.createObjectURL(file);
  }
  return null;
}

// Helper function to check if file is an image
export const isImageFile = (file: File | string | null): boolean => {
  if (!file) return false;
  if (typeof file === 'string') {
    // If it's a string, check if it looks like an image URL
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(file) || file.startsWith('data:image/');
  }
  if (file instanceof File) {
    return file.type.startsWith('image/');
  }
  return false;
}

// Helper function to check if file is a video
export const isVideoFile = (file: File | string | null): boolean => {
  if (!file) return false;
  if (typeof file === 'string') {
    // If it's a string, check if it looks like a video URL
    return /\.(mp4|mov|avi|webm)$/i.test(file) || file.startsWith('data:video/');
  }
  if (file instanceof File) {
    return file.type.startsWith('video/');
  }
  return false;
}

// Helper function to determine if user can edit application based on status and reapplication rules
const canEditApplication = (status: string, reviewedAt?: string): boolean => {
  switch (status) {
    case 'drafting':
    case 'pending':
      return true; // Can always edit drafts and pending applications
    
    case 'rejected':
      // For rejected applications, allow editing after 30 days
      if (!reviewedAt) return true; // If no review date, allow editing
      const reviewDate = new Date(reviewedAt);
      const now = new Date();
      const daysSinceReview = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReview >= 30; // Allow reapplication after 30 days
    
    case 'reviewing':
    case 'waitlist':
    case 'approved':
    default:
      return false; // Cannot edit applications under review, waitlisted, or approved
  }
}

function TutorApplicationContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  // Add mode: 'summary' | 'edit'
  const [mode, setMode] = useState<'readonly' | 'edit'>('edit');
  const [applicationStatus, setApplicationStatus] = useState<string>('drafting');
  const [loaded, setLoaded] = useState(false);
  const [application, setApplication] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    nativeLanguage: "",
    accent: "",
    fullName: "",
    displayName: "",
    birthCountry: "",
    currentCountry: "",
    timezone: "UTC-8 (Pacific Time)",
    introduction: "",
    education: "",
    teachingExperience: "",
    weeklyHours: "",
    motivation: "",
    linkedin: "",
    socialMedia: "",
  })

  const [languagesSpoken, setLanguagesSpoken] = useState<{ language: string; fluency: string }[]>([]);
  const [profilePhotos, setProfilePhotos] = useState<string[]>([]);
  const [certificateUrls, setCertificateUrls] = useState<string[]>([]);
  const [certificateOther, setCertificateOther] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [demoVideoUrl, setDemoVideoUrl] = useState<string | null>(null);
  const demoVideoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableLanguages = (currentIdx: number) =>
    languages.filter(
      (lang) =>
        !languagesSpoken.some((row, idx) => row.language === lang && idx !== currentIdx)
    );

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [savedProgress, setSavedProgress] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Auto-detect timezone on mount
  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const offset = new Date().getTimezoneOffset()
      const hours = Math.abs(Math.floor(offset / 60))
      const minutes = Math.abs(offset % 60)
      const sign = offset <= 0 ? '+' : '-'
      const timezoneString = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} (${timezone})`
      
      setFormData(prev => ({ ...prev, timezone: timezoneString }))
    } catch (error) {
      console.warn('Could not detect timezone:', error)
    }
  }, [])

  // Fetch application on mount
  useEffect(() => {
    async function fetchApplication() {
      const session = await supabaseClient.auth.getSession();
      const response = await fetch('/api/tutor-applications', {
        headers: {
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
      });
      if (response.ok) {
        const { application } = await response.json();
        const fetchedStatus = application?.status || 'drafting';
        setApplication(application); // Store the application data
        
        if (application && fetchedStatus !== 'drafting') {
          // If application has been submitted (status is not 'drafting'), populate all data
          // Populate formData and all related state from application_data
          setFormData({
            ...formData,
            ...application.application_data,
          });
          setLanguagesSpoken(application.application_data?.languagesSpoken || []);
          setProfilePhotos(application.application_data?.profilePhotos || []);
          setCertificateUrls(application.application_data?.certificates || []);
          setCertificateOther(application.application_data?.certificateOther || '');
          // Ensure teachingScreenshot is a string URL or null
          const screenshot = application.application_data?.teachingScreenshot;
          setScreenshotUrl(typeof screenshot === 'string' ? screenshot : null);
          setDemoVideoUrl(application.application_data?.demoVideo || null);
          setApplicationStatus(application.status);
          
          // Determine if user can edit based on status and reapplication rules
          const canEdit = canEditApplication(application.status, application.reviewed_at);
          setMode(canEdit ? 'edit' : 'readonly');
        } else {
          // Application is still in drafting mode, allow editing
          setMode('edit');
          setApplicationStatus(fetchedStatus);
        }
      } else {
        setMode('edit');
      }
      setLoaded(true);
    }
    fetchApplication();
    // eslint-disable-next-line
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nativeLanguage) {
      newErrors.nativeLanguage = "Please select your native language"
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full legal name is required"
    }
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required"
    }
    if (!formData.birthCountry) {
      newErrors.birthCountry = "Please select your country of birth"
    }
    if (!formData.currentCountry) {
      newErrors.currentCountry = "Please select your current country"
    }
    if (!formData.introduction.trim()) {
      newErrors.introduction = "Self-introduction is required"
    } else if (formData.introduction.length < 100) {
      newErrors.introduction = "Self-introduction should be at least 100 characters"
    }
    if (!formData.motivation.trim()) {
      newErrors.motivation = "Motivation letter is required"
    } else if (formData.motivation.length < 50) {
      newErrors.motivation = "Motivation letter should be at least 50 characters"
    }
    if (["English", "Spanish", "Chinese (Mandarin)"].includes(formData.nativeLanguage)) {
      if (!formData.accent) {
        newErrors.accent = "Please select your accent/variant"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission if in readonly mode
    if (mode === 'readonly') {
      return
    }
    
    if (!validateForm()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting.'
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const session = await supabaseClient.auth.getSession()
      const response = await fetch('/api/tutor-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          applicationData: {
            ...formData,
            languagesSpoken,
            profilePhotos,
            certificates: certificateUrls,
            certificateOther,
            teachingScreenshot: screenshotUrl,
            demoVideo: demoVideoUrl,
          },
          action: 'submit',
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setMode('readonly');
        setApplicationStatus('pending');
        showToast({
          type: 'success',
          title: isReapplication ? 'Application Resubmitted!' : 'Application Submitted!',
          message: isReapplication ? 'Your updated tutor application has been resubmitted successfully.' : 'Your tutor application has been submitted successfully.'
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      showToast({
        type: 'error',
        title: 'Submission Failed',
        message: error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveProgress = async () => {
    setIsLoading(true)
    
    try {
      const session = await supabaseClient.auth.getSession()
      const response = await fetch('/api/tutor-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          applicationData: {
            ...formData,
            languagesSpoken,
            profilePhotos,
            certificates: certificateUrls,
            certificateOther,
            teachingScreenshot: screenshotUrl,
            demoVideo: demoVideoUrl,
          },
          action: 'save',
        }),
      })

      if (response.ok) {
        setSavedProgress(true)
        showToast({
          type: 'success',
          title: 'Progress Saved',
          message: isReapplication ? 'Your reapplication progress has been saved successfully.' : 'Your application progress has been saved successfully.'
        })
        setTimeout(() => setSavedProgress(false), 2000)
      } else {
        throw new Error('Failed to save progress')
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save your progress. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // If changing nativeLanguage, reset accent
    if (field === 'nativeLanguage') {
      setFormData(prev => ({ ...prev, accent: "" }))
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Summary view component
  function ApplicationSummary() {
    return (
      <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
        <Text variant="h2" className="text-gray-800 mb-4">Your Submitted Application</Text>
        <div className="mb-4"><b>Status:</b> {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}</div>
        <div className="mb-2"><b>Native Language:</b> {formData.nativeLanguage}</div>
        <div className="mb-2"><b>Accent:</b> {formData.accent}</div>
        <div className="mb-2"><b>Languages You Speak:</b> {languagesSpoken.map(l => `${l.language} (${l.fluency})`).join(', ')}</div>
        <div className="mb-2"><b>Full Name:</b> {formData.fullName}</div>
        <div className="mb-2"><b>Display Name:</b> {formData.displayName}</div>
        <div className="mb-2"><b>Birth Country:</b> {formData.birthCountry}</div>
        <div className="mb-2"><b>Current Country:</b> {formData.currentCountry}</div>
        <div className="mb-2"><b>Timezone:</b> {formData.timezone}</div>
        <div className="mb-2"><b>Introduction:</b> {formData.introduction}</div>
        <div className="mb-2"><b>Education:</b> {formData.education}</div>
        <div className="mb-2"><b>Teaching Experience:</b> {formData.teachingExperience}</div>
        <div className="mb-2"><b>Weekly Hours:</b> {formData.weeklyHours}</div>
        <div className="mb-2"><b>Motivation:</b> {formData.motivation}</div>
        <div className="mb-2"><b>LinkedIn:</b> {formData.linkedin}</div>
        <div className="mb-2"><b>Social Media:</b> {formData.socialMedia}</div>
        {/* Add more fields as needed, including uploads */}
        {canEditApplication(applicationStatus, application?.reviewed_at) && (
          <Button type="button" className="mt-6" onClick={(e) => { e.preventDefault(); setMode('edit'); }}>Edit Application</Button>
        )}
      </Card>
    );
  }

  if (!loaded) {
    return <LoadingSpinner />;
  }

  if (isSubmitted) {
    return (
      <AnimationWrapper type="scale" duration={0.6}>
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-12 bg-white/90 backdrop-blur-sm border-2 border-green-200 shadow-2xl">
            <AnimationWrapper type="scale" duration={0.8} delay={0.3}>
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </AnimationWrapper>

            <Text variant="display" className="text-gray-800 mb-6">🎉 Thank you for applying!</Text>
            <Text variant="lead" className="text-gray-600 mb-8 leading-relaxed">
              Your application has been submitted successfully. You'll receive a confirmation email shortly and can
              track your status from your Tutor Dashboard.
            </Text>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/profile')}
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-8 py-4 rounded-full text-lg font-semibold bg-transparent"
              >
                View Application Status
                <Eye className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </AnimationWrapper>
    )
  }

  // 1. Progress bar logic
  const getStepInfo = (status: string) => {
    switch (status) {
      case 'pending':
      case 'reviewing':
      case 'waitlist':
        return {
          step: 2,
          indicator: 'Step 2 of 3 – Under Review',
          description: 'Your application is being reviewed by our team'
        };
      case 'approved':
      case 'rejected':
        return {
          step: 3,
          indicator: 'Step 3 of 3 – Decision Complete',
          description: 'The review process is complete'
        };
      default: // 'drafting'
        return {
          step: 1,
          indicator: 'Step 1 of 3 – Tutor Application',
          description: 'Complete your application to get started'
        };
    }
  };
  
  const stepInfo = getStepInfo(applicationStatus);
  const totalSteps = 3;
  const progressPercent = (stepInfo.step / totalSteps) * 100;

  // 2. Enforce read-only mode
  const isReadOnly = mode === 'readonly';

  // Button logic
  const canEdit = canEditApplication(applicationStatus, application?.reviewed_at);
  const isReapplication = applicationStatus === 'rejected' && canEdit;
  const bottomButton = isReadOnly
    ? (canEdit ? <Button type="button" onClick={(e) => { e.preventDefault(); setMode('edit'); }}>{isReapplication ? 'Update & Reapply' : 'Edit Application'}</Button> : null)
    : <Button type="submit">{isReapplication ? 'Resubmit Application' : 'Submit Application'}</Button>;

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <AnimationWrapper type="slide-up" duration={0.8}>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <GraduationCap className="w-12 h-12 text-[var(--color-primary)]" />
              <Text variant="display" className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                Welcome, Future Tutor!
              </Text>
            </div>
            <Text variant="lead" className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
              We're thrilled you're here. This short application helps us learn more about you and make sure we're a great
              match. Let's begin — you can save and return anytime!
            </Text>
          </div>
        </AnimationWrapper>

        {/* Progress Bar */}
        <AnimationWrapper type="slide-up" duration={0.6} delay={0.2}>
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200 mb-12">
            <div className="flex items-center justify-between mb-4">
              <Text variant="h3" className="font-semibold text-gray-800">{stepInfo.indicator}</Text>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Save className="w-4 h-4" />
                {savedProgress ? "Progress saved!" : "Your progress is saved automatically"}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-3 rounded-full w-1/3 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <Text variant="small" className="text-gray-600 mt-2">{stepInfo.description}</Text>
            
            {/* Status Message */}
            {isReadOnly && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {applicationStatus === 'pending' && <Clock className="w-5 h-5 text-blue-600" />}
                    {applicationStatus === 'reviewing' && <Eye className="w-5 h-5 text-yellow-600" />}
                    {applicationStatus === 'waitlist' && <Clock className="w-5 h-5 text-purple-600" />}
                    {applicationStatus === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {applicationStatus === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                  <div className="ml-3">
                    <Text variant="small" className="font-medium text-gray-900">
                      {applicationStatus === 'pending' && 'Application Under Review'}
                      {applicationStatus === 'reviewing' && 'Currently Being Reviewed'}
                      {applicationStatus === 'waitlist' && 'You\'re on the Waitlist'}
                      {applicationStatus === 'approved' && 'Application Approved!'}
                      {applicationStatus === 'rejected' && 'Application Not Approved'}
                    </Text>
                    <Text variant="small" className="text-gray-600 mt-1">
                      {applicationStatus === 'pending' && 'Your application is in the review queue. You can still make edits if needed.'}
                      {applicationStatus === 'reviewing' && 'Our team is currently reviewing your application. Please check back soon for updates.'}
                      {applicationStatus === 'waitlist' && 'We\'ll notify you as soon as a spot becomes available. Thank you for your patience!'}
                      {applicationStatus === 'approved' && 'Congratulations! Your application has been approved. Welcome to the team!'}
                      {applicationStatus === 'rejected' && (
                        canEditApplication(applicationStatus, application?.reviewed_at) 
                          ? 'You can now update your application and reapply. Please review the feedback and make improvements before resubmitting.'
                          : `You may reapply after ${application?.reviewed_at ? Math.ceil(30 - (new Date().getTime() - new Date(application.reviewed_at).getTime()) / (1000 * 60 * 60 * 24)) : 30} days. Use this time to improve your qualifications.`
                      )}
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </AnimationWrapper>

        {/* Application Form */}
        <AnimationWrapper type="slide-up" duration={0.8} delay={0.4}>
          <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter' && mode === 'readonly') e.preventDefault(); }} className="space-y-8">
            {/* Native Language */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Languages className="w-6 h-6 text-[var(--color-primary)]" />
                <Text variant="h2" className="text-gray-800">Native Language</Text>
              </div>
              <Text variant="body" className="text-gray-600 mb-6">
                What is your native language? This will determine which language you're eligible to teach on the platform.
              </Text>
              <FormField
                label="Native Language"
                required
                error={errors.nativeLanguage}
                helpText="Select the language you speak natively"
              >
                <CustomSelect
                  value={formData.nativeLanguage}
                  onValueChange={(val) => handleInputChange('nativeLanguage', val)}
                  options={toOptions(languages, 'Select your native language')}
                  placeholder="Select your native language"
                  disabled={isReadOnly}
                />
              </FormField>
              {['English', 'Spanish', 'Chinese (Mandarin)'].includes(formData.nativeLanguage) && (
                <FormField
                  label={`What accent best describes how you speak your native language?`}
                  required
                  error={errors.accent}
                  helpText="This helps students connect with tutors whose speech feels familiar or aligned with their learning goals."
                  className="mt-6"
                >
                  <CustomSelect
                    value={formData.accent}
                    onValueChange={(val) => handleInputChange('accent', val)}
                    options={accentOptions[formData.nativeLanguage] || []}
                    placeholder="Select accent/variant"
                    disabled={isReadOnly}
                  />
                </FormField>
              )}
            </Card>

            {/* Languages You Speak */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-[var(--color-accent)]" />
                <Text variant="h2" className="text-gray-800">Languages You Speak</Text>
              </div>
              <Text variant="body" className="text-gray-600 mb-6">
                Which other languages do you speak? Add any languages you're comfortable using to support students.<br />
                Select fluency for each: <b>Basic / Intermediate / Fluent / Native</b>
              </Text>
              <LanguagesYouSpeakSection
                languagesSpoken={languagesSpoken}
                setLanguagesSpoken={setLanguagesSpoken}
                availableLanguages={availableLanguages}
                isReadOnly={isReadOnly}
              />
            </Card>

            {/* Personal Information */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-[var(--color-accent)]" />
                <Text variant="h2" className="text-gray-800">Personal Information</Text>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <FormField
                  label="Full Legal Name"
                  required
                  error={errors.fullName}
                  helpText="Your full legal name (private). This is used for internal verification and payout setup only."
                >
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="h-12"
                    placeholder="Enter your full legal name"
                    readOnly={isReadOnly}
                  />
                </FormField>

                <FormField
                  label="Display Name"
                  required
                  error={errors.displayName}
                  helpText="What name should students see? Use your real first name, nickname, or preferred teaching name."
                >
                  <Input
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="h-12"
                    placeholder="Enter your display name"
                    readOnly={isReadOnly}
                  />
                </FormField>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <FormField
                  label="Place of Birth"
                  required
                  error={errors.birthCountry}
                  helpText="Where were you born? (Select your country of birth from the list)"
                >
                  <CustomSelect
                    value={formData.birthCountry}
                    onValueChange={(val) => handleInputChange('birthCountry', val)}
                    options={toOptions(countries)}
                    placeholder="Select country of birth"
                    disabled={isReadOnly}
                  />
                </FormField>

                <FormField
                  label="Current Residence"
                  required
                  error={errors.currentCountry}
                  helpText="Where do you currently live? Helps us understand your availability, timezone, and student matching."
                >
                  <CustomSelect
                    value={formData.currentCountry}
                    onValueChange={(val) => handleInputChange('currentCountry', val)}
                    options={toOptions(countries)}
                    placeholder="Select current country"
                    disabled={isReadOnly}
                  />
                </FormField>
              </div>

              <FormField
                label="Timezone"
                helpText="(Auto-detected) Your availability will be shown to students in their local time."
              >
                <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-gray-700">
                  {formData.timezone}
                </div>
              </FormField>
            </Card>

            {/* Profile Photo Upload */}
            <ProfilePhotoUploadSection profilePhotos={profilePhotos} setProfilePhotos={setProfilePhotos} isReadOnly={isReadOnly} />

            {/* Self Introduction */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-[var(--color-accent)]" />
                <Text variant="h2" className="text-gray-800">Self-Introduction</Text>
              </div>
              <Text variant="body" className="text-gray-600 mb-6">
                Tell us about yourself (200–400 words). Share your teaching approach, personal background, and how you
                support student success.
              </Text>
              <FormField
                label="Self-Introduction"
                required
                error={errors.introduction}
                helpText={`${formData.introduction.length}/400 words`}
              >
                <Textarea
                  value={formData.introduction}
                  onChange={(e) => handleInputChange('introduction', e.target.value)}
                  className="min-h-[200px] resize-none"
                  placeholder="Tell us about yourself, your teaching approach, and how you help students succeed..."
                  showCharacterCount
                  maxLength={400}
                  readOnly={isReadOnly}
                />
              </FormField>
            </Card>

            {/* Educational Background */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-6 h-6 text-[var(--color-primary)]" />
                <Text variant="h2" className="text-gray-800">Educational Background</Text>
              </div>
              <Text variant="body" className="text-gray-600 mb-6">
                Where did you study? Share your academic background (e.g., degrees, fields of study, institutions).
              </Text>
              <FormField
                label="Educational Background"
                helpText="Share your degrees, fields of study, and institutions"
              >
                <Textarea
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="min-h-[120px] resize-none"
                  placeholder="Share your educational background, degrees, and institutions..."
                  readOnly={isReadOnly}
                />
              </FormField>
            </Card>

            {/* Teaching Certificates */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-[var(--color-accent)]" />
                <Text variant="h2" className="text-gray-800">Teaching Certificates</Text>
              </div>
              <Text variant="body" className="text-gray-600 mb-6">
                Do you have any teaching certifications? Select from a list (e.g., TEFL, CELTA, DELE, HSK) and upload proof. (Required if selected.) Not listed? Choose Other and explain briefly.
              </Text>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {certificateOptions.map(option => (
                  <label key={option} className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-all ${certificateUrls.includes(option) ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-[var(--color-accent)]"
                      checked={certificateUrls.includes(option)}
                      onChange={e => {
                        if (e.target.checked) setCertificateUrls(prev => [...prev, option]);
                        else setCertificateUrls(prev => prev.filter(c => c !== option));
                      }}
                      disabled={isReadOnly}
                    />
                    <span className="font-semibold text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
              {certificateUrls.includes('Other') && (
                <FormField label="Other Certificate (please explain)" className="mb-6">
                  <Input
                    value={certificateOther}
                    onChange={e => setCertificateOther(e.target.value)}
                    placeholder="Please specify your certificate and a brief explanation"
                    readOnly={isReadOnly}
                  />
                </FormField>
              )}
              <TeachingCertificatesUploadSection
                certificateUrls={certificateUrls}
                setCertificateUrls={setCertificateUrls}
                isReadOnly={isReadOnly}
              />
            </Card>

            {/* Teaching Experience */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-[var(--color-accent)]" />
                <Text variant="h2" className="text-gray-800">Teaching Experience</Text>
              </div>
              <Text variant="body" className="text-gray-600 mb-6">
                How long have you been teaching? Optionally mention platforms you've taught on (e.g., Cambly, Preply,
                italki, etc.).
              </Text>
              <FormField
                label="Teaching Experience"
                helpText="Describe your teaching experience, platforms you've used, and any relevant background"
              >
                <Textarea
                  value={formData.teachingExperience}
                  onChange={(e) => handleInputChange('teachingExperience', e.target.value)}
                  className="min-h-[120px] resize-none"
                  placeholder="Describe your teaching experience, platforms you've used, and any relevant background..."
                  readOnly={isReadOnly}
                />
              </FormField>

              {/* Upload Screenshot (Optional) */}
              <TeachingExperienceScreenshotSection
                screenshotUrl={screenshotUrl}
                setScreenshotUrl={setScreenshotUrl}
                isReadOnly={isReadOnly}
                showToast={showToast}
                userId={user?.id || ''}
              />
            </Card>

            {/* Weekly Commitment */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-[var(--color-primary)]" />
                <Text variant="h2" className="text-gray-800">Weekly Time Commitment</Text>
              </div>
              <Text variant="body" className="text-gray-600 mb-6">
                How many hours per week are you available to teach? This helps us understand your commitment level.
              </Text>
              <FormField
                label="Weekly Hours"
                helpText="Select your weekly teaching availability"
              >
                <CustomSelect
                  value={formData.weeklyHours}
                  onValueChange={(val) => handleInputChange('weeklyHours', val)}
                  options={weeklyHoursOptions}
                  placeholder="Select weekly hours"
                  disabled={isReadOnly}
                />
              </FormField>
            </Card>

            {/* Demo Video */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <DemoVideoUploadSection
                demoVideoUrl={demoVideoUrl}
                setDemoVideoUrl={setDemoVideoUrl}
                isReadOnly={isReadOnly}
                showToast={showToast}
                userId={user?.id || ''}
              />
            </Card>

            {/* Motivation Letter */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-[var(--color-primary)]" />
                <Text variant="h2" className="text-gray-800">Motivation Letter</Text>
              </div>
              <Text variant="body" className="text-gray-600 mb-6">
                Why do you want to teach on our platform? Share your goals, teaching passion, and what excites you about
                joining our global tutor team.
              </Text>
              <FormField
                label="Motivation Letter"
                required
                error={errors.motivation}
                helpText="Share your motivation for teaching on our platform and your goals"
              >
                <Textarea
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  className="min-h-[150px] resize-none"
                  placeholder="Share your motivation for teaching on our platform and your goals..."
                  readOnly={isReadOnly}
                />
              </FormField>
            </Card>

            {/* Optional Fields */}
            <Card className="p-8 bg-gray-50/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-gray-500" />
                <Text variant="h2" className="text-gray-800">Optional Fields</Text>
                <Text variant="small" className="text-gray-500">(This wouldn't show to students)</Text>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  label="LinkedIn or Professional Portfolio"
                  helpText="Optional – showcase your professional or academic background"
                >
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="h-12"
                    placeholder="https://linkedin.com/in/yourprofile"
                    readOnly={isReadOnly}
                  />
                </FormField>

                <FormField
                  label="Social Media"
                  helpText="For tutors who create content or have teaching communities"
                >
                  <Input
                    value={formData.socialMedia}
                    onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                    className="h-12"
                    placeholder="Instagram, YouTube, etc."
                    readOnly={isReadOnly}
                  />
                </FormField>
              </div>
            </Card>

            {/* Submit Section */}
            <Card className="p-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-2xl">
              <div className="text-center">
                <Text variant="h2" className="mb-4">
                  {isReapplication ? 'Ready to Reapply?' : 'Ready to Submit?'}
                </Text>
                <Text variant="lead" className="mb-8 opacity-90">
                  {isReapplication 
                    ? 'Review your updated application and resubmit when you\'re ready. Make sure you\'ve addressed any previous feedback.'
                    : 'Review your application and submit when you\'re ready. You can always come back and make changes later.'
                  }
                </Text>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {bottomButton}
                </div>
                <Text variant="small" className="text-white/80 mt-6 text-center">
                  By submitting, you agree to our Terms of Service and Privacy Policy.
                </Text>
              </div>
            </Card>
          </form>
        </AnimationWrapper>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Submission"
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <Text variant="h3">Are you sure?</Text>
          </div>
          <Text variant="body" className="mb-6">
            Once you submit your application, you won't be able to make changes until it's reviewed. 
            Make sure all information is correct and complete.
          </Text>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Review Again
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowConfirmModal(false)
                handleSubmit(new Event('submit') as any)
              }}
            >
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// Move LanguagesYouSpeakSection here so it is in scope
function LanguagesYouSpeakSection({ languagesSpoken, setLanguagesSpoken, availableLanguages, isReadOnly }: {
  languagesSpoken: { language: string; fluency: string }[];
  setLanguagesSpoken: React.Dispatch<React.SetStateAction<{ language: string; fluency: string }[]>>;
  availableLanguages: (currentIdx: number) => string[];
  isReadOnly: boolean;
}) {
  const handleChange = (idx: number, field: 'language' | 'fluency', value: string) => {
    setLanguagesSpoken((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const handleAdd = () => {
    setLanguagesSpoken((prev) => [...prev, { language: '', fluency: '' }]);
  };

  const handleRemove = (idx: number) => {
    setLanguagesSpoken((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {languagesSpoken.length === 0 && (
        <Button
          type="button"
          variant="outline"
          className="w-full h-16 border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
          onClick={handleAdd}
          disabled={isReadOnly}
        >
          + Add Another Language
        </Button>
      )}
      {languagesSpoken.length > 0 && (
        <div className="space-y-6">
          {languagesSpoken.map((row, idx) => (
            <div key={idx} className="grid md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <FormField label="Language">
                  <CustomSelect
                    value={row.language}
                    onValueChange={(val) => handleChange(idx, 'language', val)}
                    options={toOptions(availableLanguages(idx), 'Select language')}
                    placeholder="Select language"
                    disabled={isReadOnly}
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField label="Fluency Level">
                  <CustomSelect
                    value={row.fluency}
                    onValueChange={(val) => handleChange(idx, 'fluency', val)}
                    options={fluencyOptions}
                    placeholder="Select fluency"
                    disabled={isReadOnly}
                  />
                </FormField>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-500 border border-red-200 hover:bg-red-50"
                  onClick={() => handleRemove(idx)}
                  disabled={isReadOnly}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full h-16 border-2 border-[var(--color-accent)] text-[var(--color-accent)] mt-2"
            onClick={handleAdd}
            disabled={isReadOnly}
          >
            + Add Another Language
          </Button>
        </div>
      )}
    </div>
  );
}

function ProfilePhotoUploadSection({ profilePhotos, setProfilePhotos, isReadOnly }: {
  profilePhotos: string[];
  setProfilePhotos: React.Dispatch<React.SetStateAction<string[]>>;
  isReadOnly: boolean;
}) {
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user?.id) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        try {
          const url = await uploadProfilePhoto(file, user.id);
          if (!url) throw new Error("No URL returned from upload");
          urls.push(url);
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Failed to upload image: " + (err instanceof Error ? err.message : String(err)));
        }
      }
    }
    console.log("Uploaded URLs:", urls);
    setProfilePhotos((prev) => [...prev, ...urls].slice(0, 5));
    setUploading(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    await handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleChoosePhotos = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleRemovePhoto = (idx: number) => {
    setProfilePhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Camera className="w-6 h-6 text-[var(--color-accent)]" />
        <Text variant="h2" className="text-gray-800">Profile Photo Upload</Text>
      </div>
      <Text variant="body" className="text-gray-600 mb-6">
        Upload 3 clear headshots. Friendly, high-quality photos help students connect with you. (No filters, sunglasses, or group pictures please.)
      </Text>
      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${isReadOnly ? 'border-gray-300 bg-white' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleChoosePhotos}
        style={{ cursor: isReadOnly ? 'default' : 'pointer', minHeight: 180 }}
      >
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <Text variant="body" className="text-gray-500 mb-4 text-center">
          Drag and drop your photos here, or click to browse
        </Text>
        <Button
          type="button"
          variant="outline"
          className="border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
          onClick={(e) => { e.stopPropagation(); handleChoosePhotos(); }}
          disabled={isReadOnly || uploading || profilePhotos.length >= 5}
        >
          {uploading ? 'Uploading...' : 'Choose Photos'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={isReadOnly || uploading || profilePhotos.length >= 5}
        />
      </div>
      {profilePhotos.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-6">
          {profilePhotos.map((url, idx) => (
            <div key={idx} className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img
                src={url}
                  alt={`Profile ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
              <Button
                type="button"
                variant="outline"
                className="absolute top-1 right-1 px-2 py-0.5 text-xs text-red-500 border border-red-200 bg-white hover:bg-red-50"
                onClick={(e) => { e.stopPropagation(); handleRemovePhoto(idx); }}
                disabled={isReadOnly}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <Text variant="small" className="text-gray-400 mt-4">
        You can upload up to 5 photos. In the future, we'll use AI to help polish your profile photo for a professional look.
      </Text>
    </Card>
  );
}

function TeachingCertificatesUploadSection({ certificateUrls, setCertificateUrls, isReadOnly }: {
  certificateUrls: string[];
  setCertificateUrls: React.Dispatch<React.SetStateAction<string[]>>;
  isReadOnly: boolean;
}) {
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || !user?.id) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        try {
          const url = await uploadCertificateFile(file, user.id);
          if (!url) throw new Error("No URL returned from upload");
          urls.push(url);
        } catch (err) {
          console.error("Upload failed:", err);
          alert("Failed to upload certificate: " + (err instanceof Error ? err.message : String(err)));
        }
      }
    }
    console.log("Uploaded certificate URLs:", urls);
    setCertificateUrls((prev) => [...prev, ...urls].slice(0, 10)); // Allow up to 10 certificates
    setUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeCertificate = (index: number) => {
    setCertificateUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileName = (url: string) => {
    if (typeof url !== 'string') {
      console.warn('getFileName received non-string url:', url);
      return 'unknown-file';
    }
    const urlParts = url.split("/");
    return urlParts[urlParts.length - 1].split("?")[0];
  };

  const isImage = (url: string) => {
    const fileName = getFileName(url).toLowerCase();
    return fileName.match(/\.(jpg|jpeg|png|gif|webp)$/);
  };

    return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          Teaching Certificates
        </label>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Upload your teaching certificates, qualifications, or relevant documents (PDF, JPG, PNG). Max 10 files.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
            : "border-[var(--color-border)] hover:border-[var(--color-accent)]"
        } ${isReadOnly || uploading || certificateUrls.length >= 10 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isReadOnly && !uploading && certificateUrls.length < 10 ? handleChooseFiles : undefined}
      >
        <div className="space-y-2">
          <div className="text-[var(--color-text-secondary)]">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-[var(--color-text-primary)]">
            <Button
              type="button"
              variant="outline"
              className="border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
              onClick={(e) => { e.stopPropagation(); handleChooseFiles(); }}
              disabled={isReadOnly || uploading || certificateUrls.length >= 10}
            >
              {uploading ? 'Uploading...' : 'Choose Files'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={isReadOnly || uploading || certificateUrls.length >= 10}
            />
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Drag and drop files here, or click to select
          </p>
        </div>
      </div>

      {/* Preview Section */}
      {certificateUrls.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--color-text-primary)]">Uploaded Certificates:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificateUrls.map((url, index) => (
              <div key={index} className="relative group border rounded-lg overflow-hidden bg-[var(--color-background-secondary)]">
                {isImage(url) ? (
                  <img
                    src={url}
                    alt={`Certificate ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 flex items-center justify-center bg-[var(--color-background-tertiary)]">
                    <svg className="w-12 h-12 text-[var(--color-text-secondary)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">
                    {getFileName(url)}
                  </p>
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeCertificate(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    );
  }

function TeachingExperienceScreenshotSection({ screenshotUrl, setScreenshotUrl, isReadOnly, showToast, userId }: {
  screenshotUrl: string | null;
  setScreenshotUrl: React.Dispatch<React.SetStateAction<string | null>>;
  isReadOnly: boolean;
  showToast: (args: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }) => void;
  userId: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      if (!userId) throw new Error('User ID is required to upload screenshot.');
      const url = await uploadTeachingScreenshot(file, userId);
      setScreenshotUrl(url);
      showToast({
        type: 'success',
        title: 'Screenshot uploaded successfully!',
        message: 'Your teaching experience screenshot has been uploaded.'
      });
    } catch (error) {
      setUploadError('Failed to upload screenshot. Please try again.');
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload screenshot. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
    e.target.value = '';
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const removeScreenshot = () => {
    setScreenshotUrl(null);
    setUploadError(null);
  };

  const getFileName = (url: string) => {
    if (typeof url !== 'string') return 'Unknown file';
    try {
      const pathParts = url.split('/');
      const fileName = pathParts[pathParts.length - 1];
      return decodeURIComponent(fileName);
    } catch (error) {
      return 'Unknown file';
    }
  };

    return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <Text variant="h3" className="text-blue-700 mb-2">Share your teaching experience</Text>
        <ul className="text-blue-700 text-base list-disc pl-6 space-y-1">
          <li>Upload a screenshot showing your teaching experience (e.g., online platform, classroom, etc.)</li>
          <li>This helps us verify your teaching background</li>
          <li>Accepted formats: JPG, PNG, GIF (max 5MB)</li>
        </ul>
      </div>

      {!screenshotUrl ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
            isReadOnly 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
          }`}
          onClick={!isReadOnly ? handleChooseFile : undefined}
          onDragOver={!isReadOnly ? handleDragOver : undefined}
          onDragEnter={!isReadOnly ? handleDrag : undefined}
          onDragLeave={!isReadOnly ? handleDrag : undefined}
          onDrop={!isReadOnly ? handleDrop : undefined}
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <Text variant="body" className="text-gray-500 mb-4 text-center">
            {isReadOnly 
              ? 'No screenshot uploaded' 
              : 'Drag & drop your screenshot here or click to browse'
            }
          </Text>
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              className="border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
              onClick={e => { e.stopPropagation(); handleChooseFile(); }}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose Screenshot'}
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={isReadOnly || isUploading}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative w-full max-w-md h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={screenshotUrl}
              alt="Teaching experience screenshot"
              className="object-cover w-full h-full"
            />
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                className="absolute top-2 right-2 px-2 py-1 text-xs text-red-500 border border-red-200 bg-white hover:bg-red-50"
                onClick={removeScreenshot}
              >
                Remove
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{getFileName(screenshotUrl)}</span>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <Text variant="body" className="text-red-700">{uploadError}</Text>
        </div>
        )}
      </div>
    );
  }

function DemoVideoUploadSection({ demoVideoUrl, setDemoVideoUrl, isReadOnly, showToast, userId }: {
  demoVideoUrl: string | null;
  setDemoVideoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  isReadOnly: boolean;
  showToast: (args: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }) => void;
  userId: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith('video/')) {
      showToast({
        type: 'error',
        title: 'Invalid file type',
        message: 'Please select a video file (MP4, MOV, etc.)',
      });
      return;
    }
    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'File too large',
        message: 'Please select a video smaller than 100MB.',
      });
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    try {
      if (!userId) throw new Error('User ID is required to upload demo video.');
      const url = await uploadDemoVideo(file, userId);
      setDemoVideoUrl(url);
      showToast({
        type: 'success',
        title: 'Demo Video uploaded successfully!',
        message: 'Your demo video has been uploaded.'
      });
    } catch (err) {
      setUploadError('Failed to upload demo video. Please try again.');
      showToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload demo video. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFile(file);
    e.target.value = '';
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const removeDemoVideo = () => {
    setDemoVideoUrl(null);
    setUploadError(null);
  };

  const getFileName = (url: string) => {
    if (typeof url !== 'string') return 'Unknown file';
    try {
      const pathParts = url.split('/');
      const fileName = pathParts[pathParts.length - 1];
      return decodeURIComponent(fileName);
    } catch (error) {
      return 'Unknown file';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <Text variant="h3" className="text-blue-700 mb-2">Share your teaching experience</Text>
        <ul className="text-blue-700 text-base list-disc pl-6 space-y-1">
          <li>Upload a screenshot showing your teaching experience (e.g., online platform, classroom, etc.)</li>
          <li>This helps us verify your teaching background</li>
          <li>Accepted formats: JPG, PNG, GIF (max 5MB)</li>
        </ul>
      </div>

      {!demoVideoUrl ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
            isReadOnly 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-gray-300 bg-white hover:bg-gray-50 cursor-pointer'
          }`}
          onClick={!isReadOnly ? handleChooseFile : undefined}
          onDragOver={!isReadOnly ? handleDragOver : undefined}
          onDragEnter={!isReadOnly ? handleDrag : undefined}
          onDragLeave={!isReadOnly ? handleDrag : undefined}
          onDrop={!isReadOnly ? handleDrop : undefined}
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <Text variant="body" className="text-gray-500 mb-4 text-center">
            {isReadOnly 
              ? 'No demo video uploaded' 
              : 'Drag & drop your demo video here or click to browse'
            }
          </Text>
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              className="border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
              onClick={e => { e.stopPropagation(); handleChooseFile(); }}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose Demo Video'}
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={isReadOnly || isUploading}
          />
        </div>
      ) : (
        <div className="relative w-full max-w-xl aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
          <video
            src={demoVideoUrl}
            controls
            className="w-full h-full object-cover"
            style={{ background: '#000' }}
          >
            Your browser does not support the video tag.
          </video>
          {!isReadOnly && (
            <Button
              type="button"
              variant="outline"
              className="absolute top-2 right-2 px-2 py-1 text-xs text-red-500 border border-red-200 bg-white hover:bg-red-50"
              onClick={removeDemoVideo}
            >
              Remove
            </Button>
          )}
        </div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <Text variant="body" className="text-red-700">{uploadError}</Text>
        </div>
      )}
    </div>
  );
}

export default function TutorApplication() {
  return (
    <ProtectedRoute>
      <RequireEmailVerification>
        <Layout>
          <ToastContainer>
            <ErrorBoundary>
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                  <div className="relative lg:flex lg:min-h-[600px]">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:w-72 lg:shrink-0">
                      <div className="sticky top-24">
                        <DashboardSidebar userEmail={useAuth().user?.email} />
                      </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="lg:ml-8 flex-1">
                      <TutorApplicationContent />
                    </div>
                  </div>
                </div>
              </section>
            </ErrorBoundary>
          </ToastContainer>
        </Layout>
      </RequireEmailVerification>
    </ProtectedRoute>
  )
} 