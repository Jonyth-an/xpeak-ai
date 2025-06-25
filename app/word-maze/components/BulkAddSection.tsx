import React from 'react'
import { Button, Card, Textarea } from '@/app/components/ui'

export default function BulkAddSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <Card variant="elevated" padding="lg" className="max-w-xl mx-auto">
        <h2 className="text-2xl font-semibold text-text mb-3">
          Learned a bunch of words? Add them all at once.
        </h2>
        <p className="text-text-muted text-sm mb-4">
          Paste one word per line—or separate them with commas. We'll check spelling and save the rest.
        </p>
        <Textarea
          className="mb-4"
          placeholder={`serendipity\nubiquitous\nephemeral`}
          autoResize
          minRows={4}
          maxRows={10}
          showCharacterCount
          maxLength={2000}
        />
        <Button variant="primary" className="w-full">
          + Add Words to My Maze
        </Button>
        <Button variant="outline" className="w-full mt-2">
          Add to Word Maze
        </Button>
      </Card>
    </section>
  )
} 