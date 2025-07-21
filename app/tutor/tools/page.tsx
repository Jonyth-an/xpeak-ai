'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import TutorLayout from '../TutorLayout';
import { Card, Button } from '@/app/components/ui';
import Text from '@/app/components/ui/Text';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Textarea from '@/app/components/ui/Textarea';
import CustomSelect from '@/app/components/ui/CustomSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { materialsService, Material as MaterialType } from '@/lib/services/materialsService';
import {
  Plus,
  Search as SearchIcon,
  Filter as FilterIcon,
  SortAsc,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  FileText,
  Upload,
  Link,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  Settings,
  Lightbulb,
  BookOpen,
  Video,
  FileText as FileTextIcon,
  Download,
  ExternalLink as ExternalLinkIcon,
} from 'lucide-react';

interface Material {
  id: string;
  title: string;
  description: string;
  url: string;
  tags: string[];
  uploadedAt: Date;
  fileType?: string;
  fileSize?: number;
}

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

const quickTools = [
  {
    title: 'Technical Setup Guide',
    description: 'Ensure your equipment is ready for smooth online lessons',
    icon: Settings,
    color: 'bg-blue-500',
    action: 'Check Setup'
  },
  {
    title: 'Lesson Planning Templates',
    description: 'Structured templates for different lesson types and levels',
    icon: BookOpen,
    color: 'bg-green-500',
    action: 'Coming Soon'
  },
  {
    title: 'Interactive Activities',
    description: 'Engaging exercises and games for student participation',
    icon: Lightbulb,
    color: 'bg-purple-500',
    action: 'Coming Soon'
  },
  {
    title: 'Assessment Tools',
    description: 'Track progress and evaluate student performance',
    icon: FileTextIcon,
    color: 'bg-orange-500',
    action: 'Coming Soon'
  }
];

