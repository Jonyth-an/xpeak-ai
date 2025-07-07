"use client"

import { useState } from 'react'
import { Button, Input } from '@/app/components/ui'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface NewsletterSubscriptionProps {
  source?: string;
  className?: string;
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  errorMessage?: string
}

export default function NewsletterSubscription({
  source = 'footer',
  className = '',
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  successMessage = 'Successfully subscribed!',
  errorMessage = 'Failed to subscribe. Please try again.'
}: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || successMessage)
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || errorMessage)
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setStatus('error')
      setMessage(errorMessage)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    // Clear status when user starts typing again
    if (status !== 'idle') {
      setStatus('idle')
      setMessage('')
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex">
        <Input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder={placeholder}
          className="rounded-r-none"
          disabled={status === 'loading'}
        />
        <Button 
          type="submit" 
          variant="primary" 
          size="sm" 
          className="rounded-l-none"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            buttonText
          )}
        </Button>
      </form>
      
      {status === 'success' && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}
    </div>
  )
} 