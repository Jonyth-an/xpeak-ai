'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Text, Button } from '@/app/components/ui';

const CATEGORIES = [
  'Lesson Plans',
  'Worksheets',
  'Video Resources',
  'Assessment Tools',
  'Other',
];

function getFileType(file: File) {
  if (file.type.startsWith('image/')) return 'Image';
  if (file.type.startsWith('video/')) return 'Video';
  if (file.type === 'application/pdf') return 'PDF';
  return 'Other';
}

export default function TutorOnboardingMaterials() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).map(file => ({
      file,
      title: file.name.replace(/\.[^/.]+$/, ''),
      description: '',
      tags: '',
      category: '',
      type: getFileType(file),
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemove = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMetaChange = (idx: number, field: string, value: string) => {
    setFiles(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));
  };

  const handleContinue = async () => {
    setSaving(true);
    // TODO: Upload files and metadata via API
    setTimeout(() => {
      setSaving(false);
      router.push('/tutor/onboarding/video-test');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-token-surface">
      <Card className="max-w-xl w-full p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Text variant="h2" className="text-token-primary mb-2">Upload Teaching Materials</Text>
          <Text variant="body" className="text-token-text-primary">
            Add your first lesson plans, worksheets, or video resources. You can always upload more later.
          </Text>
        </div>
        <div className="mb-6 flex items-center justify-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div className="bg-token-primary h-2 rounded-full" style={{ width: '80%' }}></div>
          </div>
          <span className="text-xs text-token-text-secondary ml-2">Step 4 of 5</span>
        </div>
        <div className="mb-6">
          <div
            className="border-2 border-dashed border-token-primary rounded-lg p-6 text-center cursor-pointer bg-token-surface hover:bg-token-primary/5 transition"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
          >
            <Text variant="body" className="text-token-text-secondary">
              Drag and drop files here, or <span className="text-token-primary underline">browse</span>
            </Text>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,image/*,video/*"
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
            />
          </div>
        </div>
        {files.length > 0 && (
          <div className="mb-6 space-y-4">
            {files.map((f, idx) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50 relative">
                <button
                  type="button"
                  className="absolute top-2 right-2 text-xs text-red-500 hover:underline"
                  onClick={() => handleRemove(idx)}
                >
                  Remove
                </button>
                <div className="mb-2 font-medium text-token-primary">{f.file.name} <span className="text-xs text-token-text-secondary">({f.type})</span></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                    value={f.title}
                    onChange={e => handleMetaChange(idx, 'title', e.target.value)}
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    className="p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                    value={f.tags}
                    onChange={e => handleMetaChange(idx, 'tags', e.target.value)}
                    placeholder="Tags (comma separated)"
                  />
                  <select
                    className="p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                    value={f.category}
                    onChange={e => handleMetaChange(idx, 'category', e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="p-2 border border-token rounded-md bg-token-surface focus:outline-none focus:ring-2 focus:ring-token-primary"
                    value={f.description}
                    onChange={e => handleMetaChange(idx, 'description', e.target.value)}
                    placeholder="Description"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={saving}
            onClick={handleContinue}
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => router.push('/tutor/onboarding/video-test')}
            disabled={saving}
          >
            Skip for Now
          </Button>
        </div>
      </Card>
    </div>
  );
} 