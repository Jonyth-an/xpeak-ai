'use client';

import React, { useState } from 'react';
import TutorLayout from '../TutorLayout';
import { Card, Button } from '@/app/components/ui';
import Text from '@/app/components/ui/Text';
import { 
  BookOpen,
  Video,
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  Globe,
  Headphones,
  Mic,
  Settings,
  Lightbulb,
  Target,
  MessageSquare,
  Presentation,
  CheckCircle,
  PlayCircle,
  FileImage,
  Bookmark,
  Share2
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'template' | 'guide' | 'video' | 'audio' | 'interactive' | 'worksheet';
  category: 'conversation' | 'grammar' | 'vocabulary' | 'pronunciation' | 'business' | 'exam-prep' | 'culture';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration?: string;
  rating: number;
  downloads: number;
  thumbnail?: string;
  url?: string;
  isBookmarked?: boolean;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Conversation Starter Templates',
    description: 'Ready-to-use conversation prompts for different proficiency levels',
    type: 'template',
    category: 'conversation',
    level: 'all',
    rating: 4.8,
    downloads: 1245,
    isBookmarked: true
  },
  {
    id: '2',
    title: 'Grammar Explanation Framework',
    description: 'Step-by-step guide to explaining complex grammar concepts',
    type: 'guide',
    category: 'grammar',
    level: 'intermediate',
    rating: 4.7,
    downloads: 892
  },
  {
    id: '3',
    title: 'Pronunciation Practice Exercises',
    description: 'Interactive exercises for common pronunciation challenges',
    type: 'interactive',
    category: 'pronunciation',
    level: 'all',
    duration: '15 min',
    rating: 4.9,
    downloads: 1567
  },
  {
    id: '4',
    title: 'Business English Scenarios',
    description: 'Role-play scenarios for professional communication',
    type: 'worksheet',
    category: 'business',
    level: 'intermediate',
    rating: 4.6,
    downloads: 743
  },
  {
    id: '5',
    title: 'Cultural Context Videos',
    description: 'Short videos explaining cultural nuances in language',
    type: 'video',
    category: 'culture',
    level: 'all',
    duration: '5-10 min',
    rating: 4.8,
    downloads: 2134,
    isBookmarked: true
  },
  {
    id: '6',
    title: 'IELTS Speaking Preparation',
    description: 'Comprehensive guide for IELTS speaking test preparation',
    type: 'guide',
    category: 'exam-prep',
    level: 'advanced',
    rating: 4.9,
    downloads: 1876
  }
];

const categories = [
  { id: 'all', label: 'All Categories', icon: Globe },
  { id: 'conversation', label: 'Conversation', icon: MessageSquare },
  { id: 'grammar', label: 'Grammar', icon: BookOpen },
  { id: 'vocabulary', label: 'Vocabulary', icon: Target },
  { id: 'pronunciation', label: 'Pronunciation', icon: Mic },
  { id: 'business', label: 'Business English', icon: Users },
  { id: 'exam-prep', label: 'Exam Prep', icon: CheckCircle },
  { id: 'culture', label: 'Culture', icon: Globe }
];

const resourceTypes = [
  { id: 'all', label: 'All Types', icon: FileText },
  { id: 'template', label: 'Templates', icon: FileText },
  { id: 'guide', label: 'Guides', icon: BookOpen },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Audio', icon: Headphones },
  { id: 'interactive', label: 'Interactive', icon: PlayCircle },
  { id: 'worksheet', label: 'Worksheets', icon: FileImage }
];

const quickTools = [
  {
    title: 'Lesson Plan Generator',
    description: 'Create structured lesson plans in minutes',
    icon: Presentation,
    color: 'bg-token-primary',
    action: 'Generate Plan'
  },
  {
    title: 'Progress Tracker',
    description: 'Track student progress and set goals',
    icon: Target,
    color: 'bg-token-accent',
    action: 'Track Progress'
  },
  {
    title: 'Feedback Templates',
    description: 'Pre-written feedback for common scenarios',
    icon: MessageSquare,
    color: 'bg-token-secondary',
    action: 'View Templates'
  },
  {
    title: 'Technical Setup Guide',
    description: 'Ensure your tech setup is perfect',
    icon: Settings,
    color: 'bg-token-warning',
    action: 'Check Setup'
  }
];

