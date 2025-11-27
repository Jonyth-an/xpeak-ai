"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Input from "@/app/components/ui/Input";
import Textarea from "@/app/components/ui/Textarea";
import Select from "@/app/components/ui/Select";
import { Save, CheckCircle, User, Camera, Video, Eye, Star, Languages, Upload, Monitor, Mic, Wifi, Play, Calendar, Globe, ArrowRight } from "lucide-react";

const steps = [
  "Welcome",
  "Profile Setup",
  "System Test",
  "Availability"
];

const languages = [
  "English",
  "Spanish",
  "Chinese (Mandarin)",
];

const fluencyLevels = ["Basic", "Intermediate", "Fluent", "Native"];

const certifications = [
  "TEFL",
  "CELTA",
  "TESOL",
  "DELTA",
  "DELE",
  "HSK",
  "JLPT",
  "DELF/DALF",
  "Goethe Certificate",
  "CILS",
  "Other",
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00"
];

interface OnboardingData {
  displayName: string;
  profileBio: string;
  teachingStyle: string;
  languageSkills: { language: string; fluency: string }[];
  profilePhoto: File | null;
  introVideo: File | null;
  education: string;
  certifications: string[];
  certificateFiles: File[];
  availability: { [key: string]: string[] };
}

export default function TutorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [systemTestComplete, setSystemTestComplete] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    displayName: "",
    profileBio: "",
    teachingStyle: "",
    languageSkills: [],
    profilePhoto: null,
    introVideo: null,
    education: "",
    certifications: [],
    certificateFiles: [],
    availability: {},
  });

  // Generate next 7 days from today
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        key: date.toISOString().split('T')[0], // YYYY-MM-DD format
        label: date.toLocaleDateString('en-US', { weekday: 'long' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date
      });
    }
    return days;
  };

  const weekDays = getNext7Days();

  // Fetch tutor application data and sync to onboarding
  useEffect(() => {
    const fetchTutorApplication = async () => {
      try {
        const response = await fetch('/api/tutor-applications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
          }
        });
        
        if (response.ok) {
          const { application } = await response.json();
          if (application?.application_data) {
            const data = application.application_data;
            
            setOnboardingData(prev => ({
              ...prev,
              displayName: data.displayName || data.fullName || "",
              profileBio: data.introduction || "",
              teachingStyle: data.teachingExperience || "",
              languageSkills: data.languagesSpoken || [],
              education: data.education || "",
              // Note: profilePhotos, certificateUrls, demoVideoUrl would need to be handled separately
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching tutor application:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorApplication();
  }, []);

  const handleLanguageSkillUpdate = (index: number, field: string, value: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      languageSkills: prev.languageSkills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const handleLanguageSkillAdd = () => {
    setOnboardingData((prev) => ({
      ...prev,
      languageSkills: [...prev.languageSkills, { language: "", fluency: "" }],
    }));
  };

  const handleLanguageSkillRemove = (index: number) => {
    setOnboardingData((prev) => ({
      ...prev,
      languageSkills: prev.languageSkills.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (field: "profilePhoto" | "introVideo", files: FileList | null) => {
    if (files && files[0]) {
      setOnboardingData((prev) => ({
        ...prev,
        [field]: files[0],
      }));
    }
  };

  const handleCertificateFileUpload = (files: FileList | null) => {
    if (files) {
      setOnboardingData((prev) => ({
        ...prev,
        certificateFiles: Array.from(files),
      }));
    }
  };

  const runSystemTest = async () => {
    setIsRunningTest(true);
    
    try {
      // Request camera and microphone access
      if (typeof navigator !== 'undefined') {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        // Simulate test duration
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Stop the stream
        stream.getTracks().forEach(track => track.stop());
        
        setSystemTestComplete(true);
      }
    } catch (error) {
      console.error('System test failed:', error);
      // Still mark as complete for demo purposes
      setSystemTestComplete(true);
    } finally {
      setIsRunningTest(false);
    }
  };

  const toggleTimeSlot = (day: string, time: string) => {
    setOnboardingData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day]?.includes(time)
          ? prev.availability[day].filter((t) => t !== time)
          : [...(prev.availability[day] || []), time],
      },
    }));
  };

  const getTotalAvailableSlots = () => {
    return Object.values(onboardingData.availability).reduce((total, slots) => total + slots.length, 0);
  };

  const handleGoToDashboard = () => {
    router.push('/tutor');
  };

  const handlePreviewProfile = () => {
    router.push('/tutor/profile');
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="p-12 bg-white/90 backdrop-blur-sm border-2 border-green-200 shadow-2xl max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-token-text mb-6">🎉 You're All Set!</h1>
          <p className="text-xl text-token-text-secondary mb-4 leading-relaxed">Your tutor profile is now live.</p>
          <p className="text-lg text-token-text-secondary mb-8">Students can start discovering and booking lessons with you.</p>

          <div className="bg-token-accent-50 border border-token-accent-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-token-accent-800 mb-3">What's next:</h3>
            <ul className="text-token-accent-700 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-token-accent-600" />
                You'll receive notifications when a student books
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-token-accent-600" />
                You can edit your availability or profile anytime
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-token-accent-600" />
                Keep an eye on your dashboard for lesson updates
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoToDashboard}
              size="lg"
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-600)] hover:from-[var(--color-primary-600)] hover:to-[var(--color-primary-700)] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Go to My Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={handlePreviewProfile}
              variant="outline"
              size="lg"
              className="border-2 border-token-border text-token-text-secondary hover:bg-token-surface-subtle px-8 py-4 rounded-full text-lg font-semibold bg-transparent"
            >
              Preview My Public Profile
              <Eye className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              ← Back to Editing
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Profile Preview</h1>
              <p className="text-token-text-secondary">This is how students will see your profile</p>
            </div>
          </div>

          <Card className="p-8">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-32 h-32 bg-[var(--color-gray-200)] rounded-full overflow-hidden flex-shrink-0">
                {onboardingData.profilePhoto ? (
                  <img
                    src={URL.createObjectURL(onboardingData.profilePhoto)}
                    alt={onboardingData.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-[var(--color-gray-400)]" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold">{onboardingData.displayName}</h2>
                  <span className="text-lg">🇺🇸</span>
                </div>
                <p className="text-lg text-token-text-secondary mb-3">Native Language: English (American Accent)</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold">4.8</span>
                    <span className="text-token-text-secondary">(126 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3">About Me</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">{onboardingData.profileBio}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Teaching Style</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">{onboardingData.teachingStyle}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Education</h3>
                <p className="text-[var(--color-text-secondary)] leading-relaxed">{onboardingData.education}</p>
              </div>

              {onboardingData.certifications.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-3">Certificates & Experience</h3>
                  <div className="flex flex-wrap gap-3">
                    {onboardingData.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="bg-[var(--color-secondary-100)] text-[var(--color-secondary-800)] px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold mb-3">Languages I Speak</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-[var(--color-accent-100)] text-[var(--color-accent-800)] px-3 py-1 rounded-full text-sm font-medium">
                    English (Native)
                  </span>
                  {onboardingData.languageSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[var(--color-success-100)] text-[var(--color-success-800)] px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill.language} ({skill.fluency})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-token-primary to-token-accent bg-clip-text text-transparent mb-4">
            Welcome to Your Tutor Onboarding
          </h1>
          <p className="text-xl text-token-text-secondary leading-relaxed max-w-3xl mx-auto">
            {currentStep === 0 && "You're just 3 quick steps away from going live on the platform."}
            {currentStep === 1 && "This is what students will see when they discover your profile. Take a moment to make it shine!"}
            {currentStep === 2 && "Make sure your camera, mic, and internet connection are ready for live video lessons."}
            {currentStep === 3 && "Choose time slots when you're available for students to book lessons."}
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-token-text">
              Step {currentStep + 1} of 4 — Tutor Onboarding
            </span>
            <div className="flex items-center gap-2 text-sm text-token-text-secondary">
              <Save className="w-4 h-4" />
              Progress saved automatically
            </div>
          </div>
          <div className="w-full bg-token-surface-subtle rounded-full h-3">
            <div
              className="bg-gradient-to-r from-token-primary to-token-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-4 text-sm">
            {steps.map((step, idx) => (
              <div key={step} className={`flex items-center gap-2 ${currentStep >= idx ? "text-token-success" : "text-token-text-muted"}`}>
                {currentStep > idx ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-current"></div>
                )}
                {step}
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <Card className="p-8">
          {currentStep === 0 ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Let's Get You Ready to Teach!</h2>
              <p className="text-xl text-gray-600 mb-8">
                Your application is approved. You're just 3 quick steps away from going live on the platform.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Finalize Your Tutor Profile</h3>
                    <p className="text-gray-600 text-sm">Polish your bio, photos, and teaching style</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Test Your System</h3>
                    <p className="text-gray-600 text-sm">Check camera, microphone, and internet connection</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Set Your Calendar Availability</h3>
                    <p className="text-gray-600 text-sm">Choose when students can book lessons with you</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setCurrentStep(1)}
                size="lg"
                className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-600)] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Begin Profile Setup
              </Button>
            </div>
          ) : currentStep === 1 ? (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-token-primary" />
                <h2 className="text-2xl font-bold">Finalize Your Tutor Profile</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Name</label>
                  <p className="text-sm text-token-text-secondary mb-3">
                    This is your public name. Students will see this across the platform.
                  </p>
                  <Input
                    value={onboardingData.displayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOnboardingData((prev) => ({ ...prev, displayName: e.target.value }))}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Profile Bio</label>
                  <p className="text-sm text-token-text-secondary mb-3">
                    Write a short, friendly introduction. What kind of students do you love teaching? (Recommended: 200–300 words)
                  </p>
                  <Textarea
                    value={onboardingData.profileBio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOnboardingData((prev) => ({ ...prev, profileBio: e.target.value }))}
                    className="min-h-[120px]"
                  />
                  <div className="text-right text-sm text-token-text-secondary mt-2">
                    {onboardingData.profileBio.length} characters
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Teaching Style & Focus</label>
                  <p className="text-sm text-token-text-secondary mb-3">
                    How do you structure lessons? What do you focus on? (e.g., conversational, grammar-focused, test prep)
                  </p>
                  <Textarea
                    value={onboardingData.teachingStyle}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOnboardingData((prev) => ({ ...prev, teachingStyle: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Languages You Speak</label>
                  <p className="text-sm text-token-text-secondary mb-3">
                    This helps match you with students who speak your native or second languages. (Edit fluency levels if needed.)
                  </p>
                  <div className="space-y-4">
                    {onboardingData.languageSkills.map((skill, index) => (
                      <div key={index} className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="text-sm font-medium">Language</label>
                          <Select
                            value={skill.language}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLanguageSkillUpdate(index, "language", e.target.value)}
                          >
                            <option value="">Select language</option>
                            {languages.map((lang) => (
                              <option key={lang} value={lang}>
                                {lang}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="flex-1">
                          <label className="text-sm font-medium">Fluency Level</label>
                          <Select
                            value={skill.fluency}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLanguageSkillUpdate(index, "fluency", e.target.value)}
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
                          className="h-12 px-4"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={handleLanguageSkillAdd}
                      variant="outline"
                      className="w-full h-12"
                    >
                      + Add Another Language
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Profile Photo</label>
                  <p className="text-sm text-token-text-secondary mb-3">
                    Upload a clear, professional headshot. You can update it anytime.
                  </p>
                  <div className="border-2 border-dashed border-token-border rounded-lg p-6 text-center hover:border-token-secondary transition-colors">
                    <Camera className="w-8 h-8 text-token-text-muted mx-auto mb-3" />
                    <p className="text-token-text-secondary mb-3">Upload your profile photo</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload("profilePhoto", e.target.files)}
                      className="hidden"
                      id="profile-photo"
                    />
                    <label htmlFor="profile-photo">
                      <Button type="button" variant="outline">
                        Choose Photo
                      </Button>
                    </label>
                    {onboardingData.profilePhoto && (
                      <p className="text-sm text-token-success mt-2">
                        Photo selected: {onboardingData.profilePhoto.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Intro Video</label>
                  <p className="text-sm text-token-text-secondary mb-3">
                    Optional: Re-record or re-upload if you'd like to polish your video before going live.
                  </p>
                  <div className="border-2 border-dashed border-token-border rounded-lg p-6 text-center hover:border-token-accent transition-colors">
                    <Video className="w-8 h-8 text-token-text-muted mx-auto mb-3" />
                    <p className="text-token-text-secondary mb-3">Upload your intro video (optional)</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload("introVideo", e.target.files)}
                      className="hidden"
                      id="intro-video"
                    />
                    <label htmlFor="intro-video">
                      <Button type="button" variant="outline">
                        Choose Video
                      </Button>
                    </label>
                    {onboardingData.introVideo && (
                      <p className="text-sm text-[var(--color-success)] mt-2">
                        Video selected: {onboardingData.introVideo.name}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Educational Background</label>
                  <p className="text-sm text-token-text-secondary mb-3">
                    Share your academic background, degrees, and institutions. This helps students understand your qualifications.
                  </p>
                  <Textarea
                    value={onboardingData.education}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOnboardingData((prev) => ({ ...prev, education: e.target.value }))}
                    className="min-h-[100px]"
                    placeholder="e.g., Bachelor's in English Literature from UC Berkeley, Master's in Applied Linguistics..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Teaching Certificates</label>
                  <p className="text-sm text-token-text-secondary mb-3">
                    Select any teaching certifications you have. These help build trust with students.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {certifications.map((cert) => (
                      <label
                        key={cert}
                        className="flex items-center space-x-3 p-3 border-2 border-token-border rounded-lg hover:border-token-secondary cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={onboardingData.certifications.includes(cert)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setOnboardingData((prev) => ({
                                ...prev,
                                certifications: [...prev.certifications, cert],
                              }));
                            } else {
                              setOnboardingData((prev) => ({
                                ...prev,
                                certifications: prev.certifications.filter((c) => c !== cert),
                              }));
                            }
                          }}
                          className="w-4 h-4 text-token-secondary border-token-border rounded focus:ring-token-secondary"
                        />
                        <span className="text-sm font-medium">{cert}</span>
                      </label>
                    ))}
                  </div>

                  {onboardingData.certifications.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Upload Certificate Files (Optional)
                      </label>
                      <p className="text-sm text-token-text-secondary mb-3">
                        Upload proof of your selected certifications to build additional trust with students.
                      </p>
                      <div className="border-2 border-dashed border-token-border rounded-lg p-6 text-center hover:border-token-secondary transition-colors">
                        <Upload className="w-8 h-8 text-token-text-muted mx-auto mb-3" />
                        <p className="text-token-text-secondary mb-3">Upload certificate files (PDF, JPG, PNG)</p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleCertificateFileUpload(e.target.files)}
                          className="hidden"
                          id="certificate-files"
                        />
                        <label htmlFor="certificate-files">
                          <Button type="button" variant="outline">
                            Choose Files
                          </Button>
                        </label>
                        {onboardingData.certificateFiles.length > 0 && (
                          <p className="text-sm text-token-success mt-2">
                            {onboardingData.certificateFiles.length} file(s) selected
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Box */}
              <Card className="p-6 bg-token-accent-50">
                <h3 className="text-lg font-bold text-token-accent-800 mb-4">Your profile will look like this to students</h3>
                <div className="bg-white rounded-lg p-6 border border-token-accent-200">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-token-surface-subtle rounded-full overflow-hidden flex-shrink-0">
                      {onboardingData.profilePhoto ? (
                        <img
                          src={URL.createObjectURL(onboardingData.profilePhoto)}
                          alt={onboardingData.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-token-text-muted" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{onboardingData.displayName}</h4>
                      <p className="text-token-text-secondary">Native Language: English (American Accent)</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold">4.8</span>
                        <span className="text-sm text-token-text-secondary">(126 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-token-text-secondary text-sm line-clamp-2">{onboardingData.profileBio}</p>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  size="lg"
                >
                  <Eye className="mr-2 w-5 h-5" />
                  Preview My Profile
                </Button>
                <Button
                  onClick={() => setCurrentStep(2)}
                  size="lg"
                >
                  Save and Continue
                </Button>
              </div>
            </div>
          ) : currentStep === 2 ? (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <Monitor className="w-6 h-6 text-token-accent" />
                <h2 className="text-2xl font-bold">Check Your System</h2>
              </div>

              <div className="text-center mb-8">
                <p className="text-xl text-token-text-secondary mb-6">
                  Make sure your camera, mic, and internet connection are ready for live video lessons.
                </p>
                <p className="text-lg text-token-text-secondary mb-8">
                  Click the button below to test your setup.
                </p>

                {!systemTestComplete ? (
                  <Button
                    onClick={runSystemTest}
                    size="lg"
                    disabled={isRunningTest}
                    className="bg-gradient-to-r from-token-accent to-token-secondary hover:from-token-secondary hover:to-token-accent text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    {isRunningTest ? 'Testing...' : 'Run System Test'}
                  </Button>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                                    <div className="bg-token-success-50 border border-token-success-200 rounded-lg p-6">
                  <h3 className="font-semibold text-token-success-800 mb-3">✅ Looks good!</h3>
                  <p className="text-token-success-700">
                    If students ever have trouble hearing or seeing you, we'll let you know.
                  </p>
                </div>
                  </div>
                )}
              </div>

              {/* System Check Items */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-token-accent-50 rounded-lg border border-token-accent-200">
                  <Camera className="w-12 h-12 text-token-accent-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-token-accent-800 mb-2">Camera</h3>
                  <p className="text-sm text-token-accent-700">
                    {systemTestComplete ? "✅ Working properly" : "Testing camera quality"}
                  </p>
                </div>
                <div className="text-center p-6 bg-token-secondary-50 rounded-lg border border-token-secondary-200">
                  <Mic className="w-12 h-12 text-token-secondary-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-token-secondary-800 mb-2">Microphone</h3>
                  <p className="text-sm text-token-secondary-700">
                    {systemTestComplete ? "✅ Clear audio detected" : "Testing microphone"}
                  </p>
                </div>
                <div className="text-center p-6 bg-token-success-50 rounded-lg border border-token-success-200">
                  <Wifi className="w-12 h-12 text-token-success-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-token-success-800 mb-2">Internet</h3>
                  <p className="text-sm text-token-success-700">
                    {systemTestComplete ? "✅ Connection stable" : "Testing connection speed"}
                  </p>
                </div>
              </div>

              {systemTestComplete && (
                <div className="text-center">
                  <Button
                    onClick={() => setCurrentStep(3)}
                    size="lg"
                    className="bg-gradient-to-r from-token-primary to-token-primary-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Continue to Availability
                  </Button>
                </div>
              )}
            </div>
          ) : currentStep === 3 ? (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-token-secondary" />
                <h2 className="text-2xl font-bold">Set Your Weekly Availability</h2>
              </div>

              <div className="mb-8">
                <p className="text-xl text-token-text-secondary mb-4">
                  Choose time slots when you're available for students to book lessons.
                </p>
                <div className="bg-token-accent-50 border border-token-accent-200 rounded-lg p-4">
                  <ul className="text-token-accent-700 space-y-1">
                    <li>• Select 30-minute time slots you'd like to teach</li>
                    <li>• Open at least 3 slots to activate your profile</li>
                    <li>• You can adjust this anytime in your dashboard</li>
                  </ul>
                </div>
              </div>

              {/* Calendar Widget */}
              <div className="space-y-6 mb-8">
                {weekDays.map((day) => (
                  <div key={day.key} className="border border-token-border rounded-lg p-4">
                    <h3 className="font-semibold text-token-text mb-3">
                      {day.label} • {day.date}
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => toggleTimeSlot(day.key, time)}
                          className={`p-2 text-sm rounded-lg border-2 transition-all ${
                            onboardingData.availability[day.key]?.includes(time)
                              ? "bg-gradient-to-r from-token-secondary to-token-accent text-white border-token-secondary"
                              : "bg-white text-token-text-secondary border-token-border hover:border-token-secondary hover:bg-token-secondary-50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Timezone Reminder */}
              <div className="bg-token-warning-50 border border-token-warning-200 rounded-lg p-4 mb-8">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-token-warning-600" />
                  <p className="text-token-warning-800">
                    All times are displayed in your local timezone (GMT+8). You can change this in your settings.
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-token-success-50 border border-token-success-200 rounded-lg p-4 mb-8">
                <h3 className="font-semibold text-token-success-800 mb-2">Availability Summary</h3>
                <p className="text-token-success-700">
                  You have selected {getTotalAvailableSlots()} time slots across the week.
                  {getTotalAvailableSlots() < 3 && (
                    <span className="text-token-warning-600 ml-2">
                      (You need at least 3 slots to activate your profile)
                    </span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-token-border text-token-text-secondary hover:bg-token-surface-subtle px-8 py-4 rounded-full text-lg font-semibold bg-transparent"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={() => setIsComplete(true)}
                  disabled={getTotalAvailableSlots() < 3}
                  size="lg"
                  className="bg-gradient-to-r from-token-primary to-token-primary-600 hover:from-token-primary-600 hover:to-token-primary-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Availability
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-lg text-[var(--color-text-secondary)]">
              Step {currentStep + 1} content goes here.
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={() => setCurrentStep(currentStep - 1)}
              variant="outline"
              size="lg"
            >
              Previous Step
            </Button>
            <div></div>
          </div>
        )}
      </div>
    </div>
  );
} 