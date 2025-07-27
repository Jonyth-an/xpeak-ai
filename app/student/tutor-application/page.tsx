'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button, Card, Input, Textarea, Select, Text } from '@/app/components/ui';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import RequireEmailVerification from '@/app/components/RequireEmailVerification';
import dynamic from 'next/dynamic';
import { 
  GraduationCap, Upload, Globe, Clock, User, Camera, FileText, Heart, 
  CheckCircle, AlertCircle, Star, Languages, Award, Video, Linkedin, 
  Instagram, ArrowRight, Save, Eye 
} from 'lucide-react';

// Dynamic import for ProfileSidebar
const ProfileSidebar = dynamic(() => import('../profile/components/ProfileSidebar'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
});

// Data constants
const languages = [
  "English", "Spanish", "Chinese (Mandarin)", "French", "German", "Italian", 
  "Portuguese", "Russian", "Japanese", "Korean", "Arabic", "Hindi", "Dutch", 
  "Swedish", "Norwegian", "Danish", "Finnish", "Polish", "Czech", "Hungarian", 
  "Turkish", "Greek"
];

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", 
  "Spain", "Italy", "Netherlands", "Sweden", "Norway", "Denmark", "Finland", 
  "Japan", "South Korea", "China", "Brazil", "Mexico", "Argentina", "Chile"
];

const certifications = [
  "TEFL", "CELTA", "TESOL", "DELTA", "DELE", "HSK", "JLPT", "DELF/DALF", 
  "Goethe Certificate", "CILS", "Other"
];

const fluencyLevels = ["Basic", "Intermediate", "Fluent", "Native"];

interface LanguageSkill {
  language: string;
  fluency: string;
}

interface FormData {
  nativeLanguage: string;
  accent: string;
  languageSkills: LanguageSkill[];
  fullName: string;
  displayName: string;
  birthCountry: string;
  currentCountry: string;
  timezone: string;
  profilePhotos: File[];
  introduction: string;
  education: string;
  certifications: string[];
  certificateFiles: File[];
  teachingExperience: string;
  experienceScreenshot: File | null;
  weeklyHours: string;
  demoVideo: File | null;
  motivation: string;
  linkedin: string;
  socialMedia: string;
}

