'use client';
import React from 'react';
import { Button, Card, Badge } from '@/app/components/ui';
import TopicSampleCard from '../../components/molecules/TopicSampleCard';

export default function TopicSampleSection() {
  const generatedTopic = {
    text: "Ordering Coffee Around the World - A conversation about different coffee cultures, how to order in various countries, and the unique coffee traditions that make each place special. From the strong Turkish coffee to the delicate Japanese pour-over, explore the world through its coffee customs.",
    vocab: ['espresso', 'latte', 'barista', 'menu', 'order', 'culture', 'traditions']
  };

  const handleBook = () => {
    console.log('Book tutor for this topic');
    // Add your booking logic here
  };

  const handleAddToLesson = () => {
    console.log('Add to current reservation');
    // Add your lesson logic here
  };

  const handleSaveTopic = () => {
    console.log('Save topic for later');
    // Add your save logic here
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <TopicSampleCard
          sampleText={generatedTopic.text}
          vocabWords={generatedTopic.vocab}
          onBookTutor={handleBook}
          onAddToLesson={handleAddToLesson}
          onSave={handleSaveTopic}
        />
      </div>
    </section>
  );
} 