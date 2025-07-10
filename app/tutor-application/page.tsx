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

function TutorApplicationContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

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
  const [profilePhotos, setProfilePhotos] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [certificateOther, setCertificateOther] = useState("");
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [teachingScreenshot, setTeachingScreenshot] = useState<File | null>(null);
  const teachingScreenshotInputRef = useRef<HTMLInputElement>(null);
  const [demoVideo, setDemoVideo] = useState<File | null>(null);
  const demoVideoInputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch('/api/tutor-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          languagesSpoken, // <-- include in payload
          profilePhotos, // <-- include in payload
          certificates, // <-- include in payload
          certificateOther, // <-- include in payload
          certificateFiles, // <-- include in payload
          teachingScreenshot, // <-- include in payload
          demoVideo, // <-- include in payload
          status: 'pending',
          submitted_at: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        showToast({
          type: 'success',
          title: 'Application Submitted!',
          message: 'Your tutor application has been submitted successfully.'
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
      const response = await fetch('/api/tutor-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'drafting',
        }),
      })

      if (response.ok) {
        setSavedProgress(true)
        showToast({
          type: 'success',
          title: 'Progress Saved',
          message: 'Your application progress has been saved successfully.'
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
              <Text variant="h3" className="font-semibold text-gray-800">Step 1 of 3 — Tutor Application</Text>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Save className="w-4 h-4" />
                {savedProgress ? "Progress saved!" : "Your progress is saved automatically"}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] h-3 rounded-full w-1/3 transition-all duration-500"></div>
            </div>
          </Card>
        </AnimationWrapper>

        {/* Application Form */}
        <AnimationWrapper type="slide-up" duration={0.8} delay={0.4}>
          <form onSubmit={handleSubmit} className="space-y-8">
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
            <ProfilePhotoUploadSection profilePhotos={profilePhotos} setProfilePhotos={setProfilePhotos} />

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
                  <label key={option} className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-all ${certificates.includes(option) ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-[var(--color-accent)]"
                      checked={certificates.includes(option)}
                      onChange={e => {
                        if (e.target.checked) setCertificates(prev => [...prev, option]);
                        else setCertificates(prev => prev.filter(c => c !== option));
                      }}
                    />
                    <span className="font-semibold text-gray-800">{option}</span>
                  </label>
                ))}
              </div>
              {certificates.includes('Other') && (
                <FormField label="Other Certificate (please explain)" className="mb-6">
                  <Input
                    value={certificateOther}
                    onChange={e => setCertificateOther(e.target.value)}
                    placeholder="Please specify your certificate and a brief explanation"
                  />
                </FormField>
              )}
              {certificates.length > 0 && (
                <div className="mt-6">
                  <Text variant="h3" className="mb-2">Upload Certificate Files</Text>
                  <Text variant="body" className="text-gray-600 mb-4">
                    Upload proof of your selected certifications (PDF, JPG, or PNG)
                  </Text>
                  <div
                    className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-white mb-4"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: 'pointer', minHeight: 120 }}
                  >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <Text variant="body" className="text-gray-500 mb-2 text-center">
                      Upload your certificate files
                    </Text>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
                      onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Choose Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,image/jpeg,image/png"
                      multiple
                      style={{ display: 'none' }}
                      onChange={e => {
                        if (!e.target.files) return;
                        const validFiles = Array.from(e.target.files).filter(
                          file => file.type === 'application/pdf' || file.type.startsWith('image/')
                        );
                        setCertificateFiles(prev => [...prev, ...validFiles].slice(0, 10));
                        e.target.value = '';
                      }}
                    />
                  </div>
                  {certificateFiles.length > 0 && (
                    <div className="flex flex-wrap gap-4 mt-2">
                      {certificateFiles.map((file, idx) => (
                        <div key={idx} className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                          {file.type === 'application/pdf' ? (
                            <div className="flex flex-col items-center justify-center w-full h-full">
                              <FileText className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-700">{file.name}</span>
                            </div>
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Certificate ${idx + 1}`}
                              className="object-cover w-full h-full"
                            />
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            className="absolute top-1 right-1 px-2 py-0.5 text-xs text-red-500 border border-red-200 bg-white hover:bg-red-50"
                            onClick={e => { e.stopPropagation(); setCertificateFiles(prev => prev.filter((_, i) => i !== idx)); }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
                />
              </FormField>

              {/* Upload Screenshot (Optional) */}
              <div className="mt-8">
                <Text variant="h3" className="mb-2">Upload Screenshot (Optional)</Text>
                <Text variant="body" className="text-gray-600 mb-4">
                  Upload a screenshot of your teaching hours or profile from another platform to help speed up your review process.
                </Text>
                <div
                  className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-white mb-4"
                  onClick={() => teachingScreenshotInputRef.current?.click()}
                  style={{ cursor: 'pointer', minHeight: 120 }}
                >
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <Text variant="body" className="text-gray-500 mb-2 text-center">
                    Upload screenshot (JPG, PNG)
                  </Text>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
                    onClick={e => { e.stopPropagation(); teachingScreenshotInputRef.current?.click(); }}
                  >
                    Choose Screenshot
                  </Button>
                  <input
                    ref={teachingScreenshotInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      if (file.type.startsWith('image/')) {
                        setTeachingScreenshot(file);
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
                {teachingScreenshot && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                      <img
                        src={URL.createObjectURL(teachingScreenshot)}
                        alt="Teaching Screenshot"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="absolute top-1 right-1 px-2 py-0.5 text-xs text-red-500 border border-red-200 bg-white hover:bg-red-50"
                        onClick={e => { e.stopPropagation(); setTeachingScreenshot(null); }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
                />
              </FormField>
            </Card>

            {/* Demo Video */}
            <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <Video className="w-6 h-6 text-[var(--color-accent)]" />
                <Text variant="h2" className="text-gray-800">Demo Video <span className="text-red-500">*</span></Text>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <Text variant="h3" className="text-blue-700 mb-2">Record a short video to introduce yourself</Text>
                <ul className="text-blue-700 text-base list-disc pl-6 space-y-1">
                  <li>This helps us understand your communication and teaching style</li>
                  <li>Be yourself — no need to over-prepare. You can update the video later before students see your profile</li>
                  <li>Speak clearly. If you're not a native English speaker, include a short English segment</li>
                  <li>Recommended: 1–3 minutes, filmed in a well-lit and quiet space</li>
                </ul>
              </div>
              <div
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center bg-white mb-4"
                onClick={() => demoVideoInputRef.current?.click()}
                style={{ cursor: 'pointer', minHeight: 180 }}
              >
                <Video className="w-12 h-12 text-gray-400 mb-4" />
                <Text variant="body" className="text-gray-500 mb-4 text-center">
                  Upload your demo video (MP4, MOV, or AVI)
                </Text>
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-[var(--color-accent)] text-[var(--color-accent)]"
                  onClick={e => { e.stopPropagation(); demoVideoInputRef.current?.click(); }}
                >
                  Choose Video
                </Button>
                <input
                  ref={demoVideoInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  style={{ display: 'none' }}
                  onChange={e => {
                    if (!e.target.files || e.target.files.length === 0) return;
                    const file = e.target.files[0];
                    if (file.type.startsWith('video/')) {
                      setDemoVideo(file);
                    }
                    e.target.value = '';
                  }}
                />
              </div>
              {demoVideo && (
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="relative w-64 h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <video
                      src={URL.createObjectURL(demoVideo)}
                      controls
                      className="object-cover w-full h-full"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="absolute top-1 right-1 px-2 py-0.5 text-xs text-red-500 border border-red-200 bg-white hover:bg-red-50"
                      onClick={e => { e.stopPropagation(); setDemoVideo(null); }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
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
                  />
                </FormField>
              </div>
            </Card>

            {/* Submit Section */}
            <Card className="p-8 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-2xl">
              <div className="text-center">
                <Text variant="h2" className="mb-4">Ready to Submit?</Text>
                <Text variant="lead" className="mb-8 opacity-90">
                  Review your application and submit when you're ready. You can always come back and make changes later.
                </Text>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    type="button"
                    onClick={handleSaveProgress}
                    variant="outline"
                    size="lg"
                    disabled={isLoading}
                    className="bg-white/20 border-2 border-white/50 text-white hover:bg-white/30 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm"
                  >
                    {isLoading ? (
                      <LoadingSpinner size={20} color="white" className="mr-2" />
                    ) : (
                      <Save className="mr-2 w-5 h-5" />
                    )}
                    {savedProgress ? "Saved!" : "Save Progress"}
                  </Button>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-white text-[var(--color-primary)] hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size={20} color="var(--color-primary)" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
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
function LanguagesYouSpeakSection({ languagesSpoken, setLanguagesSpoken, availableLanguages }: {
  languagesSpoken: { language: string; fluency: string }[];
  setLanguagesSpoken: React.Dispatch<React.SetStateAction<{ language: string; fluency: string }[]>>;
  availableLanguages: (currentIdx: number) => string[];
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
                  />
                </FormField>
              </div>
              <div className="md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-500 border border-red-200 hover:bg-red-50"
                  onClick={() => handleRemove(idx)}
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
          >
            + Add Another Language
          </Button>
        </div>
      )}
    </div>
  );
}

function ProfilePhotoUploadSection({ profilePhotos, setProfilePhotos }: {
  profilePhotos: File[];
  setProfilePhotos: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles = Array.from(files).filter(
      (file) => file.type.startsWith('image/')
    );
    // Limit to 5
    setProfilePhotos((prev) => {
      const combined = [...prev, ...validFiles];
      return combined.slice(0, 5);
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
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
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${dragActive ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)]' : 'border-gray-300 bg-white'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleChoosePhotos}
        style={{ cursor: 'pointer', minHeight: 180 }}
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
        >
          Choose Photos
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      {profilePhotos.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-6">
          {profilePhotos.map((file, idx) => (
            <div key={idx} className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              <img
                src={URL.createObjectURL(file)}
                alt={`Profile ${idx + 1}`}
                className="object-cover w-full h-full"
              />
              <Button
                type="button"
                variant="outline"
                className="absolute top-1 right-1 px-2 py-0.5 text-xs text-red-500 border border-red-200 bg-white hover:bg-red-50"
                onClick={(e) => { e.stopPropagation(); handleRemovePhoto(idx); }}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
      <Text variant="small" className="text-gray-400 mt-4">
        You can upload up to 5 photos. In the future, we’ll use AI to help polish your profile photo for a professional look.
      </Text>
    </Card>
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