export default function TutorApplicationPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    nativeLanguage: "",
    accent: "",
    languageSkills: [],
    fullName: "",
    displayName: "",
    birthCountry: "",
    currentCountry: "",
    timezone: "UTC-8 (Pacific Time)",
    profilePhotos: [],
    introduction: "",
    education: "",
    certifications: [],
    certificateFiles: [],
    teachingExperience: "",
    experienceScreenshot: null,
    weeklyHours: "",
    demoVideo: null,
    motivation: "",
    linkedin: "",
    socialMedia: "",
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savedProgress, setSavedProgress] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user already has an application
  useEffect(() => {
    checkExistingApplication();
  }, [user]);

  const checkExistingApplication = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tutor_applications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        // User already has an application
        console.log('Existing application found:', data);
        // You could redirect to application status page or show existing data
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
    }
  };

  const handleLanguageSkillAdd = () => {
    setFormData(prev => ({
      ...prev,
      languageSkills: [...prev.languageSkills, { language: "", fluency: "" }]
    }));
  };

  const handleLanguageSkillUpdate = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      languageSkills: prev.languageSkills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const handleLanguageSkillRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languageSkills: prev.languageSkills.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (field: string, files: FileList | null) => {
    if (!files) return;
    
    if (field === "profilePhotos") {
      setFormData(prev => ({
        ...prev,
        profilePhotos: Array.from(files).slice(0, 3)
      }));
    } else if (field === "demoVideo") {
      setFormData(prev => ({
        ...prev,
        demoVideo: files[0]
      }));
    } else if (field === "certificateFiles") {
      setFormData(prev => ({
        ...prev,
        certificateFiles: Array.from(files)
      }));
    } else if (field === "experienceScreenshot") {
      setFormData(prev => ({
        ...prev,
        experienceScreenshot: files[0]
      }));
    }
  };

  const handleSaveProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) throw new Error('No access token');

      const response = await fetch('/api/tutor-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationData: formData,
          action: 'save'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save application');
      }
      
      setSavedProgress(true);
      setTimeout(() => setSavedProgress(false), 2000);
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) throw new Error('No access token');

      const response = await fetch('/api/tutor-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationData: formData,
          action: 'submit'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <ProtectedRoute>
        <RequireEmailVerification>
          <Layout>
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-token-surface-accent-light min-h-screen">
              <div className="max-w-7xl mx-auto">
                <div className="relative lg:flex lg:min-h-[600px]">
                  {/* Sidebar */}
                  <div className="hidden lg:block lg:w-40 lg:shrink-0">
                    <div className="sticky top-24">
                      <ProfileSidebar 
                        activeTab="tutor-application"
                      />
                    </div>
                  </div>
                  {/* Main Content */}
                  <div className="lg:ml-40 flex-1">
                    <div className="space-y-8">
                      <Card className="p-12 bg-white/90 backdrop-blur-sm border-2 border-green-200 shadow-2xl text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8"
                        >
                          <CheckCircle className="w-12 h-12 text-white" />
                        </motion.div>

                        <Text variant="h1" as="h1" className="mb-6">
                          🎉 Thank you for applying!
                        </Text>
                        <Text variant="body" className="text-text-secondary mb-8 leading-relaxed">
                          Your application has been submitted successfully. You'll receive a confirmation email shortly and can
                          track your status from your Student Dashboard.
                        </Text>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-[#FF6B6B] to-[#FA5252] hover:from-[#FA5252] hover:to-[#F03E3E] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => window.location.href = '/student/dashboard'}
                          >
                            Go to Dashboard
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="lg"
                            className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-8 py-4 rounded-full text-lg font-semibold bg-transparent"
                          >
                            View Application Status
                            <Eye className="ml-2 w-5 h-5" />
                          </Button>
                        </div>
                      </Card>
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
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-token-surface-accent-light min-h-screen">
            <div className="max-w-7xl mx-auto">
              {/* Main Content with Sidebar - Use flex for large screens */}
              <div className="relative lg:flex lg:min-h-[600px]">
                {/* Sidebar */}
                <div className="hidden lg:block lg:w-40 lg:shrink-0">
                  <div className="sticky top-24">
                    <ProfileSidebar 
                      activeTab="tutor-application"
                    />
                  </div>
                </div>
                {/* Main Content */}
                <div className="lg:ml-40 flex-1">
                  <div className="space-y-8">
                    {/* Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="text-center mb-8"
                    >
                      <div className="flex items-center justify-center gap-4 mb-6">
                        <GraduationCap className="w-12 h-12 text-[#FF6B6B]" />
                        <Text variant="h1" as="h1" className="bg-gradient-to-r from-[#FF6B6B] to-[#6BCEF5] bg-clip-text text-transparent">
                          Welcome, Future Tutor!
                        </Text>
                      </div>
                      <Text variant="body" className="text-text-secondary leading-relaxed max-w-3xl mx-auto">
                        We're thrilled you're here. This short application helps us learn more about you and make sure we're a great
                        match. Let's begin — you can save and return anytime!
                      </Text>
                    </motion.div>

                    {/* Progress Bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="mb-8"
                    >
                      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <Text variant="h3" as="span" className="text-gray-800">Step 1 of 3 — Tutor Application</Text>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Save className="w-4 h-4" />
                            {savedProgress ? "Progress saved!" : "Your progress is saved automatically"}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-gradient-to-r from-[#FF6B6B] to-[#3EE8B5] h-3 rounded-full w-1/3 transition-all duration-500"></div>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Application Form */}
                    <motion.form
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="space-y-8"
                    >
          {/* Native Language Section */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Languages className="w-6 h-6 text-[#FF6B6B]" />
              <h2 className="text-2xl font-bold text-gray-800">Native Language</h2>
            </div>
            <p className="text-gray-600 mb-6">
              What is your native language? This will determine which language you're eligible to teach on the platform.
              (Only one can be selected.)
            </p>
            <Select
              value={formData.nativeLanguage}
              onChange={(e) => setFormData(prev => ({ ...prev, nativeLanguage: e.target.value }))}
              className="w-full h-12 text-lg border-2 border-gray-300 focus:border-[#FF6B6B] rounded-lg"
            >
              <option value="">Select your native language</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </Select>
          </Card>

          {/* Additional Languages Section */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-[#3EE8B5]" />
              <h2 className="text-2xl font-bold text-gray-800">Languages You Speak</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Which other languages do you speak? Add any languages you're comfortable using to support students. Select
              fluency for each: Basic / Intermediate / Fluent / Native
            </p>

            <div className="space-y-4">
              {formData.languageSkills.map((skill, index) => (
                <div key={index} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700">Language</Label>
                    <Select
                      value={skill.language}
                      onChange={(e) => handleLanguageSkillUpdate(index, "language", e.target.value)}
                      className="h-12 border-2 border-gray-300 focus:border-[#3EE8B5] rounded-lg"
                    >
                      <option value="">Select language</option>
                      {languages
                        .filter((lang) => lang !== formData.nativeLanguage)
                        .map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700">Fluency Level</Label>
                    <Select
                      value={skill.fluency}
                      onChange={(e) => handleLanguageSkillUpdate(index, "fluency", e.target.value)}
                      className="h-12 border-2 border-gray-300 focus:border-[#3EE8B5] rounded-lg"
                    >
                      <option value="">Select fluency</option>
                      {fluencyLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleLanguageSkillRemove(index)}
                    className="h-12 px-4 border-2 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                onClick={handleLanguageSkillAdd}
                variant="outline"
                className="w-full h-12 border-2 border-[#3EE8B5] text-[#0F766E] hover:bg-[#F0FDF9] rounded-lg bg-transparent"
              >
                + Add Another Language
              </Button>
            </div>
          </Card>

          {/* Personal Information & Location */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#6BCEF5]" />
              <h2 className="text-2xl font-bold text-gray-800">Personal Information & Location</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Full Legal Name <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-3">
                  Your full legal name (private). This is used for internal verification and payout setup only. It will
                  not be shown to students.
                </p>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="h-12 border-2 border-gray-300 focus:border-[#6BCEF5] rounded-lg"
                  placeholder="Enter your full legal name"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Display Name <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-3">
                  What name should students see? Use your real first name, nickname, or preferred teaching name. (No
                  emojis, links, or inappropriate words.)
                </p>
                <Input
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="h-12 border-2 border-gray-300 focus:border-[#6BCEF5] rounded-lg"
                  placeholder="Enter your display name"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Place of Birth <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-3">
                  Where were you born? (Select your country of birth from the list)
                </p>
                <Select
                  value={formData.birthCountry}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthCountry: e.target.value }))}
                  className="h-12 border-2 border-gray-300 focus:border-[#6BCEF5] rounded-lg"
                >
                  <option value="">Select country of birth</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Current Residence <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-gray-500 mb-3">
                  Where do you currently live? Helps us understand your availability, timezone, and student matching.
                </p>
                <Select
                  value={formData.currentCountry}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentCountry: e.target.value }))}
                  className="h-12 border-2 border-gray-300 focus:border-[#6BCEF5] rounded-lg"
                >
                  <option value="">Select current country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timezone
              </Label>
              <p className="text-sm text-gray-500 mb-3">
                (Auto-detected) Your availability will be shown to students in their local time. (You can adjust this if
                needed.)
              </p>
              <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-gray-700">
                {formData.timezone}
              </div>
            </div>
          </Card>

          {/* Profile Photos */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-6 h-6 text-[#3EE8B5]" />
              <h2 className="text-2xl font-bold text-gray-800">Profile Photo Upload</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Upload 3 clear headshots. Friendly, high-quality photos help students connect with you. (No filters,
              sunglasses, or group pictures please.)
            </p>

            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#3EE8B5] transition-colors cursor-pointer"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-[#3EE8B5]', 'bg-[#F0FDF9]');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-[#3EE8B5]', 'bg-[#F0FDF9]');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-[#3EE8B5]', 'bg-[#F0FDF9]');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                  handleFileUpload("profilePhotos", files);
                }
              }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload("profilePhotos", e.target.files)}
                className="hidden"
                id="profile-photos"
              />
              <div className="cursor-pointer block">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Drag and drop your photos here, or click to browse</p>
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-[#3EE8B5] text-[#0F766E] hover:bg-[#F0FDF9] bg-transparent"
                  onClick={() => document.getElementById('profile-photos')?.click()}
                >
                  Choose Photos
                </Button>
              </div>
              {formData.profilePhotos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-green-600 mb-2">{formData.profilePhotos.length} photo(s) selected</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from(formData.profilePhotos).map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = Array.from(formData.profilePhotos).filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, profilePhotos: newFiles }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Self Introduction */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-[#6BCEF5]" />
              <h2 className="text-2xl font-bold text-gray-800">Self-Introduction</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Tell us about yourself (200–400 words). Share your teaching approach, personal background, and how you
              support student success. Tip: Write like you're speaking to a future student!
            </p>
            <Textarea
              value={formData.introduction}
              onChange={(e) => setFormData((prev) => ({ ...prev, introduction: e.target.value }))}
              className="min-h-[200px] border-2 border-gray-300 focus:border-[#6BCEF5] rounded-lg resize-none"
              placeholder="Tell us about yourself, your teaching approach, and how you help students succeed..."
              required
            />
            <div className="text-right text-sm text-gray-500 mt-2">{formData.introduction.length}/400 words</div>
          </Card>

          {/* Educational Background */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-6 h-6 text-[#FF6B6B]" />
              <h2 className="text-2xl font-bold text-gray-800">Educational Background</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Where did you study? Share your academic background (e.g., degrees, fields of study, institutions).
            </p>
            <Textarea
              value={formData.education}
              onChange={(e) => setFormData((prev) => ({ ...prev, education: e.target.value }))}
              className="min-h-[120px] border-2 border-gray-300 focus:border-[#FF6B6B] rounded-lg resize-none"
              placeholder="Share your educational background, degrees, and institutions..."
            />
          </Card>

          {/* Teaching Certifications */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-[#3EE8B5]" />
              <h2 className="text-2xl font-bold text-gray-800">Teaching Certificates</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Do you have any teaching certifications? Select from a list (e.g., TEFL, CELTA, DELE, HSK) and upload
              proof. (Required if selected.) Not listed? Choose Other and explain briefly.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {certifications.map((cert) => (
                <label
                  key={cert}
                  className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-[#3EE8B5] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.certifications.includes(cert)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData((prev) => ({ ...prev, certifications: [...prev.certifications, cert] }))
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          certifications: prev.certifications.filter((c) => c !== cert),
                        }))
                      }
                    }}
                    className="w-4 h-4 text-[#3EE8B5] border-gray-300 rounded focus:ring-[#3EE8B5]"
                  />
                  <span className="text-sm font-medium text-gray-700">{cert}</span>
                </label>
              ))}
            </div>
            {formData.certifications.length > 0 && (
              <div className="mt-6">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload Certificate Files</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Upload proof of your selected certifications (PDF, JPG, or PNG)
                </p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#3EE8B5] transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">Upload your certificate files</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload("certificateFiles", e.target.files)}
                    className="hidden"
                    id="certificate-files"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 border-[#3EE8B5] text-[#0F766E] hover:bg-[#F0FDF9] bg-transparent"
                    onClick={() => document.getElementById('certificate-files')?.click()}
                  >
                    Choose Files
                  </Button>
                  {formData.certificateFiles.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">{formData.certificateFiles.length} file(s) selected</p>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Teaching Experience */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-[#6BCEF5]" />
              <h2 className="text-2xl font-bold text-gray-800">Teaching Experience</h2>
            </div>
            <p className="text-gray-600 mb-6">
              How long have you been teaching? Optionally mention platforms you've taught on (e.g., Cambly, Preply,
              italki, etc.). You can also upload a screenshot of your teaching hours or profile from another platform
              (optional). Tip: This may help speed up your review process.
            </p>
            <Textarea
              value={formData.teachingExperience}
              onChange={(e) => setFormData((prev) => ({ ...prev, teachingExperience: e.target.value }))}
              className="min-h-[120px] border-2 border-gray-300 focus:border-[#6BCEF5] rounded-lg resize-none"
              placeholder="Describe your teaching experience, platforms you've used, and any relevant background..."
            />
            <div className="mt-6">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload Screenshot (Optional)</Label>
              <p className="text-sm text-gray-500 mb-3">
                Upload a screenshot of your teaching hours or profile from another platform to help speed up your review
                process.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#6BCEF5] transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">Upload screenshot (JPG, PNG)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("experienceScreenshot", e.target.files)}
                  className="hidden"
                  id="experience-screenshot"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-2 border-[#6BCEF5] text-[#0F766E] hover:bg-[#F0FDF9] bg-transparent"
                  onClick={() => document.getElementById('experience-screenshot')?.click()}
                >
                  Choose Screenshot
                </Button>
                {formData.experienceScreenshot && (
                  <p className="text-sm text-green-600 mt-2">
                    Screenshot selected: {formData.experienceScreenshot.name}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Weekly Commitment */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-[#FF6B6B]" />
              <h2 className="text-2xl font-bold text-gray-800">Weekly Time Commitment</h2>
            </div>
            <p className="text-gray-600 mb-6">
              How many hours per week are you available to teach? This helps us understand your commitment level.
              (You'll set specific times later in your availability calendar.)
            </p>
            <Select
              value={formData.weeklyHours}
              onChange={(e) => setFormData((prev) => ({ ...prev, weeklyHours: e.target.value }))}
              className="w-full h-12 border-2 border-gray-300 focus:border-[#FF6B6B] rounded-lg"
            >
              <option value="">Select weekly hours</option>
              <option value="1-5">1-5 hours per week</option>
              <option value="6-10">6-10 hours per week</option>
              <option value="11-20">11-20 hours per week</option>
              <option value="21-30">21-30 hours per week</option>
              <option value="30+">30+ hours per week</option>
            </Select>
          </Card>

          {/* Demo Video */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Video className="w-6 h-6 text-[#3EE8B5]" />
              <h2 className="text-2xl font-bold text-gray-800">
                Demo Video <span className="text-red-500">*</span>
              </h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Record a short video to introduce yourself</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• This helps us understand your communication and teaching style</li>
                <li>
                  • Be yourself — no need to over-prepare. You can update the video later before students see your
                  profile
                </li>
                <li>• Speak clearly. If you're not a native English speaker, include a short English segment</li>
                <li>• Recommended: 1–3 minutes, filmed in a well-lit and quiet space</li>
              </ul>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#3EE8B5] transition-colors">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload your demo video (MP4, MOV, or AVI)</p>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload("demoVideo", e.target.files)}
                className="hidden"
                id="demo-video"
              />
              <Button
                type="button"
                variant="outline"
                className="border-2 border-[#3EE8B5] text-[#0F766E] hover:bg-[#F0FDF9] bg-transparent"
                onClick={() => document.getElementById('demo-video')?.click()}
              >
                Choose Video
              </Button>
              {formData.demoVideo && (
                <p className="text-sm text-green-600 mt-2">Video selected: {formData.demoVideo.name}</p>
              )}
            </div>
          </Card>

          {/* Motivation Letter */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-[#FF6B6B]" />
              <h2 className="text-2xl font-bold text-gray-800">Motivation Letter</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Why do you want to teach on our platform? Share your goals, teaching passion, and what excites you about
              joining our global tutor team.
            </p>
            <Textarea
              value={formData.motivation}
              onChange={(e) => setFormData((prev) => ({ ...prev, motivation: e.target.value }))}
              className="min-h-[150px] border-2 border-gray-300 focus:border-[#FF6B6B] rounded-lg resize-none"
              placeholder="Share your motivation for teaching on our platform and your goals..."
              required
            />
          </Card>

          {/* Optional Fields */}
          <Card className="p-8 bg-gray-50/90 backdrop-blur-sm border border-gray-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-gray-500" />
              <h2 className="text-2xl font-bold text-gray-800">Optional Fields</h2>
              <span className="text-sm text-gray-500">(This wouldn't show to students)</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn or Professional Portfolio
                </Label>
                <p className="text-sm text-gray-500 mb-3">
                  Optional – showcase your professional or academic background
                </p>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, linkedin: e.target.value }))}
                  className="h-12 border-2 border-gray-300 focus:border-gray-400 rounded-lg"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Social Media
                </Label>
                <p className="text-sm text-gray-500 mb-3">For tutors who create content or have teaching communities</p>
                <Input
                  value={formData.socialMedia}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socialMedia: e.target.value }))}
                  className="h-12 border-2 border-gray-300 focus:border-gray-400 rounded-lg"
                  placeholder="Instagram, YouTube, etc."
                />
              </div>
            </div>
          </Card>

          {/* Submit Section */}
          <Card className="p-8 bg-gradient-to-r from-[#FF6B6B] to-[#6BCEF5] text-white shadow-2xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Submit?</h2>
              <p className="text-xl mb-8 opacity-90">
                Review your application and submit when you're ready. You can always come back and make changes later.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  type="button"
                  onClick={handleSaveProgress}
                  variant="outline"
                  size="lg"
                  disabled={loading}
                  className="bg-white/20 border-2 border-white/50 text-white hover:bg-white/30 px-8 py-4 rounded-full text-lg font-semibold backdrop-blur-sm"
                >
                  <Save className="mr-2 w-5 h-5" />
                  {loading ? "Saving..." : savedProgress ? "Saved!" : "Save Progress"}
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="bg-white text-[#FF6B6B] hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? "Submitting..." : "Submit Application"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-white/80 mt-6 text-center">
                By submitting, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </Card>
        </motion.form>
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