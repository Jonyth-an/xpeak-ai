import React from 'react'
import { Button, Card } from '@/app/components/ui'

export default function ReviewSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-2xl font-semibold text-text mb-4">
        🧠 Ready to Test Yourself?
      </h2>
      <p className="text-text-muted text-sm mb-6">
        Review your words through quizzes and light games—smart timing, smart learning.
      </p>
      <Card variant="elevated" padding="lg" className="max-w-md mx-auto mt-12">
        <div className="text-3xl mb-4">🚀</div>
        <h3 className="font-semibold text-text mb-2">Smart Review is Coming Soon!</h3>
        <p className="text-text-muted text-sm mb-4">
          Personalized quizzes, memory games, and spaced repetition just for you.
        </p>
        <Button variant="tertiary" disabled>
          Coming Soon
        </Button>
      </Card>
    </section>
  )
} 