export default function TutorTools() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBookmark = !bookmarkedOnly || resource.isBookmarked;
    
    return matchesCategory && matchesType && matchesSearch && matchesBookmark;
  });

  const getTypeIcon = (type: string) => {
    const typeMap = {
      template: FileText,
      guide: BookOpen,
      video: Video,
      audio: Headphones,
      interactive: PlayCircle,
      worksheet: FileImage
    };
    return typeMap[type as keyof typeof typeMap] || FileText;
  };

  const getLevelColor = (level: string) => {
    const levelMap = {
      beginner: 'bg-token-success text-token-success',
      intermediate: 'bg-token-warning text-token-warning',
      advanced: 'bg-token-error text-token-error',
      all: 'bg-token-info text-token-info'
    };
    return levelMap[level as keyof typeof levelMap] || 'bg-token-info text-token-info';
  };

  return (
    <TutorLayout>
      <div className="min-h-screen bg-token-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <Text variant="h1" className="text-token-text font-bold">
                Teaching Tools & Materials
              </Text>
            </div>
            <Text variant="body" className="text-token-text-secondary">
              Everything you need to deliver engaging and effective lessons
            </Text>
          </div>

          {/* Quick Tools */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-accent" />
              </div>
              <Text variant="h3" className="text-token-text font-semibold">Quick Tools</Text>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <Card key={index} className="p-6 bg-surface border border-border hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer rounded-xl">
                    <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4 shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Text variant="h3" className="text-token-text font-semibold mb-2">
                      {tool.title}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary mb-4 leading-relaxed">
                      {tool.description}
                    </Text>
                    <Button variant="outline" size="sm" className="w-full">
                      {tool.action}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-8 bg-surface border border-border rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-token-info/20 rounded-full flex items-center justify-center">
                <Filter className="w-4 h-4 text-token-info" />
              </div>
              <Text variant="h3" className="text-token-text font-semibold">Find Resources</Text>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-token-text-muted w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-surface text-token-text placeholder:text-token-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-token-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex-1">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-token-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  {resourceTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bookmarked Toggle */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookmarkedOnly}
                    onChange={(e) => setBookmarkedOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded mr-2 flex items-center justify-center transition-colors ${
                    bookmarkedOnly ? 'bg-primary border-primary' : 'border-border'
                  }`}>
                    {bookmarkedOnly && <CheckCircle className="w-3 h-3 text-text-inverse" />}
                  </div>
                  <Text variant="small" className="text-token-text-secondary font-medium">
                    Bookmarked only
                  </Text>
                </label>
              </div>
            </div>
          </Card>

          {/* Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-token-success/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-token-success" />
                </div>
                <Text variant="h3" className="text-token-text font-semibold">
                  Resources ({filteredResources.length})
                </Text>
              </div>
              <Text variant="body" className="text-token-text-secondary">
                {filteredResources.length} resources found
              </Text>
            </div>
          </div>

          {/* Resource Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <Card key={resource.id} className="p-6 bg-surface border border-border hover:shadow-lg hover:scale-105 transition-all duration-200 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-token-surface-accent rounded-lg flex items-center justify-center mr-3 shadow-sm">
                        <TypeIcon className="w-5 h-5 text-token-text" />
                      </div>
                      <div>
                        <Text variant="h4" className="text-token-text font-semibold">
                          {resource.title}
                        </Text>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(resource.level)}`}>
                            {resource.level}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-token-text-muted hover:text-primary transition-colors">
                      <Bookmark className={`w-5 h-5 ${resource.isBookmarked ? 'fill-current text-primary' : ''}`} />
                    </button>
                  </div>

                  <Text variant="small" className="text-token-text-secondary mb-4 leading-relaxed">
                    {resource.description}
                  </Text>

                  <div className="flex items-center justify-between mb-4 p-3 bg-token-surface-accent rounded-lg">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-token-warning mr-1" />
                      <Text variant="small" className="text-token-text-secondary font-medium">
                        {resource.rating} ({resource.downloads} downloads)
                      </Text>
                    </div>
                    {resource.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-token-text-muted mr-1" />
                        <Text variant="small" className="text-token-text-secondary font-medium">
                          {resource.duration}
                        </Text>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredResources.length === 0 && (
            <Card className="p-12 text-center bg-surface border border-border rounded-xl shadow-sm">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-token-text-muted/10 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="w-8 h-8 text-token-text-muted" />
                </div>
                <Text variant="h3" className="text-token-text font-semibold mb-2">
                  No resources found
                </Text>
                <Text variant="body" className="text-token-text-secondary mb-6 max-w-md">
                  Try adjusting your filters or search terms to find the perfect teaching materials.
                </Text>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setBookmarkedOnly(false);
                }}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </TutorLayout>
  );
} 