'use client';

import React, { useState } from 'react';
import TutorLayout from '../TutorLayout';
import { Card, Text, Button } from '@/app/components/ui';
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
    title: '24/7 Safety Hotline',
    description: 'Immediate support for urgent safety concerns',
    icon: Phone,
    contact: '+1-800-XPEAK-HELP',
    available: '24/7',
    color: 'bg-token-error'
  },
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

  return (
    <TutorLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Text variant="h1" className="text-token-text-primary mb-2">
              Safety & Trust Center
            </Text>
            <Text variant="body" className="text-token-text-secondary">
              Your safety and the safety of our learning community is our top priority
            </Text>
          </div>

          {/* Emergency Contact */}
          <Card className="p-6 mb-8 border-l-4 border-token-error">
            <div className="flex items-center mb-4">
              <Phone className="w-6 h-6 text-token-error mr-3" />
              <Text variant="h3" className="text-token-text-primary">
                Emergency Support
              </Text>
            </div>
            <Text variant="body" className="text-token-text-secondary mb-4">
              For immediate safety concerns or urgent issues, contact our 24/7 safety hotline:
            </Text>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" className="bg-token-error hover:bg-token-error-dark">
                <Phone className="w-4 h-4 mr-2" />
                Call +1-800-XPEAK-HELP
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Start Emergency Chat
              </Button>
            </div>
          </Card>

          {/* Safety Guidelines */}
          <div className="mb-8">
            <Text variant="h2" className="text-token-text-primary mb-6">
              Safety Guidelines
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safetyGuidelines.map((guideline, index) => {
                const Icon = guideline.icon;
                return (
                  <Card key={index} className="p-6 text-center">
                    <div className={`w-12 h-12 ${guideline.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Text variant="h4" className="text-token-text-primary mb-2">
                      {guideline.title}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary">
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
                  <Card key={index} className="p-6">
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

          {/* Report an Issue */}
          <div className="mb-8">
            <Text variant="h2" className="text-token-text-primary mb-6">
              Report an Issue
            </Text>
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {reportingCategories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={index}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedReportType === category.title
                          ? 'border-token-primary bg-token-primary-light'
                          : 'border-token hover:border-token-primary'
                      }`}
                      onClick={() => setSelectedReportType(category.title)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 text-token-text-muted mr-2" />
                          <Text variant="h4" className="text-token-text-primary">
                            {category.title}
                          </Text>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(category.severity)}`}>
                          {category.severity}
                        </span>
                      </div>
                      <Text variant="small" className="text-token-text-secondary">
                        {category.description}
                      </Text>
                    </div>
                  );
                })}
              </div>

              {selectedReportType && (
                <div className="border-t border-token pt-6">
                  <Text variant="h4" className="text-token-text-primary mb-4">
                    Report Details
                  </Text>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please provide detailed information about the issue..."
                    className="w-full p-4 border border-token rounded-lg focus:outline-none focus:ring-2 focus:ring-token-primary min-h-[120px]"
                  />
                  <div className="flex justify-end gap-4 mt-4">
                    <Button variant="outline" onClick={() => setSelectedReportType('')}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleReportSubmit}>
                      Submit Report
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Support Resources */}
          <div className="mb-8">
            <Text variant="h2" className="text-token-text-primary mb-6">
              Support Resources
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportResources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-start mb-4">
                      <div className={`w-12 h-12 ${resource.color} rounded-lg flex items-center justify-center mr-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <Text variant="h4" className="text-token-text-primary mb-2">
                          {resource.title}
                        </Text>
                        <Text variant="small" className="text-token-text-secondary mb-3">
                          {resource.description}
                        </Text>
                        <div className="flex items-center justify-between">
                          <Text variant="small" className="text-token-text-muted">
                            Available: {resource.available}
                          </Text>
                          <Button variant="outline" size="sm">
                            {resource.contact}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Best Practices */}
          <div className="mb-8">
            <Text variant="h2" className="text-token-text-primary mb-6">
              Best Practices
            </Text>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bestPractices.map((section, index) => (
                <Card key={index} className="p-6">
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
          <Card className="p-6">
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