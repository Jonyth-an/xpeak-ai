"use client"

import React, { useState } from 'react';
import { Button, Input } from '@/app/components/ui';
import { CheckCircle, AlertCircle, Loader2, Mail } from 'lucide-react';

export default function StayConnectedSection() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribeClick = () => {
    setShowEmailForm(true);
    setStatus('idle');
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'community'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
        // Hide the form after 3 seconds
        setTimeout(() => {
          setShowEmailForm(false);
          setStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear status when user starts typing again
    if (status !== 'idle') {
      setStatus('idle');
      setMessage('');
    }
  };

  const handleCancel = () => {
    setShowEmailForm(false);
    setEmail('');
    setStatus('idle');
    setMessage('');
  };

  return (
    <section id="stay-connected" className="py-12 bg-token-surface text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-text mb-4">Stay Connected</h2>
        <p className="mb-6 text-text-tertiary">
          Love being part of the journey? Don't miss an update—subscribe to our newsletter or join our community!
        </p>
        
        <div className="flex justify-center gap-4 flex-wrap mb-6">
          {!showEmailForm ? (
            <button 
              onClick={handleSubscribeClick}
              className="inline-flex items-center gap-2 bg-token-primary hover:bg-token-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Mail className="w-4 h-4" />
              Subscribe via Email
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                className="w-64"
                disabled={status === 'loading'}
              />
              <Button 
                type="submit" 
                variant="primary"
                disabled={status === 'loading'}
                className="px-6 py-3"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Subscribe'
                )}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={status === 'loading'}
                className="px-4 py-3"
              >
                Cancel
              </Button>
            </form>
          )}
          
          <button 
            className="inline-block border border-token-border hover:border-token-primary text-text hover:text-token-primary px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer"
            onClick={() => alert('Community platform coming soon! We\'re setting up the best way for everyone to connect.')}
          >
            Join Community
          </button>
        </div>
        
        {/* Status Messages */}
        {status === 'success' && (
          <div className="flex items-center justify-center gap-2 text-sm text-token-success mb-4">
            <CheckCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex items-center justify-center gap-2 text-sm text-token-error mb-4">
            <AlertCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
        
        <div className="bg-token-surface-subtle rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-text-tertiary">
            <strong>Community Update:</strong> We're currently setting up our community platform. 
            We're considering Slack, Discord, or a dedicated community platform. 
            Subscribe to our newsletter to be notified when it's ready!
          </p>
        </div>
      </div>
    </section>
  );
} 