export default function TutorTools() {
  const { session } = useAuth();
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materialsSearchQuery, setMaterialsSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [linkPreview, setLinkPreview] = useState<{ title: string; domain: string; url: string } | null>(null);
  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    url: '',
    tags: ''
  });

  // File type validation
  const supportedFormats = ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'JPEG', 'PNG', 'GIF', 'MP4', 'MP3', 'TXT'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Fetch materials on component mount
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        if (!session) {
          throw new Error('No active session');
        }
        const fetchedMaterials = await materialsService.getMaterials(session);
        setMaterials(fetchedMaterials);
      } catch (error) {
        console.error('Error fetching materials:', error);
        // You might want to show a toast notification here
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchMaterials();
    }
  }, [session]);

  // Auto-populate title from filename or URL
  const autoPopulateTitle = useCallback((input: string) => {
    if (!input) return;
    
    // Check if it's a URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
      try {
        const url = new URL(input);
        const domain = url.hostname.replace('www.', '');
        setNewMaterial(prev => ({ ...prev, title: domain }));
      } catch (e) {
        // Invalid URL, keep current title
      }
    } else {
      // Check if it's a file path
      const fileName = input.split('/').pop() || input.split('\\').pop() || input;
      if (fileName && fileName.includes('.')) {
        const nameWithoutExt = fileName.split('.')[0];
        setNewMaterial(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  }, []);

  // Smart tag suggestions
  const getSmartTags = useCallback((input: string) => {
    const tags = [];
    
    if (!input) return tags;
    
    // File type tags
    const fileExtension = input.split('.').pop()?.toLowerCase();
    if (fileExtension) {
      switch (fileExtension) {
        case 'pdf':
          tags.push('document');
          break;
        case 'doc':
        case 'docx':
          tags.push('document', 'word');
          break;
        case 'ppt':
        case 'pptx':
          tags.push('presentation', 'powerpoint');
          break;
        case 'mp4':
        case 'avi':
          tags.push('video');
          break;
        case 'mp3':
        case 'wav':
          tags.push('audio');
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
          tags.push('image');
          break;
      }
    }
    
    // Content-based tags from filename
    const fileName = input.toLowerCase();
    if (fileName.includes('grammar')) tags.push('grammar');
    if (fileName.includes('vocabulary') || fileName.includes('vocab')) tags.push('vocabulary');
    if (fileName.includes('pronunciation')) tags.push('pronunciation');
    if (fileName.includes('listening')) tags.push('listening');
    if (fileName.includes('speaking')) tags.push('speaking');
    if (fileName.includes('reading')) tags.push('reading');
    if (fileName.includes('writing')) tags.push('writing');
    if (fileName.includes('ielts')) tags.push('ielts');
    if (fileName.includes('toefl')) tags.push('toefl');
    if (fileName.includes('business')) tags.push('business');
    if (fileName.includes('conversation')) tags.push('conversation');
    
    return [...new Set(tags)]; // Remove duplicates
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (file.size > maxFileSize) {
      alert(`File size exceeds ${maxFileSize / (1024 * 1024)}MB limit`);
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (!supportedFormats.includes(fileExtension || '')) {
      alert(`File type not supported. Supported formats: ${supportedFormats.join(', ')}`);
      return;
    }

    if (!session?.access_token) {
      alert('No active session found. Please log in again.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('materialId', 'new-material'); // We'll generate a proper ID later

      const uploadResponse = await fetch('/api/chat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();
      
      // Complete the progress
      setUploadProgress(100);
      
      // Auto-populate fields
      autoPopulateTitle(file.name);
      const suggestedTags = getSmartTags(file.name);
      setNewMaterial(prev => ({
        ...prev,
        url: result.file.url,
        tags: suggestedTags.join(', ')
      }));

      // Automatically save the material to database
      try {
        if (!session) {
          throw new Error('No active session');
        }

        const materialData = {
          title: file.name.replace(`.${fileExtension}`, ''),
          description: '',
          url: result.file.url,
          tags: suggestedTags,
          fileType: fileExtension,
          fileSize: file.size
        };

        const newMaterialObj = await materialsService.createMaterial(materialData, session);
        setMaterials(prev => [newMaterialObj, ...prev]);
        
        // Show success message
        alert('Material uploaded and saved successfully!');
      } catch (error) {
        console.error('Error saving uploaded material:', error);
        alert('File uploaded but failed to save material. You can manually save it from the form.');
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle URL input and preview
  const handleUrlInput = useCallback(async (url: string) => {
    setNewMaterial(prev => ({ ...prev, url }));
    
    if (!url || !url.startsWith('http')) {
      setLinkPreview(null);
      return;
    }

    setIsLinkLoading(true);
    try {
      // Simple preview - extract domain
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      setLinkPreview({
        title: domain,
        domain: domain,
        url: url
      });
      
      // Auto-populate title and tags
      autoPopulateTitle(url);
      const suggestedTags = getSmartTags(url);
      setNewMaterial(prev => ({ ...prev, tags: suggestedTags.join(', ') }));
    } catch (error) {
      setLinkPreview(null);
    } finally {
      setIsLinkLoading(false);
    }
  }, [autoPopulateTitle, getSmartTags]);

  // Handle edit button click
  const handleEdit = (material: MaterialType) => {
    setEditingMaterial(material);
    setNewMaterial({
      title: material.title,
      description: material.description || '',
      url: material.url,
      tags: material.tags.join(', ')
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle open button click
  const handleOpen = (material: MaterialType) => {
    if (!material.url) {
      alert('No URL available for this material');
      return;
    }
    
    // Open in new tab
    window.open(material.url, '_blank');
  };

  // Reset modal state
  const handleModalClose = () => {
    setIsEditMode(false);
    setEditingMaterial(null);
    setNewMaterial({ title: '', description: '', url: '', tags: '' });
    setLinkPreview(null);
    setIsModalOpen(false);
  };

  // Handle form submission (create or update)
  const handleSubmit = async () => {
    if (!newMaterial.title.trim()) {
      alert('Please enter a title for the material');
      return;
    }

    if (!newMaterial.url.trim()) {
      alert('Please provide a file or link URL');
      return;
    }

    if (!session) {
      alert('No active session. Please log in again.');
      return;
    }

    try {
      const materialData = {
        title: newMaterial.title,
        description: newMaterial.description,
        url: newMaterial.url,
        tags: newMaterial.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        fileType: newMaterial.url.split('.').pop()?.toUpperCase(),
        fileSize: 0 // We don't have file size for links
      };

      if (isEditMode && editingMaterial) {
        // Update existing material
        const updatedMaterial = await materialsService.updateMaterial({
          ...materialData,
          id: editingMaterial.id
        }, session);
        
        setMaterials(prev => 
          prev.map(m => m.id === editingMaterial.id ? updatedMaterial : m)
        );
      } else {
        // Create new material
        const newMaterialObj = await materialsService.createMaterial(materialData, session);
        setMaterials(prev => [newMaterialObj, ...prev]);
      }
      
      handleModalClose();
    } catch (error) {
      console.error('Error saving material:', error);
      alert(`Failed to save material: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle opening the modal for new material
  const handleAddNewMaterial = () => {
    setIsEditMode(false);
    setEditingMaterial(null);
    setNewMaterial({ title: '', description: '', url: '', tags: '' });
    setLinkPreview(null);
    setIsModalOpen(true);
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'PDF':
        return FileTextIcon;
      case 'Word Doc':
        return FileTextIcon;
      case 'PowerPoint':
        return FileTextIcon;
      case 'Website Link':
        return ExternalLinkIcon;
      case 'YouTube Video':
        return Video;
      default:
        return FileTextIcon;
    }
  };

  const getLevelColor = (level: string) => {
    const levelMap: { [key: string]: string } = {
      'beginner': 'bg-token-success text-token-success',
      'intermediate': 'bg-token-warning text-token-warning',
      'advanced': 'bg-token-error text-token-error',
      'all': 'bg-token-info text-token-info'
    };
    return levelMap[level] || 'bg-token-info text-token-info';
  };

  const getMaterialTypeIcon = (type: string) => {
    switch(type) {
      case 'PDF':
        return FileTextIcon;
      case 'Word Doc':
        return FileTextIcon;
      case 'PowerPoint':
        return FileTextIcon;
      case 'Website Link':
        return ExternalLinkIcon;
      case 'YouTube Video':
        return Video;
      default:
        return FileTextIcon;
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material?')) {
      return;
    }

    if (!session) {
      alert('No active session. Please log in again.');
      return;
    }

    try {
      await materialsService.deleteMaterial(id, session);
      setMaterials(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting material:', error);
      alert(`Failed to delete material: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  // Filter and sort materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(materialsSearchQuery.toLowerCase()) ||
                         material.description?.toLowerCase().includes(materialsSearchQuery.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(materialsSearchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || material.file_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'az':
        return a.title.localeCompare(b.title);
      case 'type':
        return (a.file_type || '').localeCompare(b.file_type || '');
      default:
        return 0;
    }
  });

  return (
    <TutorLayout>
      <div className="min-h-screen bg-token-surface-alt">
        <div className="max-w-7xl mx-auto px-4 py-8">
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
                const isSystemCheck = tool.title === 'Technical Setup Guide';
                return (
                  <Card key={index} className="p-6 bg-surface border border-border hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer rounded-xl relative">
                    <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4 shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Text variant="h3" className="text-token-text font-semibold mb-2">
                      {tool.title}
                    </Text>
                    <Text variant="small" className="text-token-text-secondary mb-4 leading-relaxed">
                      {tool.description}
                    </Text>
                    {/* Coming Soon badge for all except System Check */}
                    {!isSystemCheck && (
                      <span className="absolute top-4 right-4 bg-token-warning text-white text-xs font-semibold px-2 py-1 rounded">Coming Soon</span>
                    )}
                    {/* Button: link for System Check, outline for others */}
                    {isSystemCheck ? (
                      <a href="/tutor/tools/system-check" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full">
                          {tool.action}
                        </Button>
                      </a>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" disabled>
                        {tool.action}
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Teaching Materials Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-2 text-token-text">Teaching Materials</h2>
            <p className="text-base mb-6 text-token-text-secondary">
              Organize the content you like to use when teaching. Add links, documents, or videos — and access them anytime.
            </p>
            <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
              <Button 
                onClick={handleAddNewMaterial}
                className="rounded-full px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-text-inverse"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-token-text">
                    {isEditMode ? 'Edit Teaching Material' : 'Add New Teaching Material'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Upload or Link Field */}
                  <div>
                    <Label htmlFor="upload" className="text-sm font-medium text-token-text">
                      Upload or Link
                    </Label>
                    <div 
                      className="mt-1 border-2 border-dashed border-token-border rounded-lg p-4 hover:border-token-primary transition-colors"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                    >
                      <div className="flex items-center gap-3">
                        <Input
                          id="upload"
                          placeholder="Paste a link or drag & drop a file here"
                          value={newMaterial.url}
                          onChange={(e) => handleUrlInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleFileInputChange}
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.txt"
                        />
                      </div>
                      
                      {/* Upload Progress */}
                      {isUploading && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 text-sm text-token-text-secondary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading... {uploadProgress}%
                          </div>
                          <div className="mt-1 w-full bg-token-surface rounded-full h-2">
                            <div 
                              className="bg-token-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Link Preview */}
                      {linkPreview && (
                        <div className="mt-3 p-3 bg-token-surface rounded-lg border border-token-border">
                          <div className="flex items-center gap-2">
                            <Link className="h-4 w-4 text-token-primary" />
                            <span className="text-sm font-medium text-token-text">{linkPreview.title}</span>
                            <span className="text-xs text-token-text-secondary">({linkPreview.domain})</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Helper Text */}
                      <p className="mt-2 text-xs text-token-text-secondary">
                        Supports: {supportedFormats.join(', ')} • Max size: 10MB
                      </p>
                    </div>
                  </div>

                  {/* Title Field */}
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-token-text">
                      Material Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., IELTS Speaking Framework"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Description Field */}
                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-token-text">
                      Description (optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Personal notes or when to use this"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Tags Field */}
                  <div>
                    <Label htmlFor="tags" className="text-sm font-medium text-token-text">
                      Tags (optional)
                    </Label>
                    <Input
                      id="tags"
                      placeholder="e.g., grammar, advanced, ielts (comma separated)"
                      value={newMaterial.tags}
                      onChange={(e) => setNewMaterial({ ...newMaterial, tags: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSubmit} className="flex-1 rounded-full font-medium bg-primary text-text-inverse">
                    {isEditMode ? 'Update Material' : 'Save Material'}
                  </Button>
                  <Button variant="outline" onClick={handleModalClose} className="flex-1 rounded-full font-medium border-token-border text-token-text-secondary">
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Search & Filter */}
            {materials.length > 0 && (
              <Card className="mb-6 border-0 shadow-sm bg-surface">
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-token-text-muted" />
                      <Input
                        placeholder="Search my materials..."
                        value={materialsSearchQuery}
                        onChange={(e) => setMaterialsSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <CustomSelect 
                        value={filterType} 
                        onValueChange={setFilterType}
                        options={[
                          { value: 'all', label: 'All Types' },
                          { value: 'PDF', label: 'PDF' },
                          { value: 'Word Doc', label: 'Word Doc' },
                          { value: 'PowerPoint', label: 'PowerPoint' },
                          { value: 'Website Link', label: 'Website Link' },
                          { value: 'YouTube Video', label: 'YouTube Video' },
                          { value: 'Other File', label: 'Other File' }
                        ]}
                        placeholder="Filter by type"
                        triggerClassName="w-[140px]"
                      />
                      <CustomSelect 
                        value={sortBy} 
                        onValueChange={setSortBy}
                        options={[
                          { value: 'recent', label: 'Recent' },
                          { value: 'az', label: 'A-Z' },
                          { value: 'type', label: 'File Type' }
                        ]}
                        placeholder="Sort by"
                        triggerClassName="w-[120px]"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Materials Grid */}
            {isLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
                <p className="text-lg text-token-text-secondary">Loading materials...</p>
              </div>
            ) : sortedMaterials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedMaterials.map((material) => {
                  const IconComponent = getMaterialTypeIcon(material.file_type || 'Other File');
                  return (
                    <Card key={material.id} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-surface">
                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-accent">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1 truncate text-token-text">{material.title}</h4>
                            {material.description && (
                              <p className="text-sm mb-2 line-clamp-2 text-token-text-secondary">{material.description}</p>
                            )}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {material.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">#{tag}</Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-token-text-muted">
                              <Calendar className="h-3 w-3" />
                              Uploaded: {new Date(material.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs bg-transparent" onClick={() => handleOpen(material)}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                          <Button size="sm" variant="outline" className="px-2 bg-transparent" onClick={() => handleEdit(material)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="px-2 hover:bg-red-50 hover:border-red-200 bg-transparent" onClick={() => handleDeleteMaterial(material.id)}>
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-0 shadow-sm bg-surface">
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-surface-accent">
                    <FileText className="h-8 w-8 text-token-text-muted" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-token-text">You haven't added any materials yet.</h3>
                  <p className="mb-6 text-token-text-secondary">Start building your teaching resource library by adding your first material.</p>
                  <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
                    <Button 
                      onClick={handleAddNewMaterial}
                      className="rounded-full px-6 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-text-inverse"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Material
                    </Button>
                  </Dialog>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </TutorLayout>
  );
} 