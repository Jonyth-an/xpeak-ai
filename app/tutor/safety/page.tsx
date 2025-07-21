'use client';

import React, { useState } from 'react';
import TutorLayout from '../TutorLayout';
import { Card, Button } from '@/app/components/ui';
import Text from '@/app/components/ui/Text';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Users,
  Lock,
  Eye,
  Heart,
  Scale,
  Clock,
  HelpCircle,
  Flag,
  UserCheck,
  Headphones,
  Video,
  Camera,
  Mic,
  Globe,
  BookOpen,
  Star,
  Award,
  ExternalLink,
  ChevronRight,
  Info,
  AlertCircle
} from 'lucide-react';

const safetyGuidelines = [
  {
    title: 'Maintain Professional Boundaries',
    description: 'Keep all interactions professional and focused on language learning',
    icon: UserCheck,
    color: 'bg-token-primary'
  },
  {
    title: 'Protect Personal Information',
    description: 'Never share personal contact details or social media accounts',
    icon: Lock,
    color: 'bg-token-warning'
  },
  {
    title: 'Report Inappropriate Behavior',
    description: 'Report any concerning behavior immediately through our platform',
    icon: Flag,
    color: 'bg-token-error'
  },
  {
    title: 'Follow Platform Guidelines',
    description: 'Adhere to all Xpeak community standards and teaching policies',
    icon: BookOpen,
    color: 'bg-token-success'
  }
];

const supportResources = [
  {
    title: 'Tutor Support Team',
    description: 'General questions and guidance for tutors',
    icon: Headphones,
    contact: 'tutors@xpeak.ai',
    available: 'Mon-Fri 9AM-6PM PST',
    color: 'bg-token-info'
  },
  {
    title: 'Community Guidelines',
    description: 'Comprehensive guide to platform expectations',
    icon: FileText,
    contact: 'View Guidelines',
    available: 'Always available',
    color: 'bg-token-secondary'
  },
  {
    title: 'Live Chat Support',
    description: 'Real-time assistance during business hours',
    icon: MessageSquare,
    contact: 'Start Chat',
    available: 'Mon-Fri 9AM-6PM PST',
    color: 'bg-token-accent'
  }
];

const trustFeatures = [
  {
    title: 'Verified Identity',
    description: 'All tutors go through identity verification',
    icon: UserCheck,
    status: 'verified'
  },
  {
    title: 'Background Checks',
    description: 'Comprehensive background screening process',
    icon: Shield,
    status: 'verified'
  },
  {
    title: 'Continuous Monitoring',
    description: 'AI-powered monitoring of lesson quality and safety',
    icon: Eye,
    status: 'active'
  },
  {
    title: 'Student Feedback',
    description: 'Regular feedback collection from students',
    icon: Star,
    status: 'active'
  },
  {
    title: 'Secure Platform',
    description: 'End-to-end encrypted video calls and messaging',
    icon: Lock,
    status: 'verified'
  },
  {
    title: 'Payment Protection',
    description: 'Secure payment processing and dispute resolution',
    icon: Award,
    status: 'verified'
  }
];

const reportingCategories = [
  {
    title: 'Inappropriate Behavior',
    description: 'Harassment, discrimination, or unprofessional conduct',
    severity: 'high',
    icon: AlertTriangle
  },
  {
    title: 'Safety Concerns',
    description: 'Threats, stalking, or dangerous behavior',
    severity: 'critical',
    icon: Shield
  },
  {
    title: 'Platform Violations',
    description: 'Misuse of platform features or circumventing policies',
    severity: 'medium',
    icon: Flag
  },
  {
    title: 'Technical Issues',
    description: 'Security vulnerabilities or technical problems',
    severity: 'medium',
    icon: AlertCircle
  }
];

const bestPractices = [
  {
    category: 'Lesson Conduct',
    practices: [
      'Start and end lessons on time',
      'Maintain a professional demeanor throughout',
      'Focus on educational content only',
      'Respect cultural differences and backgrounds',
      'Provide constructive feedback'
    ]
  },
  {
    category: 'Communication',
    practices: [
      'Use clear, appropriate language',
      'Avoid personal topics unrelated to learning',
      'Respond to messages professionally',
      'Set clear expectations about availability',
      'Document any concerns immediately'
    ]
  },
  {
    category: 'Privacy & Security',
    practices: [
      'Never share personal contact information',
      'Keep student information confidential',
      'Use only platform-approved communication channels',
      'Report suspicious activity immediately',
      'Regularly update your security settings'
    ]
  },
  {
    category: 'Professional Development',
    practices: [
      'Stay updated on platform policies',
      'Participate in training sessions',
      'Seek feedback and improve continuously',
      'Maintain teaching certifications',
      'Connect with the tutor community'
    ]
  }
];

