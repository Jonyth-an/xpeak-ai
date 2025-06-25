'use client';
import React from 'react';
import { Button, Card, Badge } from '@/app/components/ui';

const sampleWords = [
  { word: 'Serendipity', when: '3 days ago', def: 'The occurrence of events by chance in a happy way.', example: 'Finding this café was true serendipity.', tag: 'Personal' },
  { word: 'Ubiquitous', when: '1 week ago', def: 'Present, appearing, or found everywhere.', example: 'Smartphones are ubiquitous in modern life.', tag: 'Technology' },
  { word: 'Ephemeral', when: '2 weeks ago', def: 'Lasting for a very short time.', example: 'Cherry blossoms are ephemeral.', tag: 'Nature' },
];

export default function CollectionSection() {
  const collections = [
    {
      id: 1,
      name: 'Travel Essentials',
      description: 'Essential vocabulary for traveling abroad',
      wordCount: 150,
      tags: ['Travel', 'Beginner'],
      image: '/images/collections/travel.jpg'
    },
    {
      id: 2,
      name: 'Business English',
      description: 'Professional vocabulary for the workplace',
      wordCount: 200,
      tags: ['Business', 'Intermediate'],
      image: '/images/collections/business.jpg'
    },
    {
      id: 3,
      name: 'Food & Dining',
      description: 'Restaurant and cooking vocabulary',
      wordCount: 120,
      tags: ['Food', 'Beginner'],
      image: '/images/collections/food.jpg'
    },
    {
      id: 4,
      name: 'Academic Writing',
      description: 'Formal writing and academic vocabulary',
      wordCount: 180,
      tags: ['Academic', 'Advanced'],
      image: '/images/collections/academic.jpg'
    }
  ];

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Curated Word Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore themed collections of words carefully curated by language experts to help you learn efficiently.
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {collections.map((collection) => (
            <Card key={collection.id} variant="elevated" padding="md" className="text-center">
              {/* Image */}
              <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-white text-2xl">📚</span>
              </div>

              {/* Content */}
              <h3 className="font-semibold text-gray-900 mb-2">{collection.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
              
              {/* Tags */}
              <div className="flex justify-center gap-1 mb-4">
                {collection.tags.map((tag, i) => (
                  <Badge key={i} variant="accent" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Word Count */}
              <p className="text-sm text-gray-500 mb-4">{collection.wordCount} words</p>

              {/* CTA */}
              <Button variant="accent" size="sm" className="w-full">
                Start Learning
              </Button>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button variant="accent" size="lg">
            Browse All Collections
          </Button>
        </div>
      </div>
    </section>
  );
} 