export default function TutorSafety() {
  const [selectedReportType, setSelectedReportType] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportDescription, setReportDescription] = useState('');

  const getSeverityColor = (severity: string) => {
    const severityMap = {
      critical: 'bg-token-error text-token-error',
      high: 'bg-token-warning text-token-warning',
      medium: 'bg-token-info text-token-info',
      low: 'bg-token-success text-token-success'
    };
    return severityMap[severity as keyof typeof severityMap] || 'bg-token-info text-token-info';
  };

  const handleReportSubmit = () => {
    // Handle report submission
    console.log('Report submitted:', { type: selectedReportType, description: reportDescription });
    setShowReportForm(false);
    setSelectedReportType('');
    setReportDescription('');
  };

  const reportTypes = [
    { id: 'inappropriate_behavior', title: 'Inappropriate Behavior', description: 'Harassment, discrimination, or unprofessional conduct', severity: 'high', icon: AlertTriangle },
    { id: 'safety_concerns', title: 'Safety Concerns', description: 'Threats, stalking, or dangerous behavior', severity: 'critical', icon: Shield },
    { id: 'platform_violations', title: 'Platform Violations', description: 'Misuse of platform features or circumventing policies', severity: 'medium', icon: Flag },
    { id: 'technical_issues', title: 'Technical Issues', description: 'Security vulnerabilities or technical problems', severity: 'medium', icon: AlertCircle }
  ];

  return (
    <TutorLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-token-error/20 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-token-error" />
              </div>
              <Text variant="h1" className="text-token-text font-bold">
                Safety & Trust Center
              </Text>
            </div>
            <Text variant="body" className="text-token-text-secondary">
              Your safety and the safety of our learning community is our top priority
            </Text>
          </div>

          {/* Safety Guidelines */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <Text variant="h2" className="text-token-text font-bold">
                Safety Guidelines
              </Text>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safetyGuidelines.map((guideline, index) => {
                const Icon = guideline.icon;
                return (
                  <Card key={index} className="p-6 bg-surface border border-border text-center rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 ${guideline.color}/20 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                      <Icon className="w-6 h-6 text-token-text" />
                    </div>
                    <Text variant="h4" className="text-token-text font-semibold mb-2">
                      {guideline.title}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary leading-relaxed">
                      {guideline.description}
                    </Text>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Trust & Safety Features */}
          <div className="mb-8">
            <Text variant="h2" className="text-token-text-primary mb-6">
              Trust & Safety Features
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trustFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-token-surface-subtle rounded-lg flex items-center justify-center mr-3">
                          <Icon className="w-5 h-5 text-token-text-muted" />
                        </div>
                        <div>
                          <Text variant="h4" className="text-token-text-primary">
                            {feature.title}
                          </Text>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-token-success mr-1" />
                        <span className="text-xs text-token-success font-medium">
                          {feature.status}
                        </span>
                      </div>
                    </div>
                    <Text variant="small" className="text-token-text-secondary">
                      {feature.description}
                    </Text>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Reporting */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Report an Issue */}
            <Card className="p-6 bg-surface border border-border rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-token-warning/20 rounded-full flex items-center justify-center">
                  <Flag className="w-4 h-4 text-token-warning" />
                </div>
                <Text variant="h3" className="text-token-text font-semibold">
                  Report an Issue
                </Text>
              </div>
              
              <Text variant="body" className="text-token-text-secondary mb-6 leading-relaxed">
                Help us maintain a safe learning environment by reporting any concerns or inappropriate behavior.
              </Text>

              {!showReportForm ? (
                <div className="space-y-3">
                  {reportTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedReportType(type.id);
                        setShowReportForm(true);
                      }}
                      className="w-full p-4 text-left bg-token-surface-accent hover:bg-token-surface-accent/80 border border-border rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 ${getSeverityColor(type.severity)}/20 rounded-lg flex items-center justify-center mr-3`}>
                            <AlertTriangle className="w-4 h-4 text-token-text" />
                          </div>
                          <div>
                            <Text variant="body" className="text-token-text font-medium">
                              {type.title}
                            </Text>
                            <Text variant="small" className="text-token-text-secondary">
                              {type.description}
                            </Text>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-token-text-muted" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-token-warning/5 border border-token-warning/30 rounded-lg">
                    <Text variant="body" className="text-token-warning font-medium mb-2">
                      Report Type: {reportTypes.find(t => t.id === selectedReportType)?.title}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary">
                      {reportTypes.find(t => t.id === selectedReportType)?.description}
                    </Text>
                  </div>
                  
                  <div>
                    <Text variant="body" className="text-token-text font-medium mb-2">
                      Please describe the issue:
                    </Text>
                    <textarea
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Provide as much detail as possible to help us investigate..."
                      rows={4}
                      className="w-full p-3 border border-border rounded-lg bg-surface text-token-text placeholder:text-token-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="primary" onClick={handleReportSubmit} className="flex-1">
                      Submit Report
                    </Button>
                    <Button variant="outline" onClick={() => setShowReportForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Support Resources */}
            <Card className="p-6 bg-surface border border-border rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-accent" />
                </div>
                <Text variant="h3" className="text-token-text font-semibold">
                  Support Resources
                </Text>
              </div>
              
              <div className="space-y-4">
                {supportResources.map((resource, index) => {
                  const Icon = resource.icon;
                  return (
                    <div key={index} className="p-4 bg-token-surface-accent rounded-lg border border-border hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center mr-3">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <Text variant="body" className="text-token-text font-medium">
                              {resource.title}
                            </Text>
                            <Text variant="small" className="text-token-text-secondary">
                              {resource.description}
                            </Text>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-token-text-muted" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Best Practices */}
          <div className="mb-8">
            <Text variant="h2" className="text-token-text-primary mb-6">
              Best Practices
            </Text>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bestPractices.map((section, index) => (
                <Card key={index} className="p-6 rounded-xl">
                  <Text variant="h3" className="text-token-text-primary mb-4">
                    {section.category}
                  </Text>
                  <ul className="space-y-2">
                    {section.practices.map((practice, practiceIndex) => (
                      <li key={practiceIndex} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-token-success mr-2 mt-0.5 flex-shrink-0" />
                        <Text variant="small" className="text-token-text-secondary">
                          {practice}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Resources */}
          <Card className="p-6 rounded-xl">
            <Text variant="h3" className="text-token-text-primary mb-4">
              Additional Resources
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-between">
                <span>Community Guidelines</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                <span>Privacy Policy</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                <span>Terms of Service</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                <span>Tutor Code of Conduct</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                <span>Safety Training Videos</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="justify-between">
                <span>FAQ & Help Center</